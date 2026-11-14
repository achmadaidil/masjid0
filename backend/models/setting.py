from datetime import datetime

from pydantic import BaseModel


class AppSettings(BaseModel):
    key: str = "app"
    mosque_name: str = "Masjid Kita"
    mosque_address: str = ""
    wa_admin_number: str = ""
    bank_info: str = ""
    updated_at: datetime | None = None


class SettingsUpdate(BaseModel):
    mosque_name: str | None = None
    mosque_address: str | None = None
    wa_admin_number: str | None = None
    bank_info: str | None = None
