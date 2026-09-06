import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n, pickLabel } from "@/lib/i18n";
import { inr, priceAnnouncement, speak, stopSpeaking } from "@/lib/tts";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Volume2, Square } from "lucide-react";

export function PriceBoard() {
  const materials = useQuery(api.materials.list, {}) ?? [];
  const { lang, t } = useI18n();
  const [speaking, setSpeaking] = useState(false);
  const loading = materials.length === 0;

  const sorted = useMemo(
    () => [...materials].sort((a, b) => b.basePrice - a.basePrice),
    [materials],
  );

  const listenAll = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const sentences = sorted
      .slice(0, 6)
      .map((m) => priceAnnouncement(lang, pickLabel(lang, m), m.basePrice));
    speak(sentences.join(" "), lang, () => setSpeaking(false));
    setSpeaking(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight">{t("prices.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("prices.sub")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
            {t("prices.demo")}
          </Badge>
          <Button size="sm" variant={speaking ? "destructive" : "outline"} className="gap-2" onClick={listenAll}>
            {speaking ? <Square className="size-3.5" /> : <Volume2 className="size-3.5" />}
            {speaking ? t("prices.stop") : t("prices.listen")}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : sorted.map((m) => {
              const up = m.trendPct >= 0;
              return (
                <Card key={m._id} className="overflow-hidden border-border/70 transition-shadow hover:shadow-md">
                  <div className="h-1.5" style={{ background: m.color }} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-2xl">{m.emoji}</span>
                      <span
                        className={cn(
                          "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                          up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
                        )}
                      >
                        {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                        {up ? "+" : ""}{m.trendPct}%
                      </span>
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold">{pickLabel(lang, m)}</p>
                    <p className="mt-1 text-lg font-extrabold text-primary">
                      {inr(m.basePrice)}
                      <span className="text-xs font-medium text-muted-foreground"> {t("prices.kg")}</span>
                    </p>
                    <button
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary"
                      onClick={() => speak(priceAnnouncement(lang, pickLabel(lang, m), m.basePrice), lang)}
                    >
                      <Volume2 className="size-3" /> {t("safety.listen")}
                    </button>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
