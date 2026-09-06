import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { statusStyle } from "@/features/collector/HomeView";
import { inr, timeAgo } from "@/lib/tts";
import { cn } from "@/lib/utils";
import {
  Package, Recycle, Users, Factory, MapPin, ShieldCheck, IndianRupee,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const AUTH_LABEL: Record<string, string> = {
  verified: "🟢 Verified",
  pending: "🟡 Pending",
  expired: "🔴 Expired",
  unverified: "⚪ Unverified",
};

export function AdminApp({ profile }: { profile: any }) {
  const analytics = useQuery(api.admin.analytics, {});
  const lots = useQuery(api.lots.listAll, {}) ?? [];
  const txs = useQuery(api.transactions.listAll, {}) ?? [];
  const recyclers = useQuery(api.recyclers.list, {}) ?? [];
  const profiles = useQuery(api.profiles.listAll, {}) ?? [];
  const setAuth = useMutation(api.recyclers.setAuthStatus);

  const materialChart = useMemo(
    () =>
      (analytics?.byMaterial ?? [])
        .map((m: any) => ({ name: m.label, kg: Math.round(m.kg), lots: m.lots }))
        .sort((a: any, b: any) => b.kg - a.kg)
        .slice(0, 8),
    [analytics],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">🛡️ GreenSetu Admin</h1>
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
          Platform Team
        </Badge>
      </div>

      {/* KPI cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi icon={Package} label="Total Lots" value={String(analytics?.totalLots ?? "—")} />
        <Kpi icon={Recycle} label="Material Recycled" value={analytics ? `${Math.round(analytics.kgRecycled)} KG` : "—"} />
        <Kpi icon={IndianRupee} label="Collector Earnings" value={analytics ? inr(analytics.collectorEarnings) : "—"} />
        <Kpi icon={Factory} label="Active Recyclers" value={String(analytics?.activeRecyclers ?? "—")} />
        <Kpi icon={Users} label="Registered Users" value={String(profiles.length)} />
      </div>

      <Tabs defaultValue="analytics" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          <TabsTrigger value="lots">📦 Lots & Traceability</TabsTrigger>
          <TabsTrigger value="verification">🛡️ Authorization Verification</TabsTrigger>
          <TabsTrigger value="users">👥 Users</TabsTrigger>
        </TabsList>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">📦 Material Mix (KG)</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialChart} layout="vertical" margin={{ left: 8, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <ChartTooltip />
                    <Bar dataKey="kg" fill="#22A447" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">📍 Geographic Activity</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(analytics?.byCity ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No geographic data yet.</p>
                )}
                {(analytics?.byCity ?? []).map((c: any) => (
                  <div key={c.city} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-semibold"><MapPin className="size-4 text-primary" /> {c.city}</span>
                    <span className="text-sm text-muted-foreground">{c.lots} lots · {Math.round(c.kg)} KG</span>
                  </div>
                ))}
                <p className="pt-2 text-xs text-muted-foreground">
                  Materials tracked: {analytics?.materials ?? 0} categories · Facilities: {analytics?.recyclerFacilities ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lots & traceability */}
        <TabsContent value="lots" className="mt-4 space-y-2">
          {lots.slice(0, 30).map((l) => {
            const st = statusStyle(l.status);
            return (
              <Card key={l._id} className="border-border/70">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="font-mono text-sm font-bold">{l.lotId}</p>
                      <Badge className={cn("border-transparent", st.cls)}>{st.label}</Badge>
                      {l.demo && <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Demo</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {l.materialLabel} · {l.weightKg} KG · {l.collectorName} → {l.recyclerName ?? "—"} · {timeAgo(l.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm font-extrabold text-primary">{inr(l.finalValue ?? l.estimatedValue)}</p>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Verification */}
        <TabsContent value="verification" className="mt-4 grid gap-3 md:grid-cols-2">
          {recyclers.map((r) => (
            <Card key={r._id} className="border-border/70">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{r.logoEmoji} {r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.address}</p>
                    <p className="mt-1 font-mono text-xs">{r.authNumber}</p>
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0 border-transparent",
                      r.authStatus === "verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {AUTH_LABEL[r.authStatus]}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["verified", "pending", "expired", "unverified"] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={r.authStatus === s ? "default" : "outline"}
                      className="h-7 px-2.5 text-[11px]"
                      onClick={() => setAuth({ recyclerId: r._id, authStatus: s })}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
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
