# SPEC — Masjid Kita

Aplikasi web (Bahasa Indonesia) untuk menampilkan ragam kegiatan masjid, pendaftaran
event online, program donasi dengan progress bar, dan kontak takmir via WhatsApp.

Preview URL: https://masjid-kita--0xeat0j1.preview.emergentagent.com (frontend port 3000, API port 8001 di balik proxy /api).

## Data model (MongoDB, db "app")
- `events` — Event: `id` (uuid4 string), `title`, `type` (kajian|donasi|sosial|pelatihan|peringatan), `description`, `location`, `start_date` (YYYY-MM-DD), `start_time` (HH:MM, boleh kosong), `image_url`, `is_published` (bool — WAJIB tersimpan; query publik memfilternya), `donation_target` (float|null), `donation_collected` (float), `registration_count` (dihitung router, tidak disimpan), `created_at`.
- `registrations` — Registration: `id`, `event_id`, `name`, `whatsapp`, `address`, `notes`, `created_at`.
- `settings` — AppSettings (satu dokumen key="app"): `mosque_name`, `mosque_address`, `wa_admin_number` (default seed 08170223635), `bank_info`, `updated_at`.
- `users` — akun admin takmir: `id`, `username` (unique), `name`, `password_hash` (passlib pbkdf2_sha256).
- `sessions` — sesi login: `token` (unique), `user_id`, `expires_at` (aware UTC, TTL 30 hari).

## API (semua di api_router, prefix /api)
- Publik: `GET /events` (published saja; query `category`, `search`), `GET /events/{id}`, `POST /events/{id}/registrations` (201; event draft → 400), `GET /settings`.
- Auth: `POST /auth/login` (set cookie httpOnly `mk_session`), `POST /auth/logout` (204, hapus cookie+sesi), `GET /auth/me` (401 bila belum login).
- Admin (butuh cookie sesi): `GET /admin/events` (termasuk draft), `POST /events`, `PUT /events/{id}`, `DELETE /events/{id}` (hapus + pendaftarnya), `PATCH /events/{id}/donation` (update `donation_collected`; hanya event donasi), `GET /events/{id}/registrations`, `DELETE /registrations/{id}`, `PUT /settings`.

## Halaman frontend (React 19 + TanStack Query + shadcn base-nova)
- `/` — hero islami (hijau zamrud/krem/emas, font Lora + Plus Jakarta Sans), strip kegiatan terdekat, grid kegiatan, spotlight donasi, profil & kontak.
- `/events` — katalog + filter kategori (pill) + pencarian (query `?category=donasi` didukung).
- `/events/:id` — detail kegiatan, progress donasi (bila tipe donasi), formulir pendaftaran (nama, WA, alamat, catatan) → sukses: kode tiket + tombol konfirmasi WhatsApp.
- `/login` — panel takmir (split branded).
- `/admin` — dashboard terproteksi: KPI, CRUD kegiatan (dialog, toggle publish, update dana donasi), data pendaftar per event (+CSV, chat WA per pendaftar), pengaturan (nomor WA admin, profil masjid, rekening donasi).
- Tombol WhatsApp mengapung (`floating-whatsapp-btn`) di SEMUA halaman via wa.me (normalisasi 08… → 628…).

## Auth
- Cookie httpOnly `mk_session`; dependency `require_admin` di backend/lib/auth.py. Frontend: `lib/session.ts` (`useSession`, `beginSession`, `endSession` — endSession menghapus cache react-query).

## Seed
`cd /app/backend && python seed.py` — idempoten: akun admin, pengaturan, 7 kegiatan (1 draft), 2 pendaftar contoh. Kredensial di memory/test_credentials.md.
