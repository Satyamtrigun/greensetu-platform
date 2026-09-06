import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { lotStatusValidator } from "./schema";

const lotStatusOrder: Record<string, number> = {
  created: 1,
  matched: 2,
  quoted: 3,
  pickup_requested: 4,
  pickup_scheduled: 5,
  handed_over: 6,
  confirmed: 7,
  payment_pending: 8,
  paid: 9,
  completed: 10,
};

async function addTrace(
  ctx: any,
  lotDocId: any,
  lotId: string,
  event: string,
  label: string,
  actor: string,
  note?: string,
) {
  await ctx.db.insert("traceability", {
    lotDocId,
    lotId,
    event,
    label,
    actor,
    note,
    ts: Date.now(),
  });
}

/** Generate next LOT ID: GS-DEL-2026-000123 */
export const nextLotId = query({
  args: {},
  handler: async (ctx) => {
    const lots = await ctx.db.query("lots").collect();
    const year = new Date().getFullYear();
    let max = 0;
    for (const l of lots) {
      if (l.lotId.startsWith(`GS-DEL-${year}`)) {
        const n = parseInt(l.lotId.split("-")[3] ?? "0", 10);
        if (!Number.isNaN(n) && n > max) max = n;
        continue;
      }
      // demo lots use GS-DEM-YYYY
      if (l.lotId.startsWith(`GS-DEM-${year}`)) {
        const n = parseInt(l.lotId.split("-")[3] ?? "0", 10);
        if (!Number.isNaN(n) && n > max) max = n;
      }
    }
    return `GS-DEL-${year}-${String(max + 1).padStart(6, "0")}`;
  },
});

