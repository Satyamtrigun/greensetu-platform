import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useI18n, pickLabel } from "@/lib/i18n";
import { inr, speak, priceAnnouncement } from "@/lib/tts";
import { useOffline } from "@/lib/offline";
import { classifyMaterial, estimateValue, rankRecyclers, isLowOffer, CONFIDENCE_THRESHOLD } from "@/lib/ai";
import { DEMO_COLLECTOR_HOME, type MaterialDef } from "@/lib/greensetu-data";
import { handoverRecordText } from "@/lib/qr";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Camera, Image as ImageIcon, ScanSearch, CheckCircle2, ChevronLeft, Weight,
  MapPin, Truck, Star, ShieldCheck, TriangleAlert, QrCode, Copy, RotateCcw, Volume2,
} from "lucide-react";
import { QRCodeSvg } from "./QRCodeSvg";

type Step = "photo" | "detect" | "weight" | "value" | "recyclers" | "done";

export function SellFlow({ onDone }: { onDone: () => void }) {
  const { t, lang } = useI18n();
  const { enqueueLot, online } = useOffline();

  const materials = useQuery(api.materials.list, {}) ?? [];
  const recyclers = useQuery(api.recyclers.list, {}) ?? [];
  const nextLotId = useQuery(api.lots.nextLotId, {});
  const createLot = useMutation(api.lots.create);
  const selectRecycler = useMutation(api.lots.selectRecycler);

  const [step, setStep] = useState<Step>("photo");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>("");
  const [guess, setGuess] = useState<{ category: string; confidence: number } | null>(null);
  const [manualMaterial, setManualMaterial] = useState(false);
  const [materialKey, setMaterialKey] = useState<string | null>(null);
  const [weightKg, setWeightKg] = useState(5);
  const [condition, setCondition] = useState<"good" | "average" | "damaged">("good");
  const [selectedRecycler, setSelectedRecycler] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [createdLot, setCreatedLot] = useState<{ lotId: string; finalValue?: number; recycler?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const material: MaterialDef | undefined = materials.find((m: any) => m.key === materialKey);

  const matches = useMemo(() => {
    if (!material || recyclers.length === 0) return [];
    return rankRecyclers(recyclers, {
      materialKey: material.key,
      marketRate: material.basePrice,
      userLat: DEMO_COLLECTOR_HOME.lat,
      userLng: DEMO_COLLECTOR_HOME.lng,
    });
  }, [material, recyclers]);

  const estimate = material ? estimateValue(material, weightKg, condition) : null;

  const onPickFile = async (file: File) => {
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = (reader.result as string).split(",")[1]
        ? (reader.result as string)
        : (reader.result as string);
      // Downscale to a small preview for storage/queue efficiency
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 320 / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhotoPreview(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.src = reader.result as string;
      setPhotoPreview(reader.result as string);

      setStep("detect");
      const g = await classifyMaterial(file);
      setGuess(g);
      const catMatch = materials.find((m: any) =>
        m.category.toLowerCase() === g.category.toLowerCase(),
      );
      if (catMatch && g.confidence >= CONFIDENCE_THRESHOLD) {
        setMaterialKey(catMatch.key);
      } else {
        setManualMaterial(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setStep("photo");
    setPhotoPreview(null);
    setPhotoName("");
    setGuess(null);
    setManualMaterial(false);
    setMaterialKey(null);
    setWeightKg(5);
    setCondition("good");
    setSelectedRecycler(null);
    setCreatedLot(null);
  };

  const finishWithRecycler = async (rec: any) => {
    if (!material || !estimate) return;
    setSelectedRecycler(rec);
    setBusy(true);
    try {
      const lotId = nextLotId ?? `GS-DEL-2026-${String(Math.floor(Math.random() * 900000) + 100000)}`;
      const offered = rec.offeredRate ?? material.basePrice;
      const anomaly = isLowOffer(offered, material.basePrice);

      if (online) {
        const docId = await createLot({
          lotId,
          demo: false,
          material: material.key,
          materialLabel: pickLabel(lang, material),
          weightKg,
          condition,
          estimatedValue: estimate.value,
          marketRate: material.basePrice,
          city: DEMO_COLLECTOR_HOME.city,
          locationLabel: DEMO_COLLECTOR_HOME.label,
          lat: DEMO_COLLECTOR_HOME.lat,
          lng: DEMO_COLLECTOR_HOME.lng,
          recyclerId: rec._id,
          recyclerName: rec.name,
          quotedRate: offered,
          anomalyFlag: anomaly,
          photoPreview: photoPreview ?? undefined,
        });
        // Update final value if quote differs (selectRecycler recalculates)
        if (rec.offeredRate != null) {
          await selectRecycler({ lotDocId: docId, recyclerId: rec._id });
        }
      } else {
        enqueueLot({
          lotId,
          material: material.key,
          materialLabel: pickLabel(lang, material),
          weightKg,
          condition,
          estimatedValue: estimate.value,
          marketRate: material.basePrice,
          city: DEMO_COLLECTOR_HOME.city,
          locationLabel: DEMO_COLLECTOR_HOME.label,
          lat: DEMO_COLLECTOR_HOME.lat,
          lng: DEMO_COLLECTOR_HOME.lng,
          recyclerId: rec._id,
          recyclerName: rec.name,
          quotedRate: offered,
          anomalyFlag: anomaly,
          photoPreview: photoPreview ?? undefined,
        });
        toast.info("Saved offline — will sync when internet returns");
      }

      setCreatedLot({ lotId, finalValue: Math.round(offered * weightKg), recycler: rec.name });
      setStep("done");
      toast.success(`Lot ${lotId} created 🎉`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create lot");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stepper */}
      <div className="flex items-center gap-1.5">
        {(["photo", "detect", "weight", "value", "recyclers", "done"] as Step[]).map((s, i) => {
          const order: Step[] = ["photo", "detect", "weight", "value", "recyclers", "done"];
          const active = order.indexOf(step) >= i;
          return <div key={s} className={cn("h-1.5 flex-1 rounded-full", active ? "bg-primary" : "bg-muted")} />;
        })}
      </div>

      {step !== "photo" && step !== "done" && (
        <Button variant="ghost" size="sm" className="-ml-2 gap-1 text-muted-foreground" onClick={() => {
          const order: Step[] = ["photo", "detect", "weight", "value", "recyclers", "done"];
          const idx = order.indexOf(step);
          setStep(order[Math.max(0, idx - 1)]);
        }}>
          <ChevronLeft className="size-4" /> {t("common.back")}
        </Button>
      )}

      {/* STEP: photo */}
      {step === "photo" && (
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-extrabold">📸 Take Material Photo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Photo helps recyclers verify material quality.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 transition-colors hover:bg-primary/10"
              >
                <Camera className="size-8 text-primary" />
                <span className="text-sm font-bold">📷 Camera</span>
                <span className="text-[11px] text-muted-foreground">or upload from gallery</span>
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 p-6 transition-colors hover:bg-muted"
              >
                <ImageIcon className="size-8 text-muted-foreground" />
                <span className="text-sm font-bold">🖼️ Upload Image</span>
                <span className="text-[11px] text-muted-foreground">JPG / PNG</span>
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickFile(f);
              }}
            />
            {!online && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                You are offline — the lot will be saved and synced later.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP: detect */}
      {step === "detect" && (
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-extrabold">🤖 Material Detection</h2>
            {!photoPreview && <Skeleton className="mx-auto mt-4 h-40 w-40 rounded-xl" />}
            {photoPreview && (
              <img src={photoPreview} alt="material" className="mx-auto mt-4 h-40 w-40 rounded-xl object-cover" />
            )}
            {!guess ? (
              <>
                <div className="mx-auto mt-4 flex max-w-xs items-center gap-2">
                  <ScanSearch className="size-4 animate-pulse text-primary" />
                  <Progress value={66} className="h-2" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Analyzing photo… (demo AI)</p>
              </>
            ) : (
              <>
                {manualMaterial ? (
                  <>
                    <p className="mt-3 text-sm font-medium text-amber-700">
                      Low confidence — please select the material:
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {materials.map((m: any) => (
                        <button
                          key={m._id}
                          onClick={() => { setMaterialKey(m.key); }}
                          className={cn(
                            "rounded-xl border-2 p-2 text-center transition-transform active:scale-95",
                            materialKey === m.key ? "border-primary bg-primary/5" : "border-border/60",
                          )}
                        >
                          <span className="text-xl">{m.emoji}</span>
                          <p className="mt-0.5 truncate text-[10px] font-semibold">{pickLabel(lang, m)}</p>
                        </button>
                      ))}
                    </div>
                    <Button
                      className="mt-4 w-full"
                      disabled={!materialKey}
                      onClick={() => setStep("weight")}
                    >
                      {t("common.next")}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="mt-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">AI Detected</p>
                      <p className="mt-1 text-3xl">{material?.emoji}</p>
                      <p className="text-lg font-extrabold text-emerald-800">{guess.category}</p>
                      <p className="mt-1 text-xs text-emerald-700">
                        Confidence: {Math.round(guess.confidence * 100)}%
                      </p>
                    </div>
                    <Button className="mt-4 w-full gap-2" onClick={() => setStep("weight")}>
                      <CheckCircle2 className="size-4" /> ✅ {t("common.confirm")}
                    </Button>
                  </>
                )}
                <button className="mt-2 text-xs text-muted-foreground underline" onClick={reset}>
                  <RotateCcw className="mr-1 inline size-3" /> Retake photo
                </button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP: weight */}
      {step === "weight" && material && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-center text-lg font-extrabold">⚖️ Enter Approximate Weight</h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              {material.emoji} {pickLabel(lang, material)}
            </p>
            <div className="mx-auto mt-5 w-fit rounded-2xl border-2 border-primary/30 bg-primary/5 px-8 py-4 text-center">
              <Input
                type="number"
                min={0.1}
                step={0.1}
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(0.1, Number(e.target.value)))}
                className="w-32 border-0 bg-transparent text-center text-3xl font-black focus-visible:ring-0"
              />
              <p className="text-sm font-bold text-muted-foreground">KG</p>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[1, 5, 10, 25].map((kg) => (
                <Button key={kg} variant="outline" onClick={() => setWeightKg(kg)}>
                  {kg} KG
                </Button>
              ))}
            </div>
            <Button className="mt-5 w-full" size="lg" onClick={() => setStep("value")}>
              {t("common.next")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP: value */}
      {step === "value" && material && estimate && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-center text-lg font-extrabold">💰 Estimated Market Value</h2>
            <p className="mt-4 text-center text-4xl font-black text-primary">{inr(estimate.value)}</p>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              {weightKg} KG × {inr(estimate.averageRate)}/KG
              <span className="ml-2 text-xs">(incl. condition: {condition})</span>
            </p>

            <div className="mt-5 space-y-2 rounded-xl border border-border/60 p-4 text-sm">
              <Row label="Market Range" value={`${inr(estimate.marketLow)} – ${inr(estimate.marketHigh)}`} />
              <Row label="Average Market Price" value={`${inr(estimate.averageRate)}/KG`} />
              <Row
                label="Trend"
                value={
                  <span className={material.trendPct >= 0 ? "text-emerald-600" : "text-red-600"}>
                    {material.trendPct >= 0 ? "📈" : "📉"} {material.trendPct >= 0 ? "+" : ""}{material.trendPct}% This Week
                  </span>
                }
              />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">Condition</p>
              <div className="grid grid-cols-3 gap-2">
                {(["good", "average", "damaged"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCondition(c)}
                    className={cn(
                      "rounded-xl border-2 py-2.5 text-sm font-semibold capitalize transition-colors",
                      condition === c ? "border-primary bg-primary/5" : "border-border/60",
                    )}
                  >
                    {c === "good" ? "👍" : c === "average" ? "👌" : "🔧"} {c}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-[11px] leading-5 text-muted-foreground">
              This is an approximate estimate. Final value depends on material quality and recycler inspection.
            </p>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() =>
                  speak(
                    priceAnnouncement(lang, pickLabel(lang, material), estimate.averageRate),
                    lang,
                  )
                }
              >
                <Volume2 className="size-4" /> Listen
              </Button>
              <Button className="flex-1" onClick={() => setStep("recyclers")}>
                {t("common.next")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP: recyclers */}
      {step === "recyclers" && material && estimate && (
        <div className="space-y-3">
          <h2 className="text-lg font-extrabold">🏭 Choose a Recycler</h2>
          <p className="text-sm text-muted-foreground">
            Ranked by authorization, price, distance, pickup & material match.
          </p>
          {matches.map((r, idx) => {
            const offered = r.offeredRate ?? material.basePrice;
            const low = isLowOffer(offered, material.basePrice);
            const finalV = Math.round(offered * weightKg);
            return (
              <Card key={r._id} className={cn("overflow-hidden", idx === 0 && "border-2 border-primary/50")}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {idx === 0 && <Badge className="bg-primary">🥇 Best Deal</Badge>}
                        {idx === 0 && r.distanceKm <= Math.min(...matches.map((x) => x.distanceKm)) && (
                          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">📍 Nearest</Badge>
                        )}
                        {r.authStatus === "verified" ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><ShieldCheck className="size-3.5" /> Authorized</span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-700">🟡 {r.authStatus}</span>
                        )}
                      </div>
                      <p className="mt-1.5 truncate font-bold">{r.logoEmoji} {r.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>💰 {inr(offered)}/KG</span>
                        <span>📍 {r.distanceKm.toFixed(1)} KM</span>
                        <span>🚚 {r.pickupAvailable ? "Pickup Available" : "No Pickup"}</span>
                        <span className="flex items-center gap-0.5"><Star className="size-3 text-amber-500" /> {r.rating}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-black text-primary">{inr(finalV)}</p>
                      <p className="text-[10px] text-muted-foreground">for {weightKg} KG</p>
                    </div>
                  </div>

                  {low && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                      <span><b>⚠️ LOW OFFER WARNING</b> — This offer is significantly below the usual market price. You can still proceed.</span>
                    </div>
                  )}

                  <Button
                    className="mt-3 w-full"
                    disabled={busy}
                    onClick={() => finishWithRecycler(r)}
                  >
                    {busy && selectedRecycler?._id === r._id ? "Creating lot…" : idx === 0 ? "SELL HERE" : "SELL HERE"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* STEP: done → QR handover */}
      {step === "done" && createdLot && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-emerald-500 px-4 py-3 text-center text-white">
            <CheckCircle2 className="mx-auto size-8" />
            <p className="mt-1 text-sm font-bold">Lot Created — Show QR at Handover</p>
          </div>
          <CardContent className="p-6 text-center">
            <p className="font-mono text-lg font-extrabold tracking-wide">{createdLot.lotId}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {createdLot.recycler} · {createdLot.finalValue != null ? inr(createdLot.finalValue) : "—"}
            </p>
            <div className="mx-auto mt-4 w-fit rounded-2xl border-2 border-primary/30 bg-white p-3 shadow-sm">
              <QRCodeSvg value={handoverRecordText({
                lotId: createdLot.lotId,
                collector: "You",
                recycler: createdLot.recycler,
                material: material?.labelEn ?? "",
                weightKg,
                finalValue: createdLot.finalValue,
              })} size={168} />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Recycler scans this QR to confirm receipt. Record is stored in the lot's traceability timeline.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1 gap-1.5" onClick={reset}>
                <RotateCcw className="size-4" /> Sell More
              </Button>
              <Button className="flex-1" onClick={onDone}>View My Lots</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
