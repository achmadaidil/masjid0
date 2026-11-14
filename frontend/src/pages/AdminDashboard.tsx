import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Coins,
  Download,
  LogOut,
  MoonStar,
  Pencil,
  Plus,
  Search,
  Settings as SettingsIcon,
  Trash2,
  Users,
} from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, getApiErrorMessage } from "@/lib/api";
import { formatDateID, formatDateTimeID, formatRupiah } from "@/lib/format";
import { useSettings } from "@/lib/settings";
import { endSession } from "@/lib/session";
import { EVENT_TYPES, EVENT_TYPE_LABELS, type AppSettings, type Event, type EventType, type Registration } from "@/lib/types";
import { waLink } from "@/lib/wa";

type TabId = "kegiatan" | "pendaftar" | "pengaturan";

const TABS: { id: TabId; label: string; icon: typeof CalendarDays }[] = [
  { id: "kegiatan", label: "Kegiatan", icon: CalendarDays },
  { id: "pendaftar", label: "Pendaftar", icon: Users },
  { id: "pengaturan", label: "Pengaturan", icon: SettingsIcon },
];

const TYPE_BADGE: Record<EventType, string> = {
  kajian: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  donasi: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  sosial: "bg-sky-100 text-sky-900 hover:bg-sky-100",
  pelatihan: "bg-teal-100 text-teal-900 hover:bg-teal-100",
  peringatan: "bg-indigo-100 text-indigo-900 hover:bg-indigo-100",
};

interface FormState {
  title: string;
  type: EventType;
  description: string;
  location: string;
  start_date: string;
  start_time: string;
  image_url: string;
  is_published: boolean;
  donation_target: string;
  donation_collected: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  type: "kajian",
  description: "",
  location: "",
  start_date: "",
  start_time: "",
  image_url: "",
  is_published: true,
  donation_target: "",
  donation_collected: "",
};

/* ================= KPI ================= */

