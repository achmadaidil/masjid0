import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";

interface Props {
  collected: number;
  target: number | null;
  donorCount?: number;
  compact?: boolean;
}

/** Emerald→gold progress bar with explicit text metrics (never color alone). */
export default function DonationProgressBar({ collected, target, donorCount, compact = false }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const pct = target && target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;

  return (
    <div className={compact ? "space-y-1.5" : "space-y-3"} data-testid="donation-progress-bar">
      <div className="flex items-end justify-between gap-2 text-sm">
        <div>
          <p className="text-xs text-stone-500">Terkumpul</p>
          <p className="font-bold text-emerald-900">{formatRupiah(collected)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-500">Target</p>
          <p className="font-semibold text-stone-700">{target ? formatRupiah(target) : "—"}</p>
        </div>
      </div>

      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-[#EAE7DC]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Donasi terkumpul ${pct} persen dari target`}
      >
        <div
          data-testid="donation-progress-fill"
          className="progress-fill h-full rounded-full bg-gradient-to-r from-emerald-700 to-amber-500"
          style={{ width: mounted ? `${pct}%` : "0%" }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-stone-600">
        <span className="rounded-full bg-[#FBF5E8] px-2 py-0.5 font-semibold text-[#8A6615]">
          {pct}% tercapai
        </span>
        {typeof donorCount === "number" && donorCount > 0 ? (
          <span>{donorCount} donatur/pendaftar</span>
        ) : null}
      </div>
    </div>
  );
}
