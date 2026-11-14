import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, Field


class Registration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    name: str
    whatsapp: str
    address: str = ""
    notes: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RegistrationCreate(BaseModel):
    name: str = Field(min_length=1)
    whatsapp: str = Field(min_length=1)
    address: str = ""
    notes: str = ""