function KpiCard({ label, value, testid }: { label: string; value: string; testid: string }) {
  return (
    <div className="rounded-xl border border-[#E5E1D5] bg-white p-5 shadow-sm" data-testid={testid}>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-[#0D2E24]">{value}</p>
    </div>
  );
}

/* ============ Event create/edit dialog ============ */

function EventFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Event | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            title: editing.title,
            type: editing.type,
            description: editing.description,
            location: editing.location,
            start_date: editing.start_date,
            start_time: editing.start_time,
            image_url: editing.image_url ?? "",
            is_published: editing.is_published,
            donation_target: editing.donation_target != null ? String(editing.donation_target) : "",
            donation_collected: String(editing.donation_collected ?? 0),
          }
        : { ...EMPTY_FORM },
    );
  }, [open, editing]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim(),
        location: form.location.trim(),
        start_date: form.start_date,
        start_time: form.start_time,
        image_url: form.image_url.trim() || null,
        is_published: form.is_published,
        donation_target:
          form.type === "donasi" && form.donation_target ? Number(form.donation_target) : null,
        donation_collected:
          form.type === "donasi" && form.donation_collected ? Number(form.donation_collected) : 0,
      };
      if (editing) return apiPut<Event>(`/events/${editing.id}`, payload);
      return apiPost<Event>("/events", payload);
    },
    onSuccess: async () => {
      toast.success(editing ? "Kegiatan berhasil diperbarui." : "Kegiatan berhasil ditambahkan.");
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["event"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.start_date) {
      toast.error("Judul dan tanggal kegiatan wajib diisi.");
      return;
    }
    save.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl" data-testid="event-form-dialog">
        <DialogHeader>
          <DialogTitle className="font-heading text-[#0D2E24]">
            {editing ? "Ubah Kegiatan" : "Tambah Kegiatan Baru"}
          </DialogTitle>
          <DialogDescription>
            Kegiatan bertipe Donasi akan menampilkan progress bar dana terkumpul di halaman publik.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" data-testid="event-form">
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">Judul Kegiatan *</Label>
            <Input
              id="ev-title"
              data-testid="event-title-input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="cth. Kajian Subuh Berkah"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Jenis Kegiatan</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v as EventType)}>
                <SelectTrigger data-testid="event-type-select">
                  <SelectValue>{EVENT_TYPE_LABELS[form.type]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {EVENT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-date">Tanggal *</Label>
              <Input
                id="ev-date"
                type="date"
                data-testid="event-date-input"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-time">Waktu (WIB)</Label>
              <Input
                id="ev-time"
                type="time"
                data-testid="event-time-input"
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-location">Lokasi</Label>
            <Input
              id="ev-location"
              data-testid="event-location-input"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="cth. Ruang Utama Masjid Kita"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-desc">Deskripsi</Label>
            <Textarea
              id="ev-desc"
              data-testid="event-description-textarea"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Ceritakan kegiatan, pemateri, dan hal yang perlu jamaah ketahui…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-image">URL Gambar (opsional)</Label>
            <Input
              id="ev-image"
              data-testid="event-image-input"
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
              placeholder="https://…"
            />
          </div>

          {form.type === "donasi" ? (
            <div className="grid gap-4 rounded-xl border border-amber-200/60 bg-[#FBF5E8] p-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ev-target">Target Dana (Rp)</Label>
                <Input
                  id="ev-target"
                  type="number"
                  min={0}
                  data-testid="event-target-input"
                  value={form.donation_target}
                  onChange={(e) => set("donation_target", e.target.value)}
                  placeholder="50000000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ev-collected">Dana Terkumpul Saat Ini (Rp)</Label>
                <Input
                  id="ev-collected"
                  type="number"
                  min={0}
                  data-testid="event-collected-input"
                  value={form.donation_collected}
                  onChange={(e) => set("donation_collected", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          ) : null}

          <label className="flex items-center gap-2.5 text-sm font-medium text-stone-700">
            <Checkbox
              checked={form.is_published}
              onCheckedChange={(checked) => set("is_published", Boolean(checked))}
              data-testid="event-published-checkbox"
            />
            Publikasikan ke halaman jamaah
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="event-cancel-btn">
              Batal
            </Button>
            <Button type="submit" disabled={save.isPending} data-testid="event-save-btn">
              {save.isPending ? "Menyimpan…" : editing ? "Simpan Perubahan" : "Tambah Kegiatan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ============ Delete confirm ============ */

function DeleteEventDialog({
  event,
  onOpenChange,
}: {
  event: Event | null;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const del = useMutation({
    mutationFn: async () => apiDelete<void>(`/events/${event!.id}`),
    onSuccess: async () => {
      toast.success("Kegiatan dihapus.");
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["event"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="event-delete-dialog">
        <DialogHeader>
          <DialogTitle className="font-heading text-[#0D2E24]">Hapus Kegiatan?</DialogTitle>
          <DialogDescription>
            Kegiatan "{event?.title}" beserta seluruh data pendaftarnya akan dihapus permanen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="event-delete-cancel-btn">
            Batal
          </Button>
          <Button
            variant="destructive"
            disabled={del.isPending}
            onClick={() => del.mutate()}
            data-testid="event-delete-confirm-btn"
          >
            {del.isPending ? "Menghapus…" : "Ya, Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ Donation updater ============ */

function DonationDialog({
  event,
  onOpenChange,
}: {
  event: Event | null;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (event) setAmount(String(event.donation_collected));
  }, [event]);

  const save = useMutation({
    mutationFn: async () =>
      apiPatch<Event>(`/events/${event!.id}/donation`, { donation_collected: Number(amount) || 0 }),
    onSuccess: async () => {
      toast.success("Dana terkumpul diperbarui.");
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["event"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="donation-update-dialog">
        <DialogHeader>
          <DialogTitle className="font-heading text-[#0D2E24]">Update Dana Terkumpul</DialogTitle>
          <DialogDescription>
            {event?.title} — target {event?.donation_target ? formatRupiah(event.donation_target) : "belum ditetapkan"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="donation-amount">Total Dana Terkumpul (Rp)</Label>
          <Input
            id="donation-amount"
            type="number"
            min={0}
            data-testid="donation-amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {event?.donation_target ? (
            <button
              type="button"
              onClick={() => setAmount(String(event.donation_target))}
              className="text-xs font-semibold text-[#8A6615] hover:underline"
            >
              Isi dengan nilai target
            </button>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="donation-cancel-btn">
            Batal
          </Button>
          <Button
            disabled={save.isPending}
            onClick={() => save.mutate()}
            data-testid="donation-save-btn"
          >
            {save.isPending ? "Menyimpan…" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ Registrations panel ============ */

function RegistrationsPanel({ events }: { events: Event[] }) {
  const queryClient = useQueryClient();
  const [eventId, setEventId] = useState("");

  useEffect(() => {
    if (!eventId && events.length > 0) setEventId(events[0].id);
  }, [events, eventId]);

  const selected = events.find((e) => e.id === eventId) ?? null;

  const regsQ = useQuery({
    queryKey: ["admin-regs", eventId],
    queryFn: () => apiGet<Registration[]>(`/events/${eventId}/registrations`),
    enabled: !!eventId,
  });

  const del = useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/registrations/${id}`),
    onSuccess: async () => {
      toast.success("Pendaftar dihapus.");
      await queryClient.invalidateQueries({ queryKey: ["admin-regs", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["event"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const rows = regsQ.data ?? [];

  const downloadCsv = () => {
    const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      ["Nama", "WhatsApp", "Alamat", "Catatan", "Waktu Daftar"].join(";"),
      ...rows.map((r) =>
        [r.name, r.whatsapp, r.address, r.notes, formatDateTimeID(r.created_at)].map(esc).join(";"),
      ),
    ].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pendaftar-${selected?.title ?? "kegiatan"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Daftar pendaftar diunduh (CSV).");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-md space-y-1.5">
          <Label>Pilih Kegiatan</Label>
          <Select value={eventId} onValueChange={(v) => setEventId(v)}>
            <SelectTrigger data-testid="event-select-for-registrations">
              <SelectValue>{selected ? selected.title : "Pilih kegiatan"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" data-testid="registrations-count-badge">
            {rows.length} pendaftar
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCsv}
            disabled={rows.length === 0}
            data-testid="registrations-csv-btn"
          >
            <Download size={16} />
            Unduh CSV
          </Button>
        </div>
      </div>

      {regsQ.isPending ? (
        <div className="h-40 animate-pulse rounded-xl bg-[#F0EFE6]" />
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-[#E5E1D5] bg-white p-10 text-center text-sm text-stone-600" data-testid="registrations-empty-state">
          Belum ada pendaftar untuk kegiatan ini.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E1D5] bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead className="hidden md:table-cell">Alamat</TableHead>
                <TableHead className="hidden lg:table-cell">Catatan</TableHead>
                <TableHead className="hidden sm:table-cell">Waktu Daftar</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} data-testid="registrant-row">
                  <TableCell className="font-medium text-[#142B23]">{r.name}</TableCell>
                  <TableCell>{r.whatsapp}</TableCell>
                  <TableCell className="hidden max-w-48 truncate md:table-cell">{r.address || "—"}</TableCell>
                  <TableCell className="hidden max-w-56 truncate lg:table-cell">{r.notes || "—"}</TableCell>
                  <TableCell className="hidden whitespace-nowrap sm:table-cell">
                    {formatDateTimeID(r.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <a
                        href={waLink(
                          r.whatsapp,
                          `Assalamu'alaikum ${r.name}, terima kasih telah mendaftar kegiatan "${selected?.title}". Ada yang bisa kami bantu?`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Chat WhatsApp ${r.name}`}
                        data-testid={`registrant-wa-btn-${r.id}`}
                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                      >
                        <SiWhatsapp size={14} color="#135438" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Hapus pendaftar ${r.name}`}
                        disabled={del.isPending}
                        onClick={() => del.mutate(r.id)}
                        data-testid={`registrant-delete-btn-${r.id}`}
                      >
                        <Trash2 size={14} className="text-red-700" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/* ============ Settings panel ============ */

function SettingsForm() {
  const queryClient = useQueryClient();
  const settingsQ = useSettings();
  const [form, setForm] = useState({
    mosque_name: "",
    mosque_address: "",
    wa_admin_number: "",
    bank_info: "",
  });

  useEffect(() => {
    const s = settingsQ.data;
    if (s) {
      setForm({
        mosque_name: s.mosque_name,
        mosque_address: s.mosque_address,
        wa_admin_number: s.wa_admin_number,
        bank_info: s.bank_info,
      });
    }
  }, [settingsQ.data]);

  const save = useMutation({
    mutationFn: () => apiPut<AppSettings>("/settings", form),
    onSuccess: async () => {
      toast.success("Pengaturan tersimpan.");
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      data-testid="settings-form"
    >
      <div className="space-y-1.5">
        <Label htmlFor="set-name">Nama Masjid</Label>
        <Input
          id="set-name"
          data-testid="settings-mosque-name-input"
          value={form.mosque_name}
          onChange={(e) => setForm((f) => ({ ...f, mosque_name: e.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="set-address">Alamat Masjid</Label>
        <Textarea
          id="set-address"
          data-testid="settings-address-textarea"
          value={form.mosque_address}
          onChange={(e) => setForm((f) => ({ ...f, mosque_address: e.target.value }))}
          rows={2}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="set-wa">Nomor WhatsApp Admin (tombol WA di semua halaman)</Label>
        <Input
          id="set-wa"
          data-testid="settings-wa-input"
          value={form.wa_admin_number}
          onChange={(e) => setForm((f) => ({ ...f, wa_admin_number: e.target.value }))}
          placeholder="08xxxxxxxxxx"
        />
        <p className="text-xs text-stone-500">
          Format 08xx atau 62xx — otomatis dikonversi ke wa.me.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="set-bank">Rekening / Info Transfer Donasi</Label>
        <Textarea
          id="set-bank"
          data-testid="settings-bank-textarea"
          value={form.bank_info}
          onChange={(e) => setForm((f) => ({ ...f, bank_info: e.target.value }))}
          rows={2}
          placeholder="cth. Bank Muamalat 3010123456 a.n. Yayasan Masjid Kita"
        />
      </div>
      <Button type="submit" disabled={save.isPending} data-testid="settings-save-btn">
        {save.isPending ? "Menyimpan…" : "Simpan Pengaturan"}
      </Button>
    </form>
  );
}

/* ================= Dashboard ================= */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("kegiatan");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState<Event | null>(null);
  const [donationFor, setDonationFor] = useState<Event | null>(null);
  const [filter, setFilter] = useState("");

  const eventsQ = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => apiGet<Event[]>("/admin/events"),
  });
  const events = eventsQ.data ?? [];
  const filtered = useMemo(
    () => events.filter((e) => e.title.toLowerCase().includes(filter.trim().toLowerCase())),
    [events, filter],
  );

  const logout = useMutation({ mutationFn: endSession, onSuccess: () => navigate("/login") });

  const danaTerkumpul = events.reduce(
    (sum, e) => sum + (e.type === "donasi" ? e.donation_collected || 0 : 0),
    0,
  );
  const totalPendaftar = events.reduce((sum, e) => sum + (e.registration_count || 0), 0);

  return (
    <div className="flex min-h-svh bg-[#F9F8F3]">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col bg-[#0D2E24] p-4 text-white md:flex">
        <div className="flex items-center gap-2.5 px-2 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A5242] text-[#F3CE72]">
            <MoonStar size={20} />
          </span>
          <div>
            <p className="font-heading font-bold leading-tight">Panel Takmir</p>
            <p className="text-xs text-[#A2BEB2]">Masjid Kita</p>
          </div>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`admin-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-[#1A5242] text-[#F3CE72]" : "text-[#A2BEB2] hover:bg-[#1A5242] hover:text-white"
              }`}
            >
              <t.icon size={17} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-[#1A5242] pt-4">
          <p className="px-3 text-xs text-[#A2BEB2]">Masuk sebagai takmir</p>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start text-[#A2BEB2] hover:bg-[#1A5242] hover:text-white"
            onClick={() => logout.mutate()}
            data-testid="admin-logout-btn"
          >
            <LogOut size={16} />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <div className="bg-[#0D2E24] p-4 text-white md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MoonStar size={18} className="text-[#F3CE72]" />
              <span className="font-heading font-bold">Panel Takmir</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Keluar"
              onClick={() => logout.mutate()}
              data-testid="admin-logout-btn-mobile"
            >
              <LogOut size={18} />
            </Button>
          </div>
          <div className="mt-3 flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                data-testid={`admin-tab-mobile-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                  tab === t.id ? "bg-[#1A5242] text-[#F3CE72]" : "text-[#A2BEB2]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="admin-kpi-grid">
            <KpiCard label="Total Kegiatan" value={String(events.length)} testid="kpi-total-events" />
            <KpiCard
              label="Kegiatan Aktif"
              value={String(events.filter((e) => e.is_published).length)}
              testid="kpi-active-events"
            />
            <KpiCard label="Total Pendaftar" value={String(totalPendaftar)} testid="kpi-total-registrants" />
            <KpiCard label="Dana Donasi" value={formatRupiah(danaTerkumpul)} testid="kpi-total-donation" />
          </div>

          {/* ===== Tab: Kegiatan ===== */}
          {tab === "kegiatan" ? (
            <section className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-xs">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <Input
                    data-testid="admin-events-search-input"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Cari kegiatan…"
                    className="pl-9"
                  />
                </div>
                <Button
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                  data-testid="admin-add-event-btn"
                >
                  <Plus size={17} />
                  Tambah Kegiatan
                </Button>
              </div>

              {eventsQ.isPending ? (
                <div className="mt-4 h-64 animate-pulse rounded-xl bg-[#F0EFE6]" />
              ) : (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E1D5] bg-white shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kegiatan</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead className="hidden sm:table-cell">Tanggal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dana Donasi</TableHead>
                        <TableHead className="hidden md:table-cell">Pendaftar</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((ev) => (
                        <TableRow key={ev.id} data-testid={`event-row-${ev.id}`}>
                          <TableCell className="max-w-56">
                            <p className="truncate font-semibold text-[#142B23]">{ev.title}</p>
                            <p className="truncate text-xs text-stone-500">{ev.location}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={`border-0 ${TYPE_BADGE[ev.type]}`}>
                              {EVENT_TYPE_LABELS[ev.type]}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden whitespace-nowrap text-sm sm:table-cell">
                            {formatDateID(ev.start_date)}
                          </TableCell>
                          <TableCell>
                            {ev.is_published ? (
                              <Badge data-testid={`event-status-active-${ev.id}`}>Aktif</Badge>
                            ) : (
                              <Badge variant="secondary" data-testid={`event-status-draft-${ev.id}`}>
                                Draft
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {ev.type === "donasi" ? (
                              <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap text-sm font-semibold text-emerald-900">
                                  {formatRupiah(ev.donation_collected)}
                                </span>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => setDonationFor(ev)}
                                  data-testid={`donation-update-btn-${ev.id}`}
                                >
                                  Update
                                </Button>
                              </div>
                            ) : (
                              <span className="text-stone-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{ev.registration_count}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Ubah ${ev.title}`}
                                onClick={() => {
                                  setEditing(ev);
                                  setFormOpen(true);
                                }}
                                data-testid={`event-edit-btn-${ev.id}`}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Hapus ${ev.title}`}
                                onClick={() => setDeleting(ev)}
                                data-testid={`event-delete-btn-${ev.id}`}
                              >
                                <Trash2 size={14} className="text-red-700" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-10 text-center text-sm text-stone-600">
                            Tidak ada kegiatan yang cocok.
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          ) : null}

          {/* ===== Tab: Pendaftar ===== */}
          {tab === "pendaftar" ? (
            <section className="mt-6">
              <h2 className="font-heading text-xl font-bold text-[#0D2E24]">Data Pendaftar</h2>
              <p className="mt-1 text-sm text-stone-600">
                Lihat, unduh, dan hubungi pendaftar per kegiatan melalui WhatsApp.
              </p>
              <div className="mt-4">
                <RegistrationsPanel events={events} />
              </div>
            </section>
          ) : null}

          {/* ===== Tab: Pengaturan ===== */}
          {tab === "pengaturan" ? (
            <section className="mt-6">
              <h2 className="font-heading text-xl font-bold text-[#0D2E24]">Pengaturan</h2>
              <p className="mt-1 text-sm text-stone-600">
                Profil masjid, nomor WhatsApp admin, dan info rekening donasi.
              </p>
              <div className="mt-4 rounded-xl border border-[#E5E1D5] bg-white p-6 shadow-sm">
                <SettingsForm />
              </div>
            </section>
          ) : null}
        </main>
      </div>

      {/* Dialogs */}
      <EventFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <DeleteEventDialog event={deleting} onOpenChange={(o) => !o && setDeleting(null)} />
      <DonationDialog event={donationFor} onOpenChange={(o) => !o && setDonationFor(null)} />
    </div>
  );
}
