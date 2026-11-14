import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, MoonStar, Users } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { buttonVariants } from "@/components/ui/button";
import DonationProgressBar from "@/components/DonationProgressBar";
import EventCard from "@/components/EventCard";
import { apiGet } from "@/lib/api";
import { formatDateID, formatRupiah, formatTimeID } from "@/lib/format";
import { useSettings } from "@/lib/settings";
import { waLink } from "@/lib/wa";
import type { Event } from "@/lib/types";

function EventSkeleton() {
  return <div className="h-80 animate-pulse rounded-2xl bg-[#F0EFE6]" data-testid="event-skeleton" />;
}

export default function Home() {
  const { data: settings } = useSettings();
  const eventsQ = useQuery({
    queryKey: ["events", "all", ""],
    queryFn: () => apiGet<Event[]>("/events"),
    retry: false,
  });

  const events = eventsQ.data ?? [];
  const upcoming = events.slice(0, 6);
  const donations = events.filter((e) => e.type === "donasi").slice(0, 2);
  const totalDana = events
    .filter((e) => e.type === "donasi")
    .reduce((sum, e) => sum + (e.donation_collected || 0), 0);
  const totalPendaftar = events.reduce((sum, e) => sum + (e.registration_count || 0), 0);
  const waHref = waLink(settings?.wa_admin_number || "", "Assalamu'alaikum Admin, saya ingin bertanya tentang kegiatan masjid.");

  return (
    <div>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1590075865003-e48277faa558?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Masjid agung dengan kubah putih"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(8,30,23,0.93)] via-[rgba(13,49,38,0.86)] to-[rgba(19,84,56,0.72)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#135438] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#F9F8F3]">
              <MoonStar size={14} className="text-[#F3CE72]" />
              Ahlan wa Sahlan — Selamat Datang
            </span>
            <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {settings?.mosque_name || "Masjid Kita"} — Rumah Kegiatan Umat
            </h1>
            <p className="mt-2 font-serif text-lg italic tracking-wide text-[#F3CE72]">
              Bismillahirrahmanirrahim — mari memakmurkan masjid bersama-sama.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#D6E4DE]">
              Temukan jadwal kajian, pelatihan, dan program sosial. Daftar kegiatan secara online,
              salurkan donasi, dan hubungi takmir langsung melalui WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/events"
                data-testid="hero-events-cta"
                className={buttonVariants({ size: "lg" }) + " bg-[#C4973B] text-white hover:bg-[#8A6615]"}
              >
                Lihat Ragam Kegiatan
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/events?category=donasi"
                data-testid="hero-donation-cta"
                className={
                  buttonVariants({ variant: "outline", size: "lg" }) +
                  " border-[#F3CE72] bg-white/10 text-[#F3CE72] hover:bg-white/20 hover:text-[#F3CE72]"
                }
              >
                Program Donasi
              </Link>
            </div>
          </div>

          {/* Upcoming highlight strip */}
          <div className="mt-12 grid gap-3 sm:grid-cols-3" data-testid="hero-highlight-strip">
            {eventsQ.isPending
              ? [0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/10" />)
              : events.slice(0, 3).map((e) => (
                  <Link
                    key={e.id}
                    to={`/events/${e.id}`}
                    data-testid="hero-highlight-item"
                    className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <p className="truncate text-sm font-semibold text-white">{e.title}</p>
                    <p className="mt-0.5 text-xs text-[#D6E4DE]">
                      {formatDateID(e.start_date)}
                      {e.start_time ? ` • ${formatTimeID(e.start_time)}` : ""}
                    </p>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ===== Ragam kegiatan ===== */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-[#0D2E24] sm:text-3xl">
              Ragam Kegiatan Terdekat
            </h2>
            <p className="mt-2 text-stone-600">Kajian, pelatihan, hingga bazar — semua terbuka untuk umat.</p>
          </div>
          <Link
            to="/events"
            data-testid="home-view-all-events"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#135438] hover:underline"
          >
            Lihat Semua Kegiatan
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="home-events-grid">
          {eventsQ.isPending
            ? [0, 1, 2, 3, 4, 5].map((i) => <EventSkeleton key={i} />)
            : upcoming.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
        {!eventsQ.isPending && !eventsQ.isError && events.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-[#E5E1D5] bg-white p-8 text-center text-stone-600">
            Belum ada kegiatan yang dijadwalkan. Nantikan info terbaru, insyaAllah.
          </p>
        ) : null}
        {eventsQ.isError ? (
          <p className="mt-8 rounded-2xl border border-[#E5E1D5] bg-white p-4 text-center text-sm text-stone-500">
            Kegiatan sementara belum dapat dimuat — periksa koneksi atau muat ulang halaman.
          </p>
        ) : null}
      </section>

      {/* ===== Donasi spotlight ===== */}
      {donations.length > 0 ? (
        <section className="bg-[#F0EFE6] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-[#0D2E24] sm:text-3xl">
              Program Donasi Aktif
            </h2>
            <p className="mt-2 text-stone-600">
              Setiap rupiah tercatat dan dilaporkan — amanah adalah prioritas kami.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2" data-testid="home-donation-spotlight">
              {donations.map((e) => (
                <div
                  key={e.id}
                  className="rounded-2xl border border-[#E5E1D5] bg-white p-6 shadow-sm"
                >
                  <h3 className="font-heading text-lg font-bold text-[#142B23]">{e.title}</h3>
                  <p className="mt-1 text-sm text-stone-600">{e.location}</p>
                  <div className="mt-4">
                    <DonationProgressBar
                      collected={e.donation_collected}
                      target={e.donation_target}
                      donorCount={e.registration_count}
                    />
                  </div>
                  <Link
                    to={`/events/${e.id}`}
                    data-testid="home-donation-cta"
                    className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-4 border-[#C4973B] text-[#8A6615] hover:bg-[#FBF5E8]"}
                  >
                    Salurkan Donasi
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
            {settings?.bank_info ? (
              <p className="mt-6 rounded-xl border border-[#E5E1D5] bg-white p-4 text-sm text-stone-700">
                <span className="font-semibold text-[#8A6615]">Rekening Donasi: </span>
                {settings.bank_info}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ===== Profil & kontak ===== */}
      <section id="kontak" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-[#0D2E24] sm:text-3xl">
              Tentang {settings?.mosque_name || "Masjid Kita"}
            </h2>
            <p className="mt-4 leading-relaxed text-stone-700">
              {settings?.mosque_name || "Masjid Kita"} adalah pusat ibadah dan kegiatan sosial
              kemasyarakatan: kajian rutin, pendidikan Al-Qur'an untuk anak dan remaja, santunan
              dhuafa, hingga pemberdayaan UMKM. Seluruh program dikelola takmir secara amanah dan
              terbuka.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E9F5EF] px-4 py-2 text-sm font-semibold text-[#135438]">
                <CalendarDays size={15} />
                {events.length} kegiatan terjadwal
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FBF5E8] px-4 py-2 text-sm font-semibold text-[#8A6615]">
                <Users size={15} />
                {formatRupiah(totalDana)} dana donasi terkumpul
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E9F5EF] px-4 py-2 text-sm font-semibold text-[#135438]">
                <Users size={15} />
                {totalPendaftar} pendaftar terlayani
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E1D5] bg-white p-6 shadow-sm">
            <h3 className="font-heading text-xl font-semibold text-[#0D2E24]">Hubungi Takmir</h3>
            <p className="mt-2 text-sm text-stone-600">
              Ada pertanyaan seputar kegiatan, donasi, atau penggunaan fasilitas? Takmir kami siap
              membantu via WhatsApp.
            </p>
            <div className="mt-4 space-y-2 text-sm text-stone-700">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-[#8A6615]" />
                {settings?.mosque_address || "Alamat akan segera diperbarui"}
              </p>
            </div>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="home-contact-wa-btn"
              className={buttonVariants() + " mt-5 w-full bg-[#25D366] hover:bg-[#1EB557] sm:w-auto"}
            >
              <SiWhatsapp size={18} color="#FFFFFF" />
              Chat Admin Sekarang
            </a>
            <p className="mt-3 text-xs text-stone-500">Sekretariat: setiap hari 08.00–20.00 WIB</p>
          </div>
        </div>
      </section>
    </div>
  );
}
