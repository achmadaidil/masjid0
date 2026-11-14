export const DEFAULT_WA_NUMBER = "08170223635";

/** 08170223635 → 628170223635 ; +62 817 … → 62817 … (wa.me needs the country form). */
export function normalizeWaNumber(raw: string): string {
  let n = (raw || "").replace(/[^\d]/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  return n;
}

export function waLink(number: string, text?: string): string {
  const normalized = normalizeWaNumber(number || DEFAULT_WA_NUMBER);
  const base = `https://wa.me/${normalized}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
