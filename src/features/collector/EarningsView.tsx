import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inr, fmtDate } from "@/lib/tts";
import { Banknote, Wallet } from "lucide-react";
import { toast } from "sonner";

type Filter = "today" | "week" | "month" | "all";

export function EarningsView({ txs }: { txs: any[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const confirmPayment = useMutation(api.transactions.confirmReceived);
  const [busyId, setBusyId] = useState<string | null>(null);

  const now = Date.now();
  const cutoff: Record<Filter, number> = {
    today: now - 86400000,
    week: now - 7 * 86400000,
    month: now - 30 * 86400000,
    all: 0,
  };

  const filtered = txs.filter((x) => x.createdAt >= cutoff[filter]);
  const total = filtered.reduce((s, x) => s + x.finalValue, 0);
  const received = filtered.filter((x) => x.paymentStatus === "paid").reduce((s, x) => s + x.finalValue, 0);
  const pending = total - received;

  const confirm = async (txId: string) => {
    setBusyId(txId);
    try {
      await confirmPayment({ transactionId: txId as any });
      toast.success("Payment confirmed ✅");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-extrabold">💰 My Earnings</h1>

      <Card className="overflow-hidden border-border/70">
        <div className="bg-gradient-to-r from-primary to-emerald-500 px-4 py-5 text-white">
          <p className="text-xs font-medium opacity-90">Total Earnings</p>
          <p className="text-3xl font-black">{inr(total)}</p>
          <div className="mt-2 flex gap-4 text-xs font-semibold">
            <span className="rounded-full bg-white/20 px-2.5 py-1">🟢 Received {inr(received)}</span>
            <span className="rounded-full bg-black/20 px-2.5 py-1">🟡 Pending {inr(pending)}</span>
          </div>
        </div>
        <CardContent className="p-3">
          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                ["today", "Today"],
                ["week", "This Week"],
                ["month", "This Month"],
                ["all", "All Time"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors",
                  filter === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
            <Wallet className="size-10 text-muted-foreground/50" />
            <p className="text-sm font-semibold">No transactions in this period</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((x) => (
            <Card key={x._id} className="border-border/70">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{x.materialLabel} · {x.weightKg} KG</p>
                    <p className="text-xs text-muted-foreground">
                      {x.lotId} · {x.recyclerName} · {fmtDate(x.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-black">{inr(x.finalValue)}</p>
                    <Badge
                      className={cn(
                        "mt-1 border-transparent",
                        x.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
                      )}
                    >
                      {x.paymentStatus === "paid" ? "✅ Paid" : "🟡 Payment Pending"}
                    </Badge>
                  </div>
                </div>
                {x.paymentStatus === "paid" && !x.collectorConfirmedAt && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    disabled={busyId === x._id}
                    onClick={() => confirm(x._id)}
                  >
                    <Banknote className="size-4" /> ✅ Confirm Payment Received
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
