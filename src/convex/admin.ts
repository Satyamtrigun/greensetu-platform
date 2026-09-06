import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const analytics = query({
  args: {},
  handler: async (ctx) => {
    await getAuthUserId(ctx);

    const [lots, txs, recyclers, materials] = await Promise.all([
      ctx.db.query("lots").collect(),
      ctx.db.query("transactions").collect(),
      ctx.db.query("recyclers").collect(),
      ctx.db.query("materials").collect(),
    ]);

    const totalLots = lots.length;
    const kgRecycled = txs.reduce((s, t) => s + t.weightKg, 0);
    const collectorEarnings = txs
      .filter((t) => t.paymentStatus === "paid")
      .reduce((s, t) => s + t.finalValue, 0);
    const activeRecyclers = recyclers.filter((r) => r.authStatus === "verified").length;

    const byMaterial: Record<string, { label: string; lots: number; kg: number }> = {};
    for (const l of lots) {
      const e = (byMaterial[l.material] ??= {
        label: l.materialLabel,
        lots: 0,
        kg: 0,
      });
      e.lots++;
      e.kg += l.weightKg;
    }

    const byCity: Record<string, { city: string; lots: number; kg: number }> = {};
    for (const l of lots) {
      const e = (byCity[l.city] ??= { city: l.city, lots: 0, kg: 0 });
      e.lots++;
      e.kg += l.weightKg;
    }

    return {
      totalLots,
      kgRecycled,
      collectorEarnings,
      activeRecyclers,
      recyclerFacilities: recyclers.length,
      collectors: new Set(lots.map((l) => l.collectorId).filter(Boolean)).size,
      byMaterial: Object.entries(byMaterial).map(([key, v]) => ({ key, ...v })),
      byCity: Object.values(byCity),
      materials: materials.length,
    };
  },
});
