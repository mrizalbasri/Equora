"""Short-lived admin sessions; the configured master token never enters a cookie."""

import hashlib
import hmac
import re
import secrets
import time

from fastapi import Header, HTTPException, Request

SESSION_COOKIE = "equora_admin_session"
SESSION_SECONDS = 3600
SESSION_PATTERN = re.compile(r"[0-9]{1,12}\.[0-9a-f]{64}\.[0-9a-f]{64}", re.ASCII)


def _secret(request: Request) -> str:
    configured = request.app.state.settings.admin_token
    return configured.get_secret_value() if configured else ""


def _unauthorized():
    raise HTTPException(
        401,
        "Token atau sesi admin tidak valid. Silakan masuk kembali.",
        headers={"WWW-Authenticate": "Bearer", "Cache-Control": "no-store"},
    )


def require_admin_token(request: Request, authorization: str | None = Header(default=None)):
    secret = _secret(request)
    if not secret or not secrets.compare_digest(
        (authorization or "").encode(), ("Bearer " + secret).encode()
    ):
        _unauthorized()


def _signature(payload: str, secret: str) -> str:
    return hmac.new(
        secret.encode(), ("equora-admin-v1:" + payload).encode(), hashlib.sha256
    ).hexdigest()


def create_session(request: Request) -> str:
    payload = f"{int(time.time()) + SESSION_SECONDS}.{secrets.token_hex(32)}"
    return payload + "." + _signature(payload, _secret(request))


def require_admin_session(request: Request):
    secret = _secret(request)
    token = request.cookies.get(SESSION_COOKIE, "")
    if not secret or len(token) > 256 or not SESSION_PATTERN.fullmatch(token):
        _unauthorized()
    expires, nonce, signature = token.split(".")
    if int(expires) <= time.time() or not secrets.compare_digest(
        signature, _signature(expires + "." + nonce, secret)
    ):
        _unauthorized()


def require_admin(request: Request, authorization: str | None = Header(default=None)):
    # Explicit Bearer clients remain supported; browser imports use a session.
    if authorization:
        require_admin_token(request, authorization)
    else:
        require_admin_session(request)
