"""Seed admin, settings, and sample events. Run: cd /app/backend && python seed.py"""

import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from lib.auth import hash_password
from lib.db import db, ensure_indexes

TZ = ZoneInfo("Asia/Jakarta")

IMG_KAJIAN = "https://images.unsplash.com/photo-1574246604907-db69e30ddb97?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_AERIAL = "https://images.unsplash.com/photo-1537181534458-45dcee76ae90?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_CHARITY = "https://images.unsplash.com/photo-1655438806765-d70d1443dfa9?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_CHILDREN = "https://images.unsplash.com/photo-1629273229664-11fabc0becc0?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_HERO = "https://images.unsplash.com/photo-1590075865003-e48277faa558?crop=entropy&cs=srgb&fm=jpg&q=85"


def _d(offset_days: int) -> str:
    return (datetime.now(TZ) + timedelta(days=offset_days)).strftime("%Y-%m-%d")


def _event(**kwargs) -> dict:
    kwargs.setdefault("id", str(uuid.uuid4()))
    kwargs.setdefault("is_published", True)  # must be stored explicitly — public queries filter on it
    kwargs.setdefault("created_at", datetime.now(timezone.utc))
    return kwargs


EVENTS = [
    _event(
        title="Kajian Subuh Berkah: Tafsir Al-Qur'an",
        type="kajian",
        description=(
            "Kajian rutin memahami tafsir Al-Qur'an bersama ustadz pembina masjid. "
            "Dilanjutkan sarapan bersama jamaah. Terbuka untuk umum, ruang jamaah laki-laki "
            "dan perempuan tersedia terpisah."
        ),
        location="Ruang Utama Masjid Kita",
        start_date=_d(2),
        start_time="05:30",
        image_url=IMG_KAJIAN,
    ),
    _event(
        title="Peringatan Nuzulul Qur'an & Tabligh Akbar",
        type="peringatan",
        description=(
            "Tabligh akbar memperingati Nuzulul Qur'an bersama pemateri nasional. "
            "Dilanjutkan isoma', doa bersama, dan pembagian 500 paket takjil untuk jamaah. "
            "Antar jemput tersedia untuk lansia."
        ),
        location="Lapangan Utama Masjid Kita",
        start_date=_d(12),
        start_time="19:00",
        image_url=IMG_AERIAL,
    ),
    _event(
        title="Wakaf Karpet Masjid & Renovasi Tempat Wudhu",
        type="donasi",
        description=(
            "Penggalangan dana penggantian karpet permanen ruang shalat utama dan renovasi "
            "total tempat wudhu. Laporan keuangan dibuka setiap pekan melalui grup WhatsApp "
            "takmir dan papan informasi masjid."
        ),
        location="Masjid Kita",
        start_date=_d(20),
        start_time="08:00",
        image_url=IMG_CHARITY,
        donation_target=50_000_000,
        donation_collected=32_500_000,
    ),
    _event(
        title="Santunan 100 Anak Yatim & Dhuafa",
        type="donasi",
        description=(
            "Program santunan semi-tahunan untuk 100 anak yatim dan keluarga dhuafa di "
            "sekitar masjid: bantuan pendidikan, paket sembako, dan fasilitas kesehatan dasar. "
            "Setiap rupiah tercatat dan dilaporkan."
        ),
        location="Aula Bawah Masjid Kita",
        start_date=_d(9),
        start_time="09:00",
        image_url=IMG_CHARITY,
        donation_target=25_000_000,
        donation_collected=6_750_000,
    ),
    _event(
        title="Pelatihan Tahsin & Bahasa Arab Intensif",
        type="pelatihan",
        description=(
            "Kelas intensif tahsin Al-Qur'an dan bahasa Arab dasar selama 8 pekan untuk remaja "
            "dan dewasa. Dibimbing pengajar bersanad. Kuota 40 peserta — pendaftaran wajib "
            "melalui formulir kegiatan ini."
        ),
        location="Ruang Kelas Lantai 2",
        start_date=_d(5),
        start_time="16:00",
        image_url=IMG_CHILDREN,
    ),
    _event(
        title="Bazar UMKM Ramadhan Masjid Kita",
        type="sosial",
        description=(
            "Bazar kuliner dan produk UMKM jamaah sepanjang pekan pertama Ramadhan. Stand "
            "gratis untuk pedagang dhuafa. Pedagang yang berminat dapat mendaftar melalui "
            "formulir kegiatan ini."
        ),
        location="Pelataran Masjid Kita",
        start_date=_d(30),
        start_time="07:00",
        image_url=IMG_HERO,
    ),
    _event(
        title="Gotong Royong Bersih Lingkungan Masjid",
        type="sosial",
        description=(
            "Kerja bakti bulanan membersihkan area masjid dan lingkungan sekitar. "
            "Ditutup dengan makan siang bersama. (Masih draf — belum dipublikasikan.)"
        ),
        location="Masjid Kita & Sekitarnya",
        start_date=_d(15),
        start_time="07:00",
        is_published=False,
    ),
]


async def seed() -> None:
    # Admin account
    if not await db.users.find_one({"username": "admin"}):
        await db.users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "username": "admin",
                "name": "Takmir Masjid",
                "password_hash": hash_password("admin123"),
            }
        )
        print("- Akun admin dibuat: admin / admin123")
    else:
        print("- Akun admin sudah ada, dilewati")

    # Settings (WhatsApp admin + profil masjid)
    await db.settings.update_one(
        {"key": "app"},
        {
            "$set": {
                "mosque_name": "Masjid Kita",
                "mosque_address": "Jl. Melati Raya No. 12, Kelurahan Sukamaju, Jakarta Selatan",
                "wa_admin_number": "08170223635",
                "bank_info": "Bank Muamalat 3010123456 a.n. Yayasan Masjid Kita (bisa QRIS di sekretariat)",
            }
        },
        upsert=True,
    )
    print("- Pengaturan masjid & nomor WhatsApp admin disiapkan")

    # Events — only when the collection is still empty (idempotent)
    if await db.events.count_documents({}) == 0:
        await db.events.insert_many(EVENTS)
        print(f"- {len(EVENTS)} kegiatan contoh ditambahkan")
    else:
        print("- Kegiatan sudah ada, dilewati")

    # A few sample registrations so the dashboard is not empty
    karpet = await db.events.find_one({"title": "Wakaf Karpet Masjid & Renovasi Tempat Wudhu"})
    if karpet and await db.registrations.count_documents({"event_id": karpet["id"]}) == 0:
        await db.registrations.insert_many(
            [
                {
                    "id": str(uuid.uuid4()),
                    "event_id": karpet["id"],
                    "name": "H. Ahmad Fauzi",
                    "whatsapp": "081234567890",
                    "address": "Jl. Melati Raya No. 5, Sukamaju",
                    "notes": "Bismillah, semoga menjadi amal jariyah yang mengalir.",
                    "created_at": datetime.now(timezone.utc),
                },
                {
                    "id": str(uuid.uuid4()),
                    "event_id": karpet["id"],
                    "name": "Siti Aminah",
                    "whatsapp": "082198765432",
                    "address": "Perum Griya Asri Blok C2",
                    "notes": "Ingin berwakaf berupa 2 roll karpet.",
                    "created_at": datetime.now(timezone.utc),
                },
            ]
        )
        print("- Pendaftar contoh ditambahkan")

    await ensure_indexes()
    print("Seed selesai.")


if __name__ == "__main__":
    asyncio.run(seed())
