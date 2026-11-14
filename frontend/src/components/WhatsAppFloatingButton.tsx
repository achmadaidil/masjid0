import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { useSettings } from "@/lib/settings";
import { DEFAULT_WA_NUMBER, waLink } from "@/lib/wa";

/** Fixed bottom-right pill — opens WhatsApp with a respectful pre-filled greeting. */
export default function WhatsAppFloatingButton() {
  const { data: settings } = useSettings();
  const number = settings?.wa_admin_number || DEFAULT_WA_NUMBER;
  const mosque = settings?.mosque_name || "Masjid Kita";
  const href = waLink(
    number,
    `Assalamu'alaikum Admin ${mosque}, saya ingin bertanya tentang kegiatan masjid.`,
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="floating-whatsapp-btn"
      aria-label="Hubungi admin masjid melalui WhatsApp"
      className="wa-ring fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-105"
    >
      <SiWhatsapp size={22} color="#FFFFFF" />
      <span className="hidden text-sm sm:inline">Tanya Takmir</span>
    </a>
  );
}
