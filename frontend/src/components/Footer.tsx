import { Link } from "react-router-dom";
import { MapPin, MoonStar } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { useSettings } from "@/lib/settings";
import { waLink } from "@/lib/wa";

export default function Footer() {
  const { data: settings } = useSettings();
  const number = settings?.wa_admin_number || "";
  const waHref = waLink(number, "Assalamu'alaikum Admin, saya ingin bertanya tentang masjid.");

  return (
    <footer className="bg-[#092119] text-[#F9F8F3]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A5242] text-[#F3CE72]">
              <MoonStar size={20} />
            </span>
            <span className="font-heading text-lg font-bold">{settings?.mosque_name || "Masjid Kita"}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#A2BEB2]">
            Pusat informasi ragam kegiatan, kajian, dan program donasi masjid. Mari bersama
            memakmurkan masjid — bismillah.
          </p>
        </div>

        <div>
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F3CE72]">
            Tautan
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/" className="text-[#A2BEB2] hover:text-[#6EE7B7]">Beranda</Link></li>
            <li><Link to="/events" className="text-[#A2BEB2] hover:text-[#6EE7B7]">Ragam Kegiatan</Link></li>
            <li><Link to="/events?category=donasi" className="text-[#A2BEB2] hover:text-[#6EE7B7]">Program Donasi</Link></li>
            <li><Link to="/admin" className="text-[#A2BEB2] hover:text-[#6EE7B7]">Panel Takmir</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F3CE72]">
            Kontak Kami
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-[#A2BEB2]">
            <li className="flex gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#F3CE72]" />
              <span data-testid="footer-address">
                {settings?.mosque_address || "Jl. Melati Raya No. 12, Jakarta Selatan"}
              </span>
            </li>
            <li>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-whatsapp-link"
                className="inline-flex items-center gap-2 text-[#6EE7B7] hover:underline"
              >
                <SiWhatsapp size={16} />
                {number ? `Admin: ${number}` : "WhatsApp Admin"}
              </a>
            </li>
          </ul>
          {settings?.bank_info ? (
            <p className="mt-4 rounded-lg border border-[#1A5242] bg-[#0D2E24] p-3 text-xs leading-relaxed text-[#A2BEB2]">
              <span className="font-semibold text-[#F3CE72]">Rekening Donasi: </span>
              {settings.bank_info}
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-[#1A5242] py-4 text-center text-xs text-[#A2BEB2]">
        © {new Date().getFullYear()} {settings?.mosque_name || "Masjid Kita"} — Memakmurkan masjid,
        memberkahi kampung.
      </div>
    </footer>
  );
}
