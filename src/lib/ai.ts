/**
 * GreenSetu AI module — modular seam for material classification.
 *
 * Production: swap `classifyMaterial` with a real vision API call
 * (e.g. a hosted multimodal model) — the rest of the app only consumes
 * the `MaterialGuess` type, so nothing else changes.
 *
 * Demo mode (current): a deterministic heuristic that simulates a vision
 * model from the image bytes + filename. Clearly labeled as demo in UI.
 */

export type MaterialGuess = {
  category: string;
  confidence: number;
};

import type { MaterialDef } from "./greensetu-data";

/** True demo classification: derives a stable guess from image size + name. */
export async function classifyMaterial(file: File): Promise<MaterialGuess> {
  await new Promise((r) => setTimeout(r, 900)); // simulate inference latency
  const size = file.size;
  const name = file.name.toLowerCase();
  const hash = [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100000, 7);

  const pool: { category: string; base: number }[] = [
    { category: "PCB", base: 91 },
    { category: "Copper Cable", base: 88 },
    { category: "Battery", base: 84 },
    { category: "Screens", base: 80 },
    { category: "Motors", base: 86 },
    { category: "Magnets", base: 78 },
    { category: "Computers", base: 82 },
    { category: "Mobiles", base: 85 },
    { category: "Plastic", base: 76 },
  ];

  const pick = pool[hash % pool.length];
  const confidence = Math.min(0.97, Math.max(0.55, (pick.base + (hash % 7)) / 100));

  void size;
  return { category: pick.category, confidence };
}

/** Confidence below this → show manual category selection grid. */
export const CONFIDENCE_THRESHOLD = 0.75;

/* ───────────────── Price estimation ───────────────── */

export type PriceEstimate = {
  value: number;
  marketLow: number;
  marketHigh: number;
  averageRate: number;
  conditionFactor: number;
};

/**
 * Estimate value from material + weight + condition.
 * Condition adjustments: good ×1.0, average ×0.9, damaged ×0.7.
 */
export function estimateValue(
  material: MaterialDef,
  weightKg: number,
  condition: "good" | "average" | "damaged",
): PriceEstimate {
  const conditionFactor =
    condition === "good" ? 1 : condition === "average" ? 0.9 : 0.7;
  const averageRate = Math.round(material.basePrice * conditionFactor);
  const value = Math.round(averageRate * weightKg);
  return {
    value,
    marketLow: Math.round(material.priceMin * conditionFactor * weightKg),
    marketHigh: Math.round(material.priceMax * conditionFactor * weightKg),
    averageRate,
    conditionFactor,
  };
}

/* ───────────────── Recycler matching ───────────────── */

import { haversineKm, RECYCLER_MATCH_WEIGHTS, type RecyclerDef } from "./greensetu-data";

export type MatchedRecycler<T> = T & {
  distanceKm: number;
  score: number;
  offeredRate: number | null;
  reasons: string[];
};

/**
 * Rank recyclers: 35% authorization, 30% price, 15% distance, 10% pickup, 10% material match.
 */
export function rankRecyclers<T extends RecyclerDef>(
  recyclers: T[],
  opts: {
    materialKey: string;
    marketRate: number;
    userLat: number;
    userLng: number;
  },
): MatchedRecycler<T>[] {
  const w = RECYCLER_MATCH_WEIGHTS;

  const scored = recyclers.map((r) => {
    const distanceKm = haversineKm(opts.userLat, opts.userLng, r.lat, r.lng);
    const authScore =
      r.authStatus === "verified"
        ? 1
        : r.authStatus === "pending"
          ? 0.5
          : r.authStatus === "expired"
            ? 0.15
            : 0.3;

    const offered = r.rates.find((x) => x.material === opts.materialKey)?.rate ?? null;
    // Price score: relative advantage vs market rate (cap at 15% above market)
    const priceScore =
      offered == null
        ? 0
        : Math.max(0, Math.min(1, (offered - opts.marketRate) / (opts.marketRate * 0.15) * 0.5 + 0.5));

    // Distance: closer is better, normalized over 25km
    const distScore = Math.max(0, 1 - distanceKm / 25);

    const pickupScore = r.pickupAvailable ? 1 : 0;
    const materialScore = r.materialsAccepted.includes(opts.materialKey) ? 1 : 0;

    const score =
      w.authorization * authScore +
      w.price * priceScore +
      w.distance * distScore +
      w.pickup * pickupScore +
      w.material * materialScore;

    const reasons: string[] = [];
    if (r.authStatus === "verified") reasons.push("Authorized");
    if (offered != null && offered >= opts.marketRate) reasons.push("Better rate");
    if (distanceKm < 8) reasons.push("Nearby");
    if (r.pickupAvailable) reasons.push("Pickup");

    return { ...r, distanceKm, score, offeredRate: offered, reasons };
  });

  // Material acceptance is a hard requirement (in network they all accept the queried
  // material at least at listing level, but filter defensively) then sort by score.
  return scored
    .filter((r) => r.materialsAccepted.includes(opts.materialKey))
    .sort((a, b) => b.score - a.score);
}

/** Low-offer warning threshold: recycler offers < 85% of market estimate. */
export function isLowOffer(offeredRate: number, marketRate: number): boolean {
  return offeredRate < marketRate * 0.85;
}
