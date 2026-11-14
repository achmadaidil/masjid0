from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from lib import auth
from lib.db import db
from models.setting import AppSettings, SettingsUpdate

router = APIRouter()


async def _get_settings() -> AppSettings:
    doc = await db.settings.find_one({"key": "app"})
    if not doc:
        return AppSettings()
    doc.pop("_id", None)
    return AppSettings(**doc)


@router.get("/settings", response_model=AppSettings)
async def get_settings():
    """Public: mosque profile + admin WhatsApp number for the floating button."""
    return await _get_settings()


@router.put("/settings", response_model=AppSettings)
async def update_settings(body: SettingsUpdate, user: dict = Depends(auth.require_admin)):
    payload = body.model_dump(exclude_none=True)
    payload["updated_at"] = datetime.now(timezone.utc)
    await db.settings.update_one({"key": "app"}, {"$set": payload}, upsert=True)
    return await _get_settings()
