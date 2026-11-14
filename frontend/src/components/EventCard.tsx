import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, MoonStar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DonationProgressBar from "@/components/DonationProgressBar";
import { formatDateID, formatTimeID } from "@/lib/format";
import { EVENT_TYPE_LABELS, type Event, type EventType } from "@/lib/types";

const TYPE_BADGE: Record<EventType, string> = {
  kajian: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  donasi: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  sosial: "bg-sky-100 text-sky-900 hover:bg-sky-100",
  pelatihan: "bg-teal-100 text-teal-900 hover:bg-teal-100",
  peringatan: "bg-indigo-100 text-indigo-900 hover:bg-indigo-100",
};

const DEFAULT_IMAGE: Record<EventType, string> = {
  kajian: "https://images.unsplash.com/photo-1574246604907-db69e30ddb97?crop=entropy&cs=srgb&fm=jpg&q=85",
  donasi: "https://images.unsplash.com/photo-1655438806765-d70d1443dfa9?crop=entropy&cs=srgb&fm=jpg&q=85",
  sosial: "https://images.unsplash.com/photo-1590075865003-e48277faa558?crop=entropy&cs=srgb&fm=jpg&q=85",
  pelatihan: "https://images.unsplash.com/photo-1629273229664-11fabc0becc0?crop=entropy&cs=srgb&fm=jpg&q=85",
  peringatan: "https://images.unsplash.com/photo-1537181534458-45dcee76ae90?crop=entropy&cs=srgb&fm=jpg&q=85",
};

export default function EventCard({ event }: { event: Event }) {
  const isDonation = event.type === "donasi";
  return (
    <Link
      to={`/events/${event.id}`}
      data-testid="event-card"
      className="group block overflow-hidden rounded-2xl border border-[#E5E1D5] bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative">
        <img
          src={event.image_url || DEFAULT_IMAGE[event.type]}
          alt={event.title}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
        <Badge className={`absolute left-3 top-3 border-0 ${TYPE_BADGE[event.type]}`}>
          {EVENT_TYPE_LABELS[event.type]}
        </Badge>
        {!event.is_published ? (
          <Badge className="absolute right-3 top-3 border-0 bg-stone-800 text-stone-50 hover:bg-stone-800">
            Draft
          </Badge>
        ) : null}
      </div>

      <div className="space-y-3 p-5">
        <h3 className="font-heading text-lg font-bold leading-snug text-[#142B23] group-hover:text-[#135438]">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-sm text-stone-600">
          <p className="flex items-center gap-2">
            <CalendarDays size={15} className="shrink-0 text-[#8A6615]" />
            {formatDateID(event.start_date)}
            {event.start_time ? (
              <span className="inline-flex items-center gap-1">
                <Clock size={14} className="text-[#8A6615]" />
                {formatTimeID(event.start_time)}
              </span>
            ) : null}
          </p>
          {event.location ? (
            <p className="flex items-center gap-2">
              <MapPin size={15} className="shrink-0 text-[#8A6615]" />
              {event.location}
            </p>
          ) : null}
        </div>

        {isDonation ? (
          <DonationProgressBar
            collected={event.donation_collected}
            target={event.donation_target}
            compact
          />
        ) : (
          <p className="line-clamp-2 text-sm text-stone-600">{event.description}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1 text-xs text-stone-500">
            <Users size={14} />
            {event.registration_count} pendaftar
          </span>
          <span
            data-testid="event-card-cta"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              isDonation
                ? "bg-[#C4973B] text-white group-hover:bg-[#8A6615]"
                : "bg-[#135438] text-white group-hover:bg-[#0D2E24]"
            }`}
          >
            {isDonation ? "Salurkan Donasi" : "Daftar Sekarang"}
          </span>
        </div>
      </div>
    </Link>
  );
}
