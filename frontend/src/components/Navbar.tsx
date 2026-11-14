import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, MoonStar } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSettings } from "@/lib/settings";
import { waLink } from "@/lib/wa";

const NAV_LINKS = [
  { to: "/", label: "Beranda", nav: true },
  { to: "/events", label: "Ragam Kegiatan", nav: true },
  { to: "/events?category=donasi", label: "Program Donasi", nav: false },
  { to: "/#kontak", label: "Kontak Kami", nav: false },
  { to: "/admin", label: "Panel Takmir", nav: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: settings } = useSettings();
  const waHref = waLink(
    settings?.wa_admin_number || "",
    `Assalamu'alaikum Admin ${settings?.mosque_name || "Masjid Kita"}, saya ingin bertanya tentang kegiatan masjid.`,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E1D5] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" data-testid="navbar-brand" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#135438] text-[#F3CE72]">
            <MoonStar size={20} />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-[#0D2E24]">
            Masjid Kita
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) =>
            l.nav ? (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-[#135438] ${
                    isActive ? "text-[#135438] underline underline-offset-4" : "text-stone-600"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ) : (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium text-stone-600 transition-colors hover:text-[#135438]"
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="navbar-wa-cta"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <SiWhatsapp size={16} color="#135438" />
            Tanya Takmir
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Buka menu" data-testid="navbar-menu-btn" />
              }
              className="md:hidden"
            >
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-heading text-[#0D2E24]">Masjid Kita</SheetTitle>
              <nav className="mt-4 flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    data-testid="navbar-mobile-link"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-[#E9F5EF] hover:text-[#135438]"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
