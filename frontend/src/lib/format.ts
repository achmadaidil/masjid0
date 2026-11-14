import { format, parseISO } from "date-fns";
import { id as localeID } from "date-fns/locale";

/** Rp 32.500.000 — Indonesian Rupiah with dot separators. */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/** "Sabtu, 28 Maret 2026" from a YYYY-MM-DD string. */
export function formatDateID(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEEE, d MMMM yyyy", { locale: localeID });
  } catch {
    return dateStr;
  }
}

/** "1 Jan 2026, 10.00" in Asia/Jakarta from an ISO datetime. */
export function formatDateTimeID(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** "05:30 WIB" when a time is set, otherwise "". */
export function formatTimeID(time: string): string {
  return time ? `${time} WIB` : "";
}
