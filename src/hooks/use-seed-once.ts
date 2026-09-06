import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";

/** Fire-and-forget idempotent seeding of catalog data on app start. */
export function useSeedOnce() {
  const seed = useMutation(api.seed.seedAll);
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    seed().catch((e) => console.warn("seed failed", e));
  }, [seed]);
}