export const create = mutation({
  args: {
    lotId: v.string(),
    demo: v.boolean(),
    material: v.string(),
    materialLabel: v.string(),
    subcategory: v.optional(v.string()),
    description: v.optional(v.string()),
    photoPreview: v.optional(v.string()),
    weightKg: v.number(),
    condition: v.union(v.literal("good"), v.literal("average"), v.literal("damaged")),
    estimatedValue: v.number(),
    marketRate: v.number(),
    city: v.string(),
    locationLabel: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    recyclerId: v.optional(v.id("recyclers")),
    recyclerName: v.optional(v.string()),
    quotedRate: v.optional(v.number()),
    anomalyFlag: v.optional(v.boolean()),
  },
  handler: async (ctx, a) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    const user = await ctx.db.get(userId);
    const collectorName = user?.name ?? user?.email ?? "Collector";

    const now = Date.now();
    const lotDocId = await ctx.db.insert("lots", {
      lotId: a.lotId,
      demo: a.demo,
      collectorId: userId,
      collectorName,
      material: a.material,
      materialLabel: a.materialLabel,
      subcategory: a.subcategory,
      description: a.description,
      photoPreview: a.photoPreview,
      weightKg: a.weightKg,
      condition: a.condition,
      estimatedValue: a.estimatedValue,
      marketRate: a.marketRate,
      city: a.city,
      locationLabel: a.locationLabel,
      lat: a.lat,
      lng: a.lng,
      status: a.recyclerId ? "matched" : "created",
      recyclerId: a.recyclerId,
      recyclerName: a.recyclerName,
      quotedRate: a.quotedRate,
      finalValue: a.quotedRate ? Math.round(a.quotedRate * a.weightKg) : undefined,
      anomalyFlag: a.anomalyFlag,
      createdAt: now,
      updatedAt: now,
    });

    await addTrace(ctx, lotDocId, a.lotId, "lot_created", "Lot Created", collectorName);
    if (a.recyclerId) {
      await addTrace(
        ctx,
        lotDocId,
        a.lotId,
        "recycler_selected",
        "Recycler Selected",
        collectorName,
        a.recyclerName,
      );
    }

    return lotDocId;
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const lots = await ctx.db
      .query("lots")
      .withIndex("by_collector", (q) => q.eq("collectorId", userId))
      .collect();
    return lots.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getById = query({
  args: { id: v.id("lots") },
  handler: async (ctx, a) => {
    return await ctx.db.get(a.id);
  },
});

export const traceForLot = query({
  args: { lotDocId: v.id("lots") },
  handler: async (ctx, a) => {
    return (
      await ctx.db
        .query("traceability")
        .withIndex("by_lot_doc", (q) => q.eq("lotDocId", a.lotDocId))
        .collect()
    ).sort((x, y) => x.ts - y.ts);
  },
});

export const updateStatus = mutation({
  args: {
    lotDocId: v.id("lots"),
    status: lotStatusValidator,
    note: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    const lot = await ctx.db.get(a.lotDocId);
    if (!lot) throw new Error("Lot not found");

    const user = await ctx.db.get(userId);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const isOwner = lot.collectorId === userId;
    const isRecycler = profile?.platformRole === "recycler";
    const isAdmin = user?.role === "admin" || profile?.platformRole === "admin";

    if (!isOwner && !isRecycler && !isAdmin) {
      throw new Error("Not permitted to update this lot");
    }

    const labels: Record<string, string> = {
      created: "Lot Created",
      matched: "Recycler Selected",
      quoted: "Quote Received",
      pickup_requested: "Pickup Requested",
      pickup_scheduled: "Pickup Scheduled",
      handed_over: "Material Handed Over",
      confirmed: "Recycler Confirmed",
      payment_pending: "Payment Pending",
      paid: "Payment Completed",
      completed: "Completed",
    };

    const now = Date.now();
    const patch: Record<string, unknown> = { status: a.status, updatedAt: now };

    // Handover: generate handover reference
    if (a.status === "handed_over" && !lot.handoverRef) {
      const lots = await ctx.db.query("lots").collect();
      patch.handoverRef = `GS-HO-${new Date().getFullYear()}-${String(lots.length + 1).padStart(6, "0")}`;
    }

    // Recycler confirmation — also creates the transaction
    if (a.status === "confirmed") {
      if (lot.handoverConfirmedAt) {
        throw new Error("Duplicate confirmation blocked");
      }
      if (!lot.recyclerId) throw new Error("Lot has no recycler assigned");
      patch.handoverConfirmedAt = now;
      const facility = await ctx.db.get(lot.recyclerId);
      const finalValue =
        lot.finalValue ?? Math.round((lot.quotedRate ?? lot.marketRate) * lot.weightKg);

      await ctx.db.insert("transactions", {
        lotDocId: a.lotDocId,
        lotId: lot.lotId,
        demo: lot.demo,
        collectorId: lot.collectorId,
        collectorName: lot.collectorName,
        recyclerId: lot.recyclerId,
        recyclerName: facility?.name ?? lot.recyclerName ?? "Recycler",
        material: lot.material,
        materialLabel: lot.materialLabel,
        weightKg: lot.weightKg,
        finalValue,
        paymentMethod: "cash",
        paymentStatus: "pending",
        createdAt: now,
      });

      patch.finalValue = finalValue;
      patch.status = "payment_pending";
    }

    await ctx.db.patch(a.lotDocId, patch);

    await addTrace(
      ctx,
      a.lotDocId,
      lot.lotId,
      a.status,
      labels[a.status] ?? a.status,
      isRecycler ? "Recycler" : isOwner ? "Collector" : "Admin",
      a.note,
    );

    return true;
  },
});

/** Select a recycler for a lot (collector action). */
export const selectRecycler = mutation({
  args: { lotDocId: v.id("lots"), recyclerId: v.id("recyclers") },
  handler: async (ctx, a) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    const lot = await ctx.db.get(a.lotDocId);
    if (!lot) throw new Error("Lot not found");
    if (lot.collectorId !== userId) throw new Error("Not your lot");

    const facility = await ctx.db.get(a.recyclerId);
    if (!facility) throw new Error("Recycler not found");

    const rateEntry = facility.rates.find((r) => r.material === lot.material);
    const quotedRate = rateEntry?.rate ?? lot.marketRate;
    const finalValue = Math.round(quotedRate * lot.weightKg);

    // Price anomaly detection: flag offers significantly below market estimate
    const anomalyFlag = quotedRate < lot.estimatedValue / lot.weightKg * 0.85;

    await ctx.db.patch(a.lotDocId, {
      recyclerId: a.recyclerId,
      recyclerName: facility.name,
      quotedRate,
      finalValue,
      status: "matched",
      anomalyFlag,
      updatedAt: Date.now(),
    });

    await addTrace(
      ctx,
      a.lotDocId,
      lot.lotId,
      "recycler_selected",
      "Recycler Selected",
      "Collector",
      facility.name,
    );

    return { quotedRate, finalValue, anomalyFlag };
  },
});

/** Public (QR-target) query: lot by LOT ID without auth, limited fields. */
export const getByLotIdPublic = query({
  args: { lotId: v.string() },
  handler: async (ctx, a) => {
    const lot = await ctx.db
      .query("lots")
      .withIndex("by_lot_id", (q) => q.eq("lotId", a.lotId))
      .first();
    if (!lot) return null;
    return {
      lotId: lot.lotId,
      materialLabel: lot.materialLabel,
      weightKg: lot.weightKg,
      status: lot.status,
      collectorName: lot.collectorName,
      recyclerName: lot.recyclerName,
      handoverRef: lot.handoverRef,
      estimatedValue: lot.estimatedValue,
      finalValue: lot.finalValue,
      createdAt: lot.createdAt,
    };
  },
});

/** Demo history for the public price board section ("Recent handovers") */
export const recentPublic = query({
  args: {},
  handler: async (ctx) => {
    return (await ctx.db.query("lots").collect())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 8)
      .map((l) => ({
        lotId: l.lotId,
        materialLabel: l.materialLabel,
        weightKg: l.weightKg,
        city: l.city,
        demo: l.demo,
        status: l.status,
      }));
  },
});

/* ───────────────── Recycler dashboard queries ───────────────── */

export const listForRecyclerUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const facility = await ctx.db
      .query("recyclers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!facility) return [];
    const lots = await ctx.db
      .query("lots")
      .withIndex("by_recycler", (q) => q.eq("recyclerId", facility._id))
      .collect();
    return lots.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Admin: all lots */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return (await ctx.db.query("lots").collect()).sort(
      (a, b) => b.createdAt - a.createdAt,
    );
  },
});
