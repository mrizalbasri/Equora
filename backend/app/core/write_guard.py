"""Bound local write payloads and avoid concurrent solver/import work."""

import asyncio

from starlette.responses import JSONResponse


class WriteGuard:
    def __init__(self, app, origins):
        self.app = app
        self.origins = set(origins)
        self.lock = asyncio.Lock()

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["method"] != "POST":
            return await self.app(scope, receive, send)
        headers = dict(scope["headers"])
        origin = headers.get(b"origin")
        if origin and origin.decode() not in self.origins:
            return await JSONResponse({"detail": "Origin tidak diizinkan"}, 403)(
                scope, receive, send
            )
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

        if self.lock.locked():
            return await JSONResponse({"detail": "Perhitungan lain sedang berjalan"}, 429)(
                scope, replay, send
            )
        async with self.lock:
            await self.app(scope, replay, send)
