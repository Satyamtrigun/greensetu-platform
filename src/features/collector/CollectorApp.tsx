import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HomeView } from "./HomeView";
import { SellFlow } from "./SellFlow";
import { LotsView } from "./LotsView";
import { EarningsView } from "./EarningsView";
import { SafetyView } from "./SafetyView";
import { cn } from "@/lib/utils";
import { Home, PlusCircle, Package, Wallet, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Doc } from "@/convex/_generated/dataModel";

export function CollectorApp({ profile }: { profile: any }) {
  const [tab, setTab] = useState<"home" | "sell" | "lots" | "earnings" | "safety">("home");
  const { t } = useI18n();

  // Ensure demo lots exist for this collector (presentation-friendly)
  const ensureDemo = useMutation(api.demo.ensureDemoLots);
  const seeded = useRef(false);
  useEffect(() => {
    if (profile && !seeded.current) {
      seeded.current = true;
      ensureDemo({}).catch(() => {});
    }
  }, [profile, ensureDemo]);

  const lots = useQuery(api.lots.listMine, {}) ?? [];
  const txs = useQuery(api.transactions.listForCollector, {}) ?? [];
  const materials = useQuery(api.materials.list, {}) ?? [];

  const stats = useMemo(() => {
    const paid = txs.filter((x) => x.paymentStatus === "paid").reduce((s, x) => s + x.finalValue, 0);
    const pending = txs.filter((x) => x.paymentStatus !== "paid").reduce((s, x) => s + x.finalValue, 0);
    const offlinePending = lots.filter((l) => l.demo).length;
    return { paid, pending, lots: lots.length, offlinePending };
  }, [txs, lots]);

  return (
    <div className="mx-auto max-w-lg px-3 pb-24 pt-4">
      <main>
        {tab === "home" && <HomeView profile={profile} lots={lots} materials={materials} stats={stats} onSell={() => setTab("sell")} onLots={() => setTab("lots")} />}
        {tab === "sell" && <SellFlow onDone={() => setTab("lots")} />}
        {tab === "lots" && <LotsView lots={lots} />}
        {tab === "earnings" && <EarningsView txs={txs} />}
        {tab === "safety" && <SafetyView />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {(
            [
              ["home", Home, "Home"],
              ["sell", PlusCircle, "Sell"],
              ["lots", Package, "Lots"],
              ["earnings", Wallet, "Earnings"],
              ["safety", ShieldCheck, "Safety"],
            ] as const
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold",
                tab === key ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5", key === "sell" && "-mt-0.5")} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
