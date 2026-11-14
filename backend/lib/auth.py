"""Auth helpers: password hashing, session tokens, admin dependency.

Sessions are httpOnly cookies — no tokens in JSON, ever.
"""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, Response
from passlib.context import CryptContext

from lib.db import db

COOKIE_NAME = "mk_session"
SESSION_TTL_DAYS = 30

pwd_context = CryptContext(schemes=["pbkdf2_sha256"])


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(password, hashed)
    except Exception:
        return False


async def create_session(user_id: str, response: Response) -> str:
    token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)
    await db.sessions.insert_one({"token": token, "user_id": user_id, "expires_at": expires_at})
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=SESSION_TTL_DAYS * 24 * 60 * 60,
        path="/",
    )
    return token


async def destroy_session(request: Request, response: Response) -> None:
    token = request.cookies.get(COOKIE_NAME)
    if token:
        await db.sessions.delete_one({"token": token})
    response.delete_cookie(COOKIE_NAME, path="/")


async def require_admin(request: Request) -> dict:
    """FastAPI dependency: 401 unless a valid, unexpired admin session cookie rides the request."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Belum masuk sebagai takmir")
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Sesi tidak valid")
    expires_at = session.get("expires_at")
    if isinstance(expires_at, datetime):
        if expires_at.tzinfo is None:  # motor hands back naive datetimes — normalise
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Sesi kedaluwarsa, silakan masuk kembali")
    user = await db.users.find_one({"id": session["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="Pengguna tidak ditemukan")
    return user
