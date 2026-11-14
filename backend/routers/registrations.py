from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from lib import auth
from lib.db import db
from models.registration import Registration, RegistrationCreate

router = APIRouter()


def _aware(doc: dict) -> Registration:
    if isinstance(doc.get("created_at"), datetime) and doc["created_at"].tzinfo is None:
        doc["created_at"] = doc["created_at"].replace(tzinfo=timezone.utc)
    return Registration(**doc)


@router.post("/events/{event_id}/registrations", response_model=Registration, status_code=201)
async def create_registration(event_id: str, body: RegistrationCreate):
    """Public: register for an event (nama, WA, alamat, catatan)."""
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Kegiatan tidak ditemukan")
    if not event.get("is_published", False):
        raise HTTPException(status_code=400, detail="Pendaftaran kegiatan ini belum dibuka")
    registration = Registration(event_id=event_id, **body.model_dump())
    await db.registrations.insert_one(registration.model_dump())
    return registration


@router.get("/events/{event_id}/registrations", response_model=list[Registration])
async def list_registrations(event_id: str, user: dict = Depends(auth.require_admin)):
    docs = (
        await db.registrations.find({"event_id": event_id})
        .sort([("created_at", -1)])
        .to_list(1000)
    )
    return [_aware(doc) for doc in docs]


@router.delete("/registrations/{registration_id}", status_code=204)
async def delete_registration(registration_id: str, user: dict = Depends(auth.require_admin)):
    await db.registrations.delete_one({"id": registration_id})
