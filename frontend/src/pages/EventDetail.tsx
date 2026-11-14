import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, MoonStar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import DonationProgressBar from "@/components/DonationProgressBar";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { apiGet } from "@/lib/api";
import { formatDateID, formatTimeID } from "@/lib/format";
import { useSettings } from "@/lib/settings";
import { DEFAULT_WA_NUMBER } from "@/lib/wa";
import { EVENT_TYPE_LABELS, type Event } from "@/lib/types";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: settings } = useSettings();

  const eventQ = useQuery({
    queryKey: ["event", id],
    queryFn: () => apiGet<Event>(`/events/${id}`),
    enabled: !!id,
    retry: false,
  });

  const event = eventQ.data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        to="/events"
        data-testid="event-detail-back-link"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#135438] hover:underline"
      >
        <ArrowLeft size={16} />
        Kembali ke Ragam Kegiatan
      </Link>

      {eventQ.isPending ? (
        <div className="mt-8 space-y-4" data-testid="event-detail-skeleton">
          <div className="h-64 w-full animate-pulse rounded-2xl bg-[#F0EFE6]" />
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-[#F0EFE6]" />
          <div className="h-40 w-full animate-pulse rounded-2xl bg-[#F0EFE6]" />
        </div>
      ) : eventQ.isError || !event ? (
        <div className="mt-8 rounded-2xl border border-[#E5E1D5] bg-white p-10 text-center" data-testid="event-not-found">
          <MoonStar size={36} className="mx-auto text-[#C4973B]" />
          <p className="mt-3 font-heading text-xl font-bold text-[#0D2E24]">Kegiatan tidak ditemukan</p>
          <p className="mt-1 text-sm text-stone-600">
            Kegiatan mungkin sudah dihapus atau tautannya salah.
          </p>
          <Link to="/events" className={buttonVariants({ variant: "outline" }) + " mt-5"}>
            Lihat Kegiatan Lainnya
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* ===== Detail ===== */}
          <div>
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={event.image_url || "https://images.unsplash.com/photo-1590075865003-e48277faa558?crop=entropy&cs=srgb&fm=jpg&q=85"}
                alt={event.title}
                className="h-64 w-full object-cover sm:h-80"
              />
              <Badge className="absolute left-4 top-4 border-0 bg-[#135438] text-[#F9F8F3] hover:bg-[#135438]">
                {EVENT_TYPE_LABELS[event.type]}
              </Badge>
            </div>

            <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight text-[#0D2E24] sm:text-4xl">
              {event.title}
            </h1>

            <div className="mt-4 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
              <p className="flex items-center gap-2" data-testid="event-detail-date">
                <CalendarDays size={16} className="text-[#8A6615]" />
                {formatDateID(event.start_date)}
              </p>
              {event.start_time ? (
                <p className="flex items-center gap-2" data-testid="event-detail-time">
                  <Clock size={16} className="text-[#8A6615]" />
                  {formatTimeID(event.start_time)}
                </p>
              ) : null}
              {event.location ? (
                <p className="flex items-center gap-2 sm:col-span-2" data-testid="event-detail-location">
                  <MapPin size={16} className="text-[#8A6615]" />
                  {event.location}
                </p>
              ) : null}
            </div>

            {event.type === "donasi" ? (
              <div className="mt-6 rounded-2xl border border-[#E5E1D5] bg-white p-6 shadow-sm" data-testid="event-detail-donation-panel">
                <h2 className="font-heading text-xl font-semibold text-[#0D2E24]">Progress Donasi</h2>
                <div className="mt-4">
                  <DonationProgressBar
                    collected={event.donation_collected}
                    target={event.donation_target}
                    donorCount={event.registration_count}
                  />
                </div>
                {settings?.bank_info ? (
                  <p className="mt-4 rounded-xl bg-[#FBF5E8] p-3 text-sm leading-relaxed text-[#8A6615]">
                    <span className="font-semibold">Rekening Donasi: </span>
                    {settings.bank_info}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6" data-testid="event-detail-description">
              <h2 className="font-heading text-xl font-semibold text-[#0D2E24]">Deskripsi Kegiatan</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-stone-700">
                {event.description || "Deskripsi kegiatan menyusul."}
              </p>
            </div>
          </div>

          {/* ===== Formulir pendaftaran ===== */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-amber-200/60 bg-[#FDFCF7] p-6 shadow-sm sm:p-8">
              <EventRegistrationForm
                event={event}
                adminNumber={settings?.wa_admin_number || DEFAULT_WA_NUMBER}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
