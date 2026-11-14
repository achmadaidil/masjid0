from fastapi import APIRouter, Depends, HTTPException, Request, Response

from lib import auth
from lib.db import db
from models.user import LoginRequest, SessionUser

router = APIRouter()


@router.post("/auth/login", response_model=SessionUser)
async def login(body: LoginRequest, response: Response):
    user = await db.users.find_one({"username": body.username})
    if not user or not auth.verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Username atau kata sandi salah")
    await auth.create_session(user["id"], response)
    return SessionUser(**user)


@router.post("/auth/logout", status_code=204)
async def logout(request: Request, response: Response):
    await auth.destroy_session(request, response)


@router.get("/auth/me", response_model=SessionUser)
async def me(user: dict = Depends(auth.require_admin)):
    return SessionUser(**user)
