import { useAuth } from "@/hooks/use-auth";
import { useSeedOnce } from "@/hooks/use-seed-once";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RoleChooser } from "@/features/collector/RoleChooser";
import { CollectorApp } from "@/features/collector/CollectorApp";
import { RecyclerApp } from "@/features/recycler/RecyclerApp";
import { AdminApp } from "@/features/admin/AdminApp";
import { SyncManager } from "@/components/gs/SyncManager";
import { GsWordmark } from "@/components/gs/Logo";
import { SyncBadge } from "@/components/gs/SyncBadge";
import { LanguageSwitcher } from "@/components/gs/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Link } from "react-router";

export default function App() {
  const { user, signOut } = useAuth();
  useSeedOnce();
  const profile = useQuery(api.profiles.getMine, {});

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3">
          <Link to="/app" className="shrink-0"><GsWordmark compact /></Link>
          <div className="flex items-center gap-2">
            <SyncBadge />
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <Button
              variant="ghost"
              size="icon"
              title="Sign out"
              onClick={async () => {
                await signOut();
                location.href = "/";
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {profile === undefined ? (
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          <span className="animate-pulse">Loading GreenSetu…</span>
        </div>
      ) : profile === null ? (
        <RoleChooser displayName={user?.name ?? user?.email ?? "User"} />
      ) : (
        <>
          <SyncManager />
          {profile.platformRole === "collector" ? (
            <CollectorApp profile={profile} />
          ) : profile.platformRole === "recycler" ? (
            <RecyclerApp profile={profile} />
          ) : (
            <AdminApp profile={profile} />
          )}
        </>
      )}
    </div>
  );
}
