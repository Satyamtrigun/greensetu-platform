import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Factory, UserRound } from "lucide-react";
import { toast } from "sonner";

export function RoleChooser({ displayName }: { displayName: string }) {
  const recyclers = useQuery(api.recyclers.list, {}) ?? [];
  const upsert = useMutation(api.profiles.upsert);
  const [role, setRole] = useState<"collector" | "recycler" | "admin">("collector");
  const [name, setName] = useState(displayName.split("@")[0]);
  const [facilityId, setFacilityId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const choose = async () => {
    setBusy(true);
    try {
      await upsert({
        platformRole: role,
        displayName: name.trim() || "User",
        city: "Delhi",
        facilityId: role === "recycler" && facilityId ? (facilityId as any) : undefined,
      });
      toast.success("Profile created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Welcome to GreenSetu 👋</CardTitle>
          <CardDescription>Choose how you want to use GreenSetu. You can change this later.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <RoleCard
              active={role === "collector"}
              onClick={() => setRole("collector")}
              icon={<UserRound className="size-5" />}
              emoji="🧺"
              title="Collector"
              desc="Kabadiwala / scrap collector — sell e-waste at fair prices"
            />
            <RoleCard
              active={role === "recycler"}
              onClick={() => setRole("recycler")}
              icon={<Factory className="size-5" />}
              emoji="🏭"
              title="Recycler"
              desc="Authorized recycler — receive lots, quote, pay"
            />
            <RoleCard
              active={role === "admin"}
              onClick={() => setRole("admin")}
              icon={<ShieldCheck className="size-5" />}
              emoji="🛡️"
              title="Admin"
              desc="Platform team — verify & monitor ecosystem"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Display name</label>
            <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          {role === "recycler" && (
            <div>
              <label className="text-sm font-medium">Bind to facility (demo facilities)</label>
              <Select value={facilityId} onValueChange={setFacilityId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose your recycling facility" />
                </SelectTrigger>
                <SelectContent>
                  {recyclers.map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.logoEmoji} {r.name} ({r.authStatus})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button className="w-full" size="lg" onClick={choose} disabled={busy || (role === "recycler" && !facilityId)}>
            {busy ? "Creating profile…" : "Continue"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Demo note: in production, recycler & admin roles are verified by the platform team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function RoleCard({
  active, onClick, icon, emoji, title, desc,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; emoji: string; title: string; desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border-2 p-4 text-left transition-all ${
        active ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-primary/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        <span className="text-lg">{emoji}</span>
      </div>
      <p className="mt-2 font-bold">{title}</p>
      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{desc}</p>
    </button>
  );
}
