import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api";
import { EVENT_TYPES, EVENT_TYPE_LABELS, type Event, type EventType } from "@/lib/types";

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategory = searchParams.get("category");
  const category: EventType | null =
    rawCategory && (EVENT_TYPES as string[]).includes(rawCategory) ? (rawCategory as EventType) : null;
  const [search, setSearch] = useState("");

  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search.trim()) params.set("search", search.trim());
  const qs = params.toString() ? `?${params.toString()}` : "";

  const eventsQ = useQuery({
    queryKey: ["events", category ?? "all", search.trim()],
    queryFn: () => apiGet<Event[]>(`/events${qs}`),
    retry: false,
  });

  const setCategory = (c: EventType | null) => {
    const next = new URLSearchParams(searchParams);
    if (c) next.set("category", c);
    else next.delete("category");
    setSearchParams(next, { replace: true });
  };

  const events = eventsQ.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-[#0D2E24] sm:text-4xl">
        Ragam Kegiatan Masjid
      </h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        Telusuri kajian, pelatihan, program donasi, dan kegiatan sosial. Klik kegiatan untuk
        melihat detail dan mendaftar.
      </p>

      {/* Filter + search */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" data-testid="event-category-pills">
          <button
            data-testid="category-pill-all"
            onClick={() => setCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              category === null
                ? "bg-[#135438] text-white"
                : "border border-[#E5E1D5] bg-white text-stone-700 hover:bg-[#E9F5EF]"
            }`}
          >
            Semua
          </button>
          {EVENT_TYPES.map((t) => (
            <button
              key={t}
              data-testid={`category-pill-${t}`}
              onClick={() => setCategory(t)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                category === t
                  ? "bg-[#135438] text-white"
                  : "border border-[#E5E1D5] bg-white text-stone-700 hover:bg-[#E9F5EF]"
              }`}
            >
              {EVENT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            data-testid="events-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kegiatan…"
            className="pl-9"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="events-grid">
        {eventsQ.isPending
          ? [0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-[#F0EFE6]" />
            ))
          : events.map((e) => <EventCard key={e.id} event={e} />)}
      </div>

      {!eventsQ.isPending && !eventsQ.isError && events.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#E5E1D5] bg-white p-10 text-center" data-testid="events-empty-state">
          <p className="font-heading text-lg font-semibold text-[#0D2E24]">
            Belum ada kegiatan ditemukan
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Coba ubah kata kunci pencarian atau pilih kategori lain.
          </p>
        </div>
      ) : null}
      {eventsQ.isError ? (
        <p className="mt-8 rounded-2xl border border-[#E5E1D5] bg-white p-4 text-center text-sm text-stone-500">
          Kegiatan sementara belum dapat dimuat — muat ulang halaman untuk mencoba lagi.
        </p>
      ) : null}
    </div>
  );
}
