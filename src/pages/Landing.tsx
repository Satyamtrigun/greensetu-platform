import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSeedOnce } from "@/hooks/use-seed-once";
import { SiteHeader } from "@/components/gs/SiteHeader";
import { SiteFooter } from "@/components/gs/SiteFooter";
import { PriceBoard } from "@/components/gs/PriceBoard";
import { RecyclerMap } from "@/components/gs/RecyclerMap";
import { GsLogo } from "@/components/gs/Logo";
import { SafetyGrid } from "@/components/gs/SafetyGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSwitcher } from "@/components/gs/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Banknote,
  Building2,
  Camera,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Handshake,
  Landmark,
  MapPin,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Volume2,
} from "lucide-react";
import { motion } from "framer-motion";

const FLOW = [
  { icon: Camera, emoji: "📸", titleKey: "flow.s1", descKey: "flow.s1d" },
  { icon: Sparkles, emoji: "🤖", titleKey: "flow.s2", descKey: "flow.s2d" },
  { icon: Banknote, emoji: "💰", titleKey: "flow.s3", descKey: "flow.s3d" },
  { icon: MapPin, emoji: "📍", titleKey: "flow.s4", descKey: "flow.s4d" },
  { icon: QrCode, emoji: "🤝", titleKey: "flow.s5", descKey: "flow.s5d" },
  { icon: CheckCircle2, emoji: "💵", titleKey: "flow.s6", descKey: "flow.s6d" },
];

const PARTNERS = [
  { icon: RecycleIcon, label: "Authorized Recyclers", note: "CPCB / SPCB authorized facilities" },
  { icon: Handshake, label: "NGOs", note: "Waste picker livelihood programs" },
  { icon: Building2, label: "CSR Partners", note: "Corporate sustainability funding" },
  { icon: Landmark, label: "Government Ecosystem", note: "EPR bodies & urban local bodies" },
  { icon: GraduationCap, label: "Research Organizations", note: "Material flow & policy research" },
];

function RecycleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 19H4.8a1.8 1.8 0 0 1-1.56-2.7L6 11" />
      <path d="m11 19-2 3" />
      <path d="M13.2 3.4 16 8" />
      <path d="M17 19h2.2a1.8 1.8 0 0 0 1.56-2.7L19 13" />
      <path d="m9.2 8 2.6-4.6a1.8 1.8 0 0 1 3.1 0L17 7" />
      <path d="M14 19h-4" />
    </svg>
  );
}

