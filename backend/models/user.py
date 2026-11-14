import uuid

from pydantic import BaseModel, Field


class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    name: str
    password_hash: str


class SessionUser(BaseModel):
    id: str
    username: str
    name: str


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)
