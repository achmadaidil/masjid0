import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPost, getApiErrorMessage } from "@/lib/api";
import type { Event, Registration, RegistrationCreate } from "@/lib/types";
import { waLink } from "@/lib/wa";

/** Registration form on the event detail page — collects nama, WA, alamat, catatan. */
export default function EventRegistrationForm({ event, adminNumber }: { event: Event; adminNumber: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState<Registration | null>(null);

  const isDonation = event.type === "donasi";

  const mutation = useMutation({
    mutationFn: (body: RegistrationCreate) =>
      apiPost<Registration>(`/events/${event.id}/registrations`, body),
    onSuccess: async (reg) => {
      setConfirmed(reg);
      toast.success("Pendaftaran berhasil disimpan.");
      await queryClient.invalidateQueries({ queryKey: ["event", event.id] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = whatsapp.trim();
    if (!name.trim() || !phone) {
      toast.error("Nama dan nomor WhatsApp wajib diisi.");
      return;
    }
    if (!/^[0-9+\-\s]{8,16}$/.test(phone)) {
      toast.error("Nomor WhatsApp tidak valid. Gunakan format 08xx… atau 628xx…");
      return;
    }
    mutation.mutate({
      name: name.trim(),
      whatsapp: phone,
      address: address.trim(),
      notes: notes.trim(),
    });
  };

  if (confirmed) {
    const code = confirmed.id.slice(0, 8).toUpperCase();
    const waText = `Assalamu'alaikum Admin, saya ${confirmed.name} telah mendaftar kegiatan "${event.title}". Kode pendaftaran saya: ${code}.`;
    return (
      <div data-testid="registration-success-panel" className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <div>
          <h3 className="font-heading text-xl font-bold text-[#142B23]">Pendaftaran Berhasil</h3>
          <p className="mt-1 text-sm text-stone-600">Jazakumullah khairan. Kode pendaftaran Anda:</p>
          <p
            data-testid="registration-ticket-code"
            className="mt-2 font-mono text-2xl font-bold tracking-widest text-emerald-900"
          >
            {code}
          </p>
        </div>
        <div className="rounded-xl bg-[#E9F5EF] p-3 text-sm text-emerald-900">
          <span className="font-semibold">{confirmed.name}</span> • {event.title}
        </div>
        <div className="flex flex-col gap-2">
          <a
            href={waLink(adminNumber, waText)}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="registration-wa-confirm-btn"
            className={buttonVariants({ variant: "default" }) + " bg-[#25D366] hover:bg-[#1EB557]"}
          >
            <SiWhatsapp size={18} color="#FFFFFF" />
            Konfirmasi via WhatsApp
          </a>
          <Button
            variant="outline"
            data-testid="register-again-btn"
            onClick={() => {
              setConfirmed(null);
              setName("");
              setWhatsapp("");
              setAddress("");
              setNotes("");
            }}
          >
            <RotateCcw size={16} />
            Daftarkan Orang Lain
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" data-testid="event-registration-form">
      <div>
        <h3 className="font-heading text-xl font-bold text-[#142B23]">Formulir Pendaftaran</h3>
        <p className="mt-1 text-sm text-stone-600">
          {isDonation
            ? "Isi data Anda untuk konfirmasi donasi — admin akan menghubungi melalui WhatsApp."
            : "Isi data Anda — admin akan menghubungi melalui WhatsApp untuk konfirmasi."}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-name">Nama Lengkap *</Label>
        <Input
          id="reg-name"
          data-testid="register-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama sesuai identitas"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-wa">Nomor WhatsApp *</Label>
        <Input
          id="reg-wa"
          data-testid="register-wa-input"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="08xx xxxx xxxx atau 628xx…"
          inputMode="tel"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-address">Alamat / Domisili</Label>
        <Textarea
          id="reg-address"
          data-testid="register-address-input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Alamat lengkap atau domisili saat ini"
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-notes">Catatan / Doa / Jumlah Peserta</Label>
        <Textarea
          id="reg-notes"
          data-testid="register-notes-input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={isDonation ? "Doa dan harapan Anda" : "Catatan tambahan, mis. jumlah peserta"}
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending}
        data-testid="register-submit-btn"
        className="w-full"
      >
        {mutation.isPending
          ? "Menyimpan…"
          : isDonation
            ? "Konfirmasi Donasi Saya"
            : "Daftar Sekarang"}
      </Button>
      <p className="text-center text-xs text-stone-500">
        Data Anda hanya digunakan oleh takmir untuk keperluan kegiatan ini.
      </p>
    </form>
  );
}
