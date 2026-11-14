import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from lib import auth
from lib.db import db
from models.event import DonationUpdate, Event, EventCreate, EventUpdate, EventType

router = APIRouter()


def _aware(dt: datetime) -> datetime:
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


async def _registration_counts() -> dict[str, int]:
    rows = await db.registrations.aggregate(
        [{"$group": {"_id": "$event_id", "count": {"$sum": 1}}}]
    ).to_list(10000)
    return {row["_id"]: row["count"] for row in rows}


async def _build_event(doc: dict, counts: dict[str, int]) -> Event:
    doc["registration_count"] = counts.get(doc["id"], 0)
    if isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = _aware(doc["created_at"])
    return Event(**doc)


async def _get_event_or_404(event_id: str) -> Event:
    doc = await db.events.find_one({"id": event_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Kegiatan tidak ditemukan")
    counts = await _registration_counts()
    return await _build_event(doc, counts)


@router.get("/events", response_model=list[Event])
async def list_events(category: EventType | None = None, search: str | None = None):
    """Public: published events only, soonest first."""
    query: dict = {"is_published": True}
    if category:
        query["type"] = category
    if search and search.strip():
        escaped = re.escape(search.strip())
        query["$or"] = [
            {"title": {"$regex": escaped, "$options": "i"}},
            {"description": {"$regex": escaped, "$options": "i"}},
        ]
    docs = await db.events.find(query).sort([("start_date", 1)]).to_list(1000)
    counts = await _registration_counts()
    return [await _build_event(doc, counts) for doc in docs]


@router.get("/admin/events", response_model=list[Event])
async def list_all_events(user: dict = Depends(auth.require_admin)):
    """Admin: every event including drafts, newest created first."""
    docs = await db.events.find().sort([("created_at", -1)]).to_list(1000)
    counts = await _registration_counts()
    return [await _build_event(doc, counts) for doc in docs]


@router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    return await _get_event_or_404(event_id)


@router.post("/events", response_model=Event, status_code=201)
async def create_event(body: EventCreate, user: dict = Depends(auth.require_admin)):
    event = Event(**body.model_dump())
    await db.events.insert_one(event.model_dump())
    return event


@router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, body: EventUpdate, user: dict = Depends(auth.require_admin)):
    await _get_event_or_404(event_id)
    updates = body.model_dump(exclude_unset=True)
    if updates:
        await db.events.update_one({"id": event_id}, {"$set": updates})
    return await _get_event_or_404(event_id)


@router.patch("/events/{event_id}/donation", response_model=Event)
async def update_donation(event_id: str, body: DonationUpdate, user: dict = Depends(auth.require_admin)):
    event = await _get_event_or_404(event_id)
    if event.type != "donasi":
        raise HTTPException(status_code=400, detail="Kegiatan ini bukan penggalangan donasi")
    await db.events.update_one(
        {"id": event_id}, {"$set": {"donation_collected": body.donation_collected}}
    )
    return await _get_event_or_404(event_id)


@router.delete("/events/{event_id}", status_code=204)
async def delete_event(event_id: str, user: dict = Depends(auth.require_admin)):
    await _get_event_or_404(event_id)
    await db.events.delete_one({"id": event_id})
    await db.registrations.delete_many({"event_id": event_id})
