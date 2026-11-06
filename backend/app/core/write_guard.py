"""Bound local write payloads and avoid concurrent solver/import work."""

import asyncio
from collections import defaultdict, deque
from time import monotonic

from starlette.responses import JSONResponse

SERIALIZED_PATHS = {"/api/v1/scenarios", "/api/v1/admin/import"}


class WriteGuard:
    def __init__(self, app, origins, requests_per_minute=60, lock_timeout=2.0):
        self.app = app
        self.origins = set(origins)
        self.lock = asyncio.Lock()
        self.lock_timeout = lock_timeout
        self.requests_per_minute = requests_per_minute
        # ponytail: per-IP in-memory sliding window; upgrade to Redis for multi-replica
        self.requests: dict[str, deque[float]] = defaultdict(deque)

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["method"] != "POST":
            return await self.app(scope, receive, send)
        headers = dict(scope["headers"])
        origin = headers.get(b"origin")
        if origin and origin.decode() not in self.origins:
            return await JSONResponse({"detail": "Origin tidak diizinkan"}, 403)(
                scope, receive, send
            )
        client = (scope.get("client") or ("local",))[0]
        now = monotonic()
        bucket = self.requests[client]
        while bucket and bucket[0] <= now - 60:
            bucket.popleft()
        if not bucket:
            self.requests.pop(client, None)
            bucket = self.requests[client]
        if len(bucket) >= self.requests_per_minute:
            return await JSONResponse(
                {"detail": "Batas permintaan tercapai. Coba lagi dalam satu menit."},
                429,
                headers={"Retry-After": "60"},
            )(scope, receive, send)
        bucket.append(now)
        chunks = []
        size = 0
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            size += len(message.get("body", b""))
            if size > 65536:
                return await JSONResponse({"detail": "Input terlalu besar"}, 413)(
                    scope, receive, send
                )
            chunks.append(message.get("body", b""))
            if not message.get("more_body"):
                break
        body = b"".join(chunks)

        async def replay():
            return {"type": "http.request", "body": body, "more_body": False}

        path = scope.get("path", "").rstrip("/")
        if path not in SERIALIZED_PATHS:
            return await self.app(scope, replay, send)
        try:
            await asyncio.wait_for(self.lock.acquire(), timeout=self.lock_timeout)
        except TimeoutError:
            return await JSONResponse(
                {"detail": "Perhitungan lain sedang berjalan"}, 429, headers={"Retry-After": "1"}
            )(scope, replay, send)
        try:
            await self.app(scope, replay, send)
        finally:
            self.lock.release()
