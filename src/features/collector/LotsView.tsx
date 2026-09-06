import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { statusStyle } from "./HomeView";
import { inr, timeAgo, fmtTime, fmtDate } from "@/lib/tts";
import { cn } from "@/lib/utils";
import { handoverRecordText } from "@/lib/qr";
import { QRCodeSvg } from "./QRCodeSvg";
import { PackageOpen, Copy, Handshake, CircleCheck } from "lucide-react";
import { toast } from "sonner";

const EVENT_ICONS: Record<string, string> = {
  lot_created: "📦",
  recycler_selected: "📍",
  quoted: "💬",
  pickup_requested: "🚚",
  pickup_scheduled: "🗓️",
  handed_over: "🤝",
  confirmed: "♻️",
  payment_pending: "🟡",
  paid: "💰",
  completed: "✅",
};

export function LotsView({ lots }: { lots: any[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = lots.find((l) => l._id === openId);

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-extrabold">📦 My Lots</h1>
      {lots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
            <PackageOpen className="size-10 text-muted-foreground/50" />
            <p className="text-sm font-semibold">No lots yet</p>
            <p className="text-xs text-muted-foreground">Sell your first scrap to create a digital lot.</p>
          </CardContent>
        </Card>
      ) : (
        lots.map((l) => {
          const st = statusStyle(l.status);
          return (
            <Card key={l._id} className="cursor-pointer border-border/70 transition-shadow hover:shadow-md" onClick={() => setOpenId(l._id)}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                {l.photoPreview ? (
                  <img src={l.photoPreview} className="size-12 rounded-lg object-cover" alt="" />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-xl">📦</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{l.materialLabel} · {l.weightKg} KG</p>
                  <p className="text-xs text-muted-foreground">{l.lotId} · {timeAgo(l.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">{l.recyclerName ?? "No recycler selected"}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold text-primary">
                    {inr(l.finalValue ?? l.estimatedValue)}
                  </p>
                  <Badge className={cn("mt-1 border-transparent", st.cls)}>{st.label}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      <LotDetailDialog lot={selected} onClose={() => setOpenId(null)} />
    </div>
  );
}

export function LotDetailDialog({ lot, onClose }: { lot: any; onClose: () => void }) {
  const trace = useQuery(api.lots.traceForLot, lot ? { lotDocId: lot._id } : "skip");
  const allTxs = useQuery(api.transactions.listForCollector, {}) ?? [];
  const confirmPayment = useMutation(api.transactions.confirmReceived);
  const [busy, setBusy] = useState(false);

  if (!lot) return null;

  const tx = allTxs.find((t: any) => t.lotDocId === lot._id);

  const confirm = async () => {
    if (!tx) return;
    setBusy(true);
    try {
      await confirmPayment({ transactionId: tx._id });
      toast.success("Payment confirmed ✅");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📦 {lot.materialLabel} · {lot.weightKg} KG
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge className="border-transparent bg-primary/10 font-mono text-primary">{lot.lotId}</Badge>
            <Badge className={cn("border-transparent", statusStyle(lot.status).cls)}>{statusStyle(lot.status).label}</Badge>
            {lot.demo && <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Demo Data</Badge>}
          </div>

          {lot.photoPreview && (
            <img src={lot.photoPreview} alt="lot" className="h-40 w-full rounded-xl object-cover" />
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <Info label="Estimated" value={inr(lot.estimatedValue)} />
            <Info label="Final Value" value={lot.finalValue ? inr(lot.finalValue) : "—"} />
            <Info label="Recycler" value={lot.recyclerName ?? "—"} />
            <Info label="City" value={lot.city} />
            <Info label="Condition" value={lot.condition} />
            <Info label="Handover Ref" value={lot.handoverRef ?? "—"} />
          </div>

          {/* QR handover */}
          <div className="rounded-xl border border-border/70 p-4 text-center">
            <p className="text-sm font-bold">🔳 Handover QR</p>
            <div className="mx-auto mt-2 w-fit rounded-lg bg-white p-2">
              <QRCodeSvg
                size={120}
                value={handoverRecordText({
                  lotId: lot.lotId,
                  handoverRef: lot.handoverRef,
                  collector: lot.collectorName,
                  recycler: lot.recyclerName ?? undefined,
                  material: lot.materialLabel,
                  weightKg: lot.weightKg,
                  finalValue: lot.finalValue,
                  city: lot.city,
                  ts: lot.createdAt,
                })}
              />
            </div>
            <button
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              onClick={() => {
                navigator.clipboard?.writeText(lot.lotId).then(
                  () => toast.success("Lot ID copied"),
                  () => {},
                );
              }}
            >
              <Copy className="size-3" /> Copy Lot ID
            </button>
          </div>

          {/* Traceability timeline */}
          <div>
            <p className="text-sm font-bold">🧾 Traceability Timeline</p>
            <div className="mt-2 space-y-0">
              {(trace ?? []).map((ev: any, i: number) => {
                const last = i === (trace?.length ?? 0) - 1;
                return (
                  <div key={ev._id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-base">{EVENT_ICONS[ev.event] ?? "•"}</span>
                      {!last && <span className="w-0.5 flex-1 bg-border" />}
                    </div>
                    <div className={cn("pb-3", !last && "flex-1")}>
                      <p className="text-sm font-semibold leading-5">{ev.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {fmtTime(ev.ts)} · {fmtDate(ev.ts)} · {ev.actor}
                        {ev.note ? ` · ${ev.note}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment confirm */}
          {tx && tx.paymentStatus === "paid" && !tx.collectorConfirmedAt && (
            <Button className="w-full gap-2" onClick={confirm} disabled={busy}>
              <CircleCheck className="size-4" /> ✅ Confirm Payment Received ({inr(tx.finalValue)})
            </Button>
          )}
          {tx && tx.paymentStatus === "paid" && tx.collectorConfirmedAt && (
            <p className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-2 text-sm font-semibold text-emerald-700">
              <Handshake className="size-4" /> Payment received — transaction complete
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold">{value}</p>
    </div>
  );
}