export default function Landing() {
  const { t, lang } = useI18n();
  const { isAuthenticated } = useAuth();
  useSeedOnce();
  const [contactOk, setContactOk] = useState(false);

  const go = (hash: string) => () =>
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 500px at 70% -10%, rgba(34,164,71,0.14), transparent 60%), radial-gradient(800px 400px at 10% 110%, rgba(139,195,74,0.12), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 lg:grid-cols-2 lg:pb-24 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
              <GsLogo size={16} /> {t("hero.badge")}
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              ♻️ Green
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Setu</span>
            </h1>
            <p className="mt-3 text-xl font-bold text-primary">Sell Smart. Earn Fair. Recycle Right.</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{t("hero.sub")}</p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                <a href="/auth">
                  💰 {t("nav.start")}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/5">
                <a href="#recyclers" onClick={go("#recyclers")}>
                  ♻️ {t("nav.findRecycler")}
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost" className="gap-2 text-muted-foreground">
                <a href="#how" onClick={go("#how")}>
                  ▶️ {t("hero.seeHow")}
                </a>
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-emerald-600" /> Verified recyclers only</span>
              <span className="flex items-center gap-1.5"><ScanLine className="size-4 text-emerald-600" /> QR traceability</span>
              <span className="hidden items-center gap-1.5 sm:flex"><Volume2 className="size-4 text-emerald-600" /> Voice in हिंदी / मराठी</span>
            </div>
          </motion.div>

          {/* Bridge visual: Collector → GreenSetu → Recycler */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-xl shadow-emerald-900/5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 rounded-2xl border border-border/60 bg-background p-3 text-center">
                  <div className="text-3xl">🧺</div>
                  <p className="mt-1 text-xs font-bold">Scrap Collector</p>
                  <p className="text-[10px] text-muted-foreground">(कबाड़ी / संग्रहकर्ता)</p>
                </div>
                <div className="flex flex-col items-center gap-1 px-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">SELLS TO</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 rounded-2xl border-2 border-primary/50 bg-primary/5 p-3 text-center shadow-inner">
                  <GsLogo size={34} className="mx-auto" />
                  <p className="mt-1 text-xs font-extrabold text-primary">GreenSetu</p>
                  <p className="text-[10px] text-muted-foreground">Fair Price · Connect · Track · Get Paid</p>
                </div>
                <div className="flex flex-col items-center gap-1 px-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">FORMAL</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 rounded-2xl border border-border/60 bg-background p-3 text-center">
                  <div className="text-3xl">🏭</div>
                  <p className="mt-1 text-xs font-bold">Authorized Recycler</p>
                  <p className="text-[10px] text-muted-foreground">(अधिकृत रिसाइकलर)</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: Smartphone, label: "Mobile-first app" },
                  { icon: Truck, label: "Pickup or drop-off" },
                  { icon: QrCode, label: "QR handover proof" },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl border border-dashed border-border/70 p-2.5">
                    <f.icon className="mx-auto size-4 text-primary" />
                    <p className="mt-1 text-[10px] font-medium text-muted-foreground">{f.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-primary to-emerald-500 px-4 py-2.5 text-white">
                <span className="text-xs font-semibold">आज सही कदम, कल एक स्वच्छ भारत</span>
                <RecycleIcon className="size-4" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── HOW IT WORKS ───────────────────────── */}
      <section id="how" className="border-y border-border/60 bg-card/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">{t("flow.title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("flow.sub")}</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FLOW.map((s, i) => (
              <motion.div
                key={s.titleKey}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="relative h-full overflow-hidden border-border/70">
                  <CardContent className="p-5">
                    <span className="absolute right-4 top-3 text-4xl font-black text-primary/10">{i + 1}</span>
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-2xl">{s.emoji}</div>
                    <h3 className="mt-3 font-bold">{t(s.titleKey)}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{t(s.descKey)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── PRICE BOARD ───────────────────────── */}
      <section id="prices" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <PriceBoard />
        </div>
      </section>

      {/* ───────────────────────── RECYCLER MAP ───────────────────────── */}
      <section id="recyclers" className="border-y border-border/60 bg-card/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">{t("map.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("map.sub")}</p>
            </div>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
              OpenStreetMap · demo locations
            </Badge>
          </div>
          <RecyclerMap height={430} />
          <p className="mt-3 text-xs text-muted-foreground">
            Popup shows authorization status, offered rate, distance, pickup availability and rating. Sign in to sell directly to a recycler.
          </p>
        </div>
      </section>

      {/* ───────────────────────── UNIT ECONOMICS ───────────────────────── */}
      <section id="economics" className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">{t("eco.title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("eco.sub")}</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <Card className="border-border/70">
              <CardContent className="p-6">
                <p className="text-sm font-bold text-muted-foreground">{t("eco.traditional")}</p>
                <EcoRow label={t("eco.materialValue")} value="₹8,000" />
                <EcoRow label={t("eco.middlemanLoss")} value="− ₹1,000" negative />
                <EcoRow label={t("eco.travel")} value="− ₹500" negative />
                <div className="mt-3 border-t pt-3">
                  <EcoRow label={t("eco.final")} value="₹6,500" big />
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-2 border-primary/40">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary to-emerald-400" />
              <CardContent className="p-6">
                <p className="text-sm font-bold text-primary">{t("eco.greensetu")}</p>
                <EcoRow label={t("eco.materialValue")} value="₹8,800" />
                <EcoRow label={t("eco.travel")} value="− ₹200" negative />
                <EcoRow label={t("eco.platformFee")} value="− ₹100" negative />
                <div className="mt-3 border-t pt-3">
                  <EcoRow label={t("eco.final")} value="₹8,500" big />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mx-auto mt-6 w-fit rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-center">
            <p className="text-sm font-semibold text-emerald-800">{t("eco.additional")}</p>
            <p className="text-3xl font-black text-emerald-700">+₹2,000</p>
          </div>
        </div>
      </section>

      {/* ───────────────────────── PARTNERS ───────────────────────── */}
      <section id="partners" className="border-y border-border/60 bg-card/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">{t("partners.title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("partners.sub")}</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PARTNERS.map((p) => (
              <Card key={p.label} className="border-border/70 transition-shadow hover:shadow-md">
                <CardContent className="p-5 text-center">
                  <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <p.icon className="size-5" />
                  </div>
                  <p className="mt-3 text-sm font-bold">{p.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{p.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── SAFETY ───────────────────────── */}
      <section id="safety" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SafetyGrid lang={lang} />
        </div>
      </section>

      {/* ───────────────────────── CONTACT ───────────────────────── */}
      <section id="contact" className="border-t border-border/60 bg-card/60 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{t("contact.title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("contact.sub")}</p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2 font-medium"><Building2 className="size-4 text-primary" /> {t("contact.recycler")}</div>
              <div className="flex items-center gap-2 font-medium"><Handshake className="size-4 text-primary" /> {t("contact.collector")}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><FlaskConical className="size-4" /> NGO / research / CSR collaborations welcome</div>
            </div>
            <div className="mt-6"><LanguageSwitcher /></div>
          </div>
          <Card>
            <CardContent className="p-6">
              {contactOk ? (
                <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
                  <CheckCircle2 className="size-10 text-emerald-500" />
                  <p className="mt-3 font-semibold">{t("contact.sent")}</p>
                </div>
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactOk(true);
                  }}
                >
                  <Input required placeholder={t("contact.name")} />
                  <Input required type="email" placeholder={t("contact.email")} />
                  <Textarea required rows={4} placeholder={t("contact.msg")} />
                  <Button type="submit" className="w-full">{t("contact.send")}</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function EcoRow({ label, value, negative, big }: { label: string; value: string; negative?: boolean; big?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-1.5", big && "pt-2")}>
      <span className={cn("text-sm text-muted-foreground", big && "font-bold text-foreground")}>{label}</span>
      <span className={cn(
        "font-semibold",
        negative && "text-red-600",
        big && "text-2xl font-black text-primary",
      )}>
        {value}
      </span>
    </div>
  );
}
