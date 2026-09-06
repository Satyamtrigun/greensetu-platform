import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSvg } from "@/features/collector/QRCodeSvg";
import { statusStyle } from "@/features/collector/HomeView";
import { inr, timeAgo } from "@/lib/tts";
import { handoverRecordText as hoText } from "@/lib/qr";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Inbox, Quote, Truck, Recycle, Wallet, ShieldCheck, ScanLine, PackageCheck, Banknote,
} from "lucide-react";

const AUTH_LABEL: Record<string, string> = {
  verified: "🟢 Verified",
  pending: "🟡 Pending",
  expired: "🔴 Expired",
  unverified: "⚪ Unverified",
};

export function RecyclerApp({ profile }: { profile: any }) {
  const facility = useQuery(api.recyclers.getByUser, {});
  const lots = useQuery(api.lots.listForRecyclerUser, {}) ?? [];
  const txs = useQuery(api.transactions.listForRecyclerUser, {}) ?? [];
  const materials = useQuery(api.materials.list, {}) ?? [];
  const markPaid = useMutation(api.transactions.markPaid);
  const updateStatus = useMutation(api.lots.updateStatus);

  const [confirmLot, setConfirmLot] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => {
    const incoming = lots.filter((l) => ["created", "matched", "quoted", "pickup_requested", "pickup_scheduled"].includes(l.status));
    const pendingQuotes = lots.filter((l) => l.status === "matched" && !l.quotedRate);
    const completed = lots.filter((l) => ["paid", "completed"].includes(l.status));
    const totalKg = lots.reduce((s, l) => s + l.weightKg, 0);
    const paidOut = txs.filter((t) => t.paymentStatus === "paid").reduce((s, t) => s + t.finalValue, 0);
    return { incoming, pendingQuotes, completed, totalKg, paidOut };
  }, [lots, txs]);

  if (facility === undefined) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Loading facility…</div>;
  }

  if (!facility) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="font-bold">🏭 No facility linked to this account</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a facility in your profile, or sign up as a collector instead.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const confirmHandover = async () => {
    if (!confirmLot) return;
    setBusy(true);
    try {
      await updateStatus({ lotDocId: confirmLot._id, status: "confirmed" });
      setConfirmLot(null);
      toast.success("Material received — payment now pending");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold">{facility.logoEmoji} {facility.name}</h1>
          <p className="text-sm text-muted-foreground">{facility.address}</p>
        </div>
        <Badge
          className={cn(
            "border-transparent",
            facility.authStatus === "verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
          )}
        >
          {AUTH_LABEL[facility.authStatus]}
        </Badge>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat icon={Inbox} label="Incoming Lots" value={String(stats.incoming.length)} />
        <Stat icon={Quote} label="Pending Quotes" value={String(stats.pendingQuotes.length)} />
        <Stat icon={Recycle} label="Completed" value={String(stats.completed.length)} />
        <Stat icon={PackageCheck} label="Total Material" value={`${Math.round(stats.totalKg)} KG`} />
        <Stat icon={Wallet} label="Paid Out" value={inr(stats.paidOut)} />
      </div>

      <Tabs defaultValue="lots" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="lots">📦 Incoming Lots</TabsTrigger>
          <TabsTrigger value="payments">💵 Payments</TabsTrigger>
          <TabsTrigger value="prices">📈 Price Management</TabsTrigger>
          <TabsTrigger value="auth">🛡️ Authorization</TabsTrigger>
        </TabsList>

        {/* Incoming lots */}
        <TabsContent value="lots" className="mt-4 space-y-3">
          {lots.length === 0 && (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
              No lots routed to your facility yet.
            </CardContent></Card>
          )}
          {lots.map((l) => {
            const st = statusStyle(l.status);
            return (
              <Card key={l._id} className="border-border/70">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-bold">{l.materialLabel} · {l.weightKg} KG</p>
                      <Badge className={cn("border-transparent", st.cls)}>{st.label}</Badge>
                      {l.demo && <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Demo</Badge>}
                      {l.anomalyFlag && <Badge className="border-transparent bg-amber-100 text-amber-800">⚠️ Low offer</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {l.lotId} · {l.collectorName} · {timeAgo(l.createdAt)}
                      {l.locationLabel ? ` · 📍 ${l.locationLabel}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{inr(l.finalValue ?? l.estimatedValue)}</p>
                      <p className="text-[10px] text-muted-foreground">{l.quotedRate ? `${inr(l.quotedRate)}/kg` : "—"}</p>
                    </div>
                    {["matched", "quoted", "pickup_scheduled"].includes(l.status) && (
                      <Button size="sm" className="gap-1.5" onClick={() => setConfirmLot(l)}>
                        <ScanLine className="size-4" /> Scan / Confirm
                      </Button>
                      )}
                    {["handed_over"].includes(l.status) && (
                      <Button size="sm" className="gap-1.5" onClick={() => setConfirmLot(l)}>
                        <ScanLine className="size-4" /> Confirm Receipt
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="mt-4 space-y-3">
          {txs.length === 0 && (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
              No transactions yet. Confirm a handover to create one.
            </CardContent></Card>
          )}
          {txs.map((t) => (
            <Card key={t._id} className="border-border/70">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-bold">{t.materialLabel} · {t.weightKg} KG · {t.collectorName}</p>
                  <p className="text-xs text-muted-foreground">{t.lotId} · {timeAgo(t.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-base font-black">{inr(t.finalValue)}</p>
                  {t.paymentStatus === "paid" ? (
                    <Badge className="border-transparent bg-emerald-100 text-emerald-800">✅ Paid (cash)</Badge>
                  ) : (
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await markPaid({ transactionId: t._id, method: "cash" });
                          toast.success("Marked as cash paid");
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Failed");
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      <Banknote className="size-4" /> Mark Cash Paid
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Price management */}
        <TabsContent value="prices" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">📈 Your Offered Rates (Demo — read only)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {facility.rates.map((r) => {
                const mat = materials.find((m: any) => m.key === r.material);
                return (
                  <div key={r.material} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                    <span className="text-sm font-medium">{mat?.emoji} {mat?.labelEn ?? r.material}</span>
                    <span className="text-sm font-bold text-primary">{inr(r.rate)}/kg</span>
                  </div>
                );
              })}
              <p className="pt-1 text-xs text-muted-foreground">
                Rate editing is part of the production roadmap; shown from facility data for demo.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authorization */}
        <TabsContent value="auth" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">🛡️ Authorization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row k="Facility" v={facility.name} />
              <Row k="Authorization Number" v={facility.authNumber} />
              <Row k="Status" v={AUTH_LABEL[facility.authStatus]} />
              <Row k="Valid Until" v={facility.authExpiry} />
              <Row k="Contact" v={facility.phone} />
              <Row k="Service Radius" v={`${facility.serviceRadiusKm} KM`} />
              <Row k="Pickup" v={facility.pickupAvailable ? "Available" : "Drop-off only"} />
              <Row k="Materials Accepted" v={`${facility.materialsAccepted.length} categories`} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR confirm dialog */}
      <Dialog open={!!confirmLot} onOpenChange={(o) => !o && setConfirmLot(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>🔳 Scan Collector's Handover QR</DialogTitle>
          </DialogHeader>
          {confirmLot && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/70 p-4 text-center">
                <p className="text-sm font-bold">{confirmLot.materialLabel} · {confirmLot.weightKg} KG</p>
                <p className="font-mono text-xs text-muted-foreground">{confirmLot.lotId}</p>
                <div className="mx-auto mt-3 w-fit rounded-lg bg-white p-2">
                  <QRCodeSvg
                    size={130}
                    value={hoText({
                      lotId: confirmLot.lotId,
                      handoverRef: confirmLot.handoverRef,
                      collector: confirmLot.collectorName,
                      recycler: confirmLot.recyclerName ?? undefined,
                      material: confirmLot.materialLabel,
                      weightKg: confirmLot.weightKg,
                      finalValue: confirmLot.finalValue,
                      city: confirmLot.city,
                      ts: confirmLot.createdAt,
                    })}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Ask the collector to open the lot and show this QR. Scan it to confirm physical receipt.
                </p>
              </div>
              <Button className="w-full gap-2" onClick={confirmHandover} disabled={busy}>
                <PackageCheck className="size-4" /> ✅ Material Received
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Duplicate confirmations are blocked by the system.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="border-border/70">
      <CardContent className="flex items-center gap-3 p-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-muted-foreground">{label}</p>
          <p className="text-lg font-extrabold leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-1.5 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-semibold">{v}</span>
    </div>
  );
}
