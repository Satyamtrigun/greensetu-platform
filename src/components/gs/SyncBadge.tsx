import { useOffline } from "@/lib/offline";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SyncBadge() {
  const { online, syncState } = useOffline();
  const { t } = useI18n();

  const state = !online ? "waiting" : syncState;
  const map = {
    synced: { dot: "bg-emerald-500", text: t("common.synced"), title: "Online" },
    waiting: { dot: "bg-amber-500", text: t("common.offline"), title: "Offline" },
    failed: { dot: "bg-red-500", text: "Sync failed", title: "Sync failed" },
  }[state];

  return (
    <span
      title={map.title}
      className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
    >
      <span className={cn("size-2 rounded-full", map.dot, state !== "synced" && "animate-pulse")} />
      {map.text}
    </span>
  );
}
