import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/tts";
import type { MaterialDef } from "@/lib/greensetu-data";

type Range = "today" | "7d" | "30d" | "6m";

const RANGES: { key: Range; label: string; points: number }[] = [
  { key: "today", label: "Today", points: 4 },
  { key: "7d", label: "7 Days", points: 7 },
  { key: "30d", label: "30 Days", points: 14 },
  { key: "6m", label: "6 Months", points: 14 },
];

/** Expand the compact 14-point history into the requested range window. */
function series(m: MaterialDef, points: number, key: Range) {
  const hist = m.priceHistory;
  if (key === "today") {
    // Intraday: interpolate between yesterday's close and today's price
    const prev = hist[hist.length - 2] ?? m.basePrice;
    const cur = m.basePrice;
    return Array.from({ length: points }, (_, i) => {
      const v = prev + ((cur - prev) * i) / (points - 1);
      return { label: ["9 AM", "11 AM", "1 PM", "3 PM"][i] ?? `${i}`, value: Math.round(v) };
    });
  }
  const slice = hist.slice(-points);
  const startIdx = hist.length - slice.length;
  return slice.map((v, i) => {
    const daysAgo = slice.length - 1 - i;
    const label =
      key === "6m"
        ? `W${i + 1}`
        : daysAgo === 0
          ? "Today"
          : new Date(Date.now() - daysAgo * 86400000).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            });
    void startIdx;
    return { label, value: v };
  });
}

export function PriceChart({ material }: { material: MaterialDef }) {
  const [range, setRange] = useState<Range>("7d");
  const data = useMemo(() => series(material, RANGES.find((r) => r.key === range)!.points, range), [material, range]);

  const low = Math.min(...data.map((d) => d.value));
  const high = Math.max(...data.map((d) => d.value));
  const avg = Math.round(data.reduce((s, d) => s + d.value, 0) / data.length);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border bg-background p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                range === r.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 text-xs">
          <div className="rounded-lg border bg-background px-3 py-1.5">
            <span className="text-muted-foreground">Low </span>
            <span className="font-bold text-red-600">{inr(low)}</span>
          </div>
          <div className="rounded-lg border bg-background px-3 py-1.5">
            <span className="text-muted-foreground">Avg </span>
            <span className="font-bold">{inr(avg)}</span>
          </div>
          <div className="rounded-lg border bg-background px-3 py-1.5">
            <span className="text-muted-foreground">High </span>
            <span className="font-bold text-emerald-600">{inr(high)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 h-56 rounded-xl border border-border/70 bg-card p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gsArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22A447" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22A447" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gsAreaLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0B5D3B" />
                <stop offset="100%" stopColor="#22A447" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={["dataMin - 15", "dataMax + 15"]} width={44} />
            <Tooltip
              formatter={(value: number | string) => [inr(Number(value)), "Price"]}
              contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="value" stroke="url(#gsAreaLine)" strokeWidth={2.5} fill="url(#gsArea)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">Demo / Sample Market Data</p>
    </div>
  );
}
