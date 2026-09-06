import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOffline, type QueuedLot } from "@/lib/offline";

/**
 * Mounted inside the authenticated app: registers the real flush routine
 * (signed-in Convex client) with the offline provider, so queued lots are
 * pushed with proper identity when connectivity returns.
 */
export function SyncManager() {
  const { queue, registerFlusher, markSynced, setSyncState } = useOffline();
  const createLot = useMutation(api.lots.create);
  const logSync = useMutation(api.demo.logSync);
  const busy = useRef(false);
  const queueRef = useRef<QueuedLot[]>(queue);
  queueRef.current = queue;

  useEffect(() => {
    registerFlusher(async () => {
      if (busy.current) return;
      busy.current = true;
      setSyncState("waiting");
      let failed = false;
      for (const item of [...queueRef.current]) {
        try {
          await createLot({
            lotId: item.lotId,
            demo: false,
            material: item.material,
            materialLabel: item.materialLabel,
            subcategory: item.subcategory,
            description: item.description,
            photoPreview: item.photoPreview,
            weightKg: item.weightKg,
            condition: item.condition,
            estimatedValue: item.estimatedValue,
            marketRate: item.marketRate,
            city: item.city,
            locationLabel: item.locationLabel,
            lat: item.lat,
            lng: item.lng,
            recyclerId: item.recyclerId as any,
            recyclerName: item.recyclerName,
            quotedRate: item.quotedRate,
            anomalyFlag: item.anomalyFlag,
          });
          markSynced(item.localId);
        } catch {
          failed = true;
          break;
        }
      }
      setSyncState(failed ? "failed" : "synced");
      void logSync({ kind: "flush", count: queueRef.current.length }).catch(() => {});
      busy.current = false;
    });
  }, [registerFlusher, markSynced, setSyncState, createLot, logSync]);

  return null;
}
