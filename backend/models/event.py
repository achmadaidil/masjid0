import uuid
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field

EventType = Literal["kajian", "donasi", "sosial", "pelatihan", "peringatan"]

DATE_PATTERN = r"^\d{4}-\d{2}-\d{2}$"


class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    type: EventType = "kajian"
    description: str = ""
    location: str = ""
    start_date: str = Field(pattern=DATE_PATTERN)
    start_time: str = ""  # HH:MM, optional
    image_url: str | None = None
    is_published: bool = True
    donation_target: float | None = None
    donation_collected: float = Field(default=0.0, ge=0)
    registration_count: int = 0  # filled by the router, never stored
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class EventCreate(BaseModel):
    title: str = Field(min_length=1)
    type: EventType = "kajian"
    description: str = ""
    location: str = ""
    start_date: str = Field(pattern=DATE_PATTERN)
    start_time: str = ""
    image_url: str | None = None
    is_published: bool = True
    donation_target: float | None = None
    donation_collected: float = Field(default=0.0, ge=0)


class EventUpdate(BaseModel):
    title: str | None = None
    type: EventType | None = None
    description: str | None = None
    location: str | None = None
    start_date: str | None = Field(default=None, pattern=DATE_PATTERN)
    start_time: str | None = None
    image_url: str | None = None
    is_published: bool | None = None
    donation_target: float | None = None
    donation_collected: float | None = Field(default=None, ge=0)


class DonationUpdate(BaseModel):
    donation_collected: float = Field(ge=0)
