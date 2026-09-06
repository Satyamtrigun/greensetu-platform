import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n, pickLabel } from "@/lib/i18n";
import { inr, timeAgo, speak, priceAnnouncement } from "@/lib/tts";
import { useOffline } from "@/lib/offline";
import { cn } from "@/lib/utils";
import { Volume2, CloudUpload, Camera } from "lucide-react";

export const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  created: { label: "Created", cls: "bg-slate-100 text-slate-700" },
  matched: { label: "Recycler Selected", cls: "bg-blue-50 text-blue-700" },
  quoted: { label: "Quote Received", cls: "bg-indigo-50 text-indigo-700" },
  pickup_requested: { label: "Pickup Requested", cls: "bg-violet-50 text-violet-700" },
  pickup_scheduled: { label: "Pickup Scheduled", cls: "bg-purple-50 text-purple-700" },
  handed_over: { label: "Handed Over", cls: "bg-amber-50 text-amber-700" },
  confirmed: { label: "Recycler Confirmed", cls: "bg-cyan-50 text-cyan-700" },
  payment_pending: { label: "Payment Pending", cls: "bg-amber-100 text-amber-800" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700" },
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-800" },
};

export function statusStyle(status: string) {
  return STATUS_STYLE[status] ?? { label: status, cls: "bg-slate-100 text-slate-700" };
}

export function HomeView({
  profile,
  lots,
  materials,
  stats,
  onSell,
  onLots,
}: {
  profile: any;
  lots: any[];
  materials: any[];
  stats: { paid: number; pending: number; lots: number };
  onSell: () => void;
  onLots: () => void;
}) {
  const { t, lang } = useI18n();
  const { queue, online, flush } = useOffline();
  void flush;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">नमस्ते 🙏</p>
          <h1 className="text-xl font-extrabold">{profile.displayName} 🧺</h1>
        </div>
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
          Collector
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Received" value={inr(stats.paid)} tone="good" />
        <StatCard label="Pending" value={inr(stats.pending)} tone="warn" />
        <StatCard label="Lots" value={String(stats.lots)} tone="neutral" />
      </div>

      {queue.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-amber-900">
                {queue.length} lot{queue.length > 1 ? "s" : ""} waiting to sync
              </p>
              <p className="text-xs text-amber-800">
                {online ? "Tap to sync now" : "Will sync when internet returns"}
              </p>
            </div>
            <Button size="sm" disabled={!online} onClick={() => void flush()} className="gap-1.5">
              <CloudUpload className="size-4" /> Sync
            </Button>
          </CardContent>
        </Card>
      )}

      <Button
        size="lg"
        className="w-full gap-2 bg-primary py-7 text-lg font-bold hover:bg-primary/90"
        onClick={onSell}
      >
        <Camera className="size-5" /> 📸 Sell Scrap Now
      </Button>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Today's Prices</p>
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
              {t("prices.demo")}
            </Badge>
          </div>
          <div className="mt-3 space-y-2">
            {materials.slice(0, 5).map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
              >
                <span className="truncate text-sm font-medium">
                  {m.emoji} {pickLabel(lang, m)}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-bold text-primary">{inr(m.basePrice)}/kg</span>
                  <button
                    aria-label="Listen"
                    className="rounded-full p-1 hover:bg-muted"
                    onClick={() =>
                      speak(priceAnnouncement(lang, pickLabel(lang, m), m.basePrice), lang)
                    }
                  >
                    <Volume2 className="size-3.5 text-muted-foreground" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-bold">My Lots</p>
          {lots.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No lots yet — sell your first scrap!</p>
          ) : (
            <div className="mt-3 space-y-2">
              {lots.slice(0, 4).map((l) => {
                const st = statusStyle(l.status);
                return (
                  <div
                    key={l._id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {l.materialLabel} · {l.weightKg} KG
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {l.lotId} · {timeAgo(l.createdAt)}
                      </p>
                    </div>
                    <Badge className={cn("shrink-0 border-transparent", st.cls)}>{st.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
          <Button variant="ghost" className="mt-2 w-full text-primary" onClick={onLots}>
            View all
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "neutral";
}) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-3 text-center">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-0.5 text-base font-extrabold",
            tone === "good" && "text-emerald-600",
            tone === "warn" && "text-amber-600",
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
