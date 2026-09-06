import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

export const listForCollector = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return (
      await ctx.db
        .query("transactions")
        .withIndex("by_collector", (q) => q.eq("collectorId", userId))
        .collect()
    ).sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listForRecyclerUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(  ctx);
    if (!userId) return [];
    const facility = await ctx.db
      .query("recyclers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!facility) return [];
    return (
      await ctx.db
        .query("transactions")
        .withIndex("by_recycler", (q) => q.eq("recyclerId", facility._id))
        .collect()
    ).sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return (await ctx.db.query("transactions").collect()).sort(
      (a, b) => b.createdAt - a.createdAt,
    );
  },
});

/** Recycler marks cash paid / records digital method */
export const markPaid = mutation({
  args: {
    transactionId: v.id("transactions"),
    method: v.union(v.literal("cash"), v.literal("upi"), v.literal("bank")),
  },
  handler: async (ctx, a) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (profile?.platformRole !== "recycler" && profile?.platformRole !== "admin") {
      throw new Error("Only recyclers or admins can mark payments");
    }
    await ctx.db.patch(a.transactionId, {
      paymentMethod: a.method,
      paymentStatus: "paid",
      recyclerPaidAt: Date.now(),
    });
    return true;
  },
});

/** Collector confirms they received the payment */
export const confirmReceived = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, a) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    const tx = await ctx.db.get(a.transactionId);
    if (!tx) throw new Error("Transaction not found");
    if (tx.collectorId !== userId) throw new Error("Not your transaction");
    if (tx.paymentStatus !== "paid") {
      throw new Error("Recycler has not marked this as paid yet");
    }
    if (tx.collectorConfirmedAt) {
      throw new Error("Payment already confirmed");
    }
    await ctx.db.patch(a.transactionId, { collectorConfirmedAt: Date.now() });

    const lot = await ctx.db.get(tx.lotDocId);
    if (lot) {
      await ctx.db.patch(tx.lotDocId, { status: "completed", updatedAt: Date.now() });
    }
    return true;
  },
});
