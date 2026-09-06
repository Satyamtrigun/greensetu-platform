import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type SyncState = "synced" | "waiting" | "failed";

export type QueuedLot = {
  localId: string;
  lotId: string;
  material: string;
  materialLabel: string;
  subcategory?: string;
  description?: string;
  photoPreview?: string;
  weightKg: number;
  condition: "good" | "average" | "damaged";
  estimatedValue: number;
  marketRate: number;
  city: string;
  locationLabel?: string;
  lat?: number;
  lng?: number;
  recyclerId?: string;
  recyclerName?: string;
  quotedRate?: number;
  anomalyFlag?: boolean;
  createdAt: number;
};

type OfflineCtx = {
  online: boolean;
  syncState: SyncState;
  queue: QueuedLot[];
  enqueueLot: (lot: Omit<QueuedLot, "localId" | "createdAt">) => void;
  removeQueued: (localId: string) => void;
  flush: () => Promise<void>;
};

const Ctx = createContext<OfflineCtx>({
  online: true,
  syncState: "synced",
  queue: [],
  enqueueLot: () => {},
  removeQueued: () => {},
  flush: async () => {},
});

const KEY = "gs_offline_queue_v1";

function readQueue(): QueuedLot[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedLot[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedLot[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
  } catch {
    /* ignore */
  }
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [queue, setQueue] = useState<QueuedLot[]>(() => readQueue());
  const [syncState, setSyncState] = useState<SyncState>(() => {
    const q = readQueue();
    if (q.length === 0) return "synced";
    return typeof navigator !== "undefined" && navigator.onLine ? "waiting" : "waiting";
  });
  const [onlineEverFailed, setOnlineEverFailed] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setOnlineEverFailed(false);
    };
    const goOffline = () => {
      setOnline(false);
      setOnlineEverFailed(true);
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const persist = useCallback((next: QueuedLot[]) => {
    setQueue(next);
    writeQueue(next);
  }, []);

  const enqueueLot = useCallback(
    (lot: Omit<QueuedLot, "localId" | "createdAt">) => {
      const entry: QueuedLot = {
        ...lot,
        localId: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      const next = [entry, ...readQueue()];
      persist(next);
    },
    [persist],
  );

  const removeQueued = useCallback(
    (localId: string) => {
      persist(readQueue().filter((q) => q.localId !== localId));
    },
    [persist],
  );

  const flush = useCallback(async () => {
    if (!navigator.onLine) return;
    setSyncState("waiting");
    try {
      // Dynamic import keeps the offline provider decoupled from Convex until needed.
      const { api } = await import("@/convex/_generated/api");
      const { anyApi } = await import("convex/server");
      // Use the plain Convex client fetch path via existing provider's client
      // We avoid importing useConvexClient hook here (non-hook context), so use
      // the public mutation endpoint through a fresh client bound to the same URL.
      const { ConvexHttpClient } = await import("convex/browser");
      const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

      const q = readQueue();
      let failed = 0;
      for (const item of q) {
        try {
          await client.mutation((anyApi.lots as any).create, {
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
            recyclerId: item.recyclerId,
            recyclerName: item.recyclerName,
            quotedRate: item.quotedRate,
            anomalyFlag: item.anomalyFlag,
          });
        } catch {
          failed++;
        }
      }
      if (failed === 0) {
        writeQueue([]);
        setQueue([]);
        setSyncState("synced");
      } else {
        setSyncState("failed");
      }
    } catch {
      setSyncState("failed");
    }
  }, []);

  // Auto flush when coming back online
  useEffect(() => {
    if (online && readQueue().length > 0) {
      void flush();
    }
    if (online && readQueue().length === 0) {
      setSyncState(onlineEverFailed ? "failed" : "synced");
    }
  }, [online, flush, onlineEverFailed]);

  const value = useMemo(
    () => ({ online, syncState, queue, enqueueLot, removeQueued, flush }),
    [online, syncState, queue, enqueueLot, removeQueued, flush],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOffline() {
  return useContext(Ctx);
}
