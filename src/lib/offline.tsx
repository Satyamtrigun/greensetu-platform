import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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

type FlushFn = () => Promise<void>;

type OfflineCtx = {
  online: boolean;
  syncState: SyncState;
  queue: QueuedLot[];
  enqueueLot: (lot: Omit<QueuedLot, "localId" | "createdAt">) => void;
  markSynced: (localId: string) => void;
  flush: () => Promise<void>;
  registerFlusher: (fn: FlushFn) => void;
  setSyncState: (s: SyncState) => void;
};

const Ctx = createContext<OfflineCtx>({
  online: true,
  syncState: "synced",
  queue: [],
  enqueueLot: () => {},
  markSynced: () => {},
  flush: async () => {},
  registerFlusher: () => {},
  setSyncState: () => {},
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
  const [syncState, setSyncState] = useState<SyncState>(() =>
    readQueue().length > 0 ? "waiting" : "synced",
  );
  const flusherRef = useRef<FlushFn | null>(null);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const enqueueLot = useCallback(
    (lot: Omit<QueuedLot, "localId" | "createdAt">) => {
      const entry: QueuedLot = {
        ...lot,
        localId: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      const next = [entry, ...readQueue()];
      setQueue(next);
      writeQueue(next);
      setSyncState("waiting");
    },
    [],
  );

  const markSynced = useCallback((localId: string) => {
    const next = readQueue().filter((q) => q.localId !== localId);
    setQueue(next);
    writeQueue(next);
    if (next.length === 0) setSyncState("synced");
  }, []);

  const registerFlusher = useCallback((fn: FlushFn) => {
    flusherRef.current = fn;
  }, []);

  const flush = useCallback(async () => {
    if (flusherRef.current) await flusherRef.current();
  }, []);

  // Auto flush when back online
  useEffect(() => {
    if (online && queue.length > 0) {
      void flush();
    }
  }, [online, queue.length, flush]);

  const value = useMemo(
    () => ({
      online,
      syncState,
      queue,
      enqueueLot,
      markSynced,
      flush,
      registerFlusher,
      setSyncState,
    }),
    [online, syncState, queue, enqueueLot, markSynced, flush, registerFlusher],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOffline() {
  return useContext(Ctx);
}
