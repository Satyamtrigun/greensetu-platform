import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/** Offline sync audit log entry. */
export const logSync = mutation({
  args: { kind: v.string(), count: v.number() },
  handler: async (ctx, a) => {
    const userId = await getAuthUserId(ctx);
    await ctx.db.insert("syncLogs", {
      userId: userId ?? undefined,
      kind: a.kind,
      count: a.count,
      ts: Date.now(),
    });
    return true;
  },
});

/** Ensure a signed-in collector has a small demo history for presentations. */
export const ensureDemoLots = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { created: 0 };

    const existing = await ctx.db
      .query("lots")
      .withIndex("by_collector", (q) => q.eq("collectorId", userId))
      .collect();
    if (existing.length > 0) return { created: 0 };

    const facilities = await ctx.db.query("recyclers").collect();
    const green = facilities.find((f) => f.name.startsWith("GreenCycle"));
    const eco = facilities.find((f) => f.name.startsWith("EcoWaste"));
    if (!green || !eco) return { created: 0 };

    const mk = async (opts: {
      lotId: string;
      material: string;
      label: string;
      kg: number;
      rate: number;
      est: number;
      recycler: typeof green;
      status: any;
      ageH: number;
      paid: boolean;
    }) => {
      const now = Date.now();
      const createdAt = now - opts.ageH * 3600_000;
      const finalValue = Math.round(opts.rate * opts.kg);
      const lotDocId = await ctx.db.insert("lots", {
        lotId: opts.lotId,
        demo: true,
        collectorId: userId,
        collectorName: "Collector (demo)",
        material: opts.material,
        materialLabel: opts.label,
        weightKg: opts.kg,
        condition: "good",
        estimatedValue: opts.est,
        marketRate: opts.rate,
        city: "Delhi",
        locationLabel: "New Delhi",
        lat: 28.6139,
        lng: 77.209,
        status: opts.status,
        recyclerId: opts.recycler._id,
        recyclerName: opts.recycler.name,
        quotedRate: opts.rate,
        finalValue,
        createdAt,
        updatedAt: createdAt,
      });

      // Traceability
      const events: [string, string, number][] = [
        ["lot_created", "Lot Created", 0],
        ["recycler_selected", "Recycler Selected", 1],
      ];
      if (["handed_over", "confirmed", "payment_pending", "paid", "completed"].includes(opts.status)) {
        events.push(["handed_over", "Material Handed Over", 2]);
      }
      if (["confirmed", "payment_pending", "paid", "completed"].includes(opts.status)) {
        events.push(["confirmed", "Recycler Confirmed", 3]);
      }
      if (["paid", "completed"].includes(opts.status)) {
        events.push(["paid", "Payment Completed", 4]);
      }
      for (const [event, label2, i] of events) {
        await ctx.db.insert("traceability", {
          lotDocId,
          lotId: opts.lotId,
          event,
          label: label2,
          actor: i === 4 ? "Recycler" : "Collector",
          ts: createdAt + i * 45 * 60_000,
        });
      }

      // Transaction for completed lots
      if (["payment_pending", "paid", "completed"].includes(opts.status)) {
        await ctx.db.insert("transactions", {
          lotDocId,
          lotId: opts.lotId,
          demo: true,
          collectorId: userId,
          collectorName: "Collector (demo)",
          recyclerId: opts.recycler._id,
          recyclerName: opts.recycler.name,
          material: opts.material,
          materialLabel: opts.label,
          weightKg: opts.kg,
          finalValue,
          paymentMethod: "cash",
          paymentStatus: opts.paid ? "paid" : "pending",
          recyclerPaidAt: opts.paid ? createdAt + 3 * 3600_000 : undefined,
          collectorConfirmedAt: opts.status === "completed" ? createdAt + 3.5 * 3600_000 : undefined,
          createdAt: createdAt + 3 * 3600_000,
        });
      }
      return lotDocId;
    };

    await mk({
      lotId: "GS-DEM-2026-000101", material: "pcb_high_grade", label: "High Grade PCB",
      kg: 2, rate: 870, est: 1700, recycler: green, status: "paid", ageH: 26, paid: true,
    });
    await mk({
      lotId: "GS-DEM-2026-000102", material: "copper_cable", label: "Copper Cable",
      kg: 1.8, rate: 470, est: 810, recycler: green, status: "payment_pending", ageH: 5, paid: false,
    });
    await mk({
      lotId: "GS-DEM-2026-000103", material: "lithium_battery", label: "Lithium Battery",
      kg: 3, rate: 118, est: 360, recycler: eco, status: "completed", ageH: 74, paid: true,
    });

    return { created: 3 };
  },
});
