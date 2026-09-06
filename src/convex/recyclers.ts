import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("recyclers").collect();
  },
});

export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return (
      (await ctx.db
        .query("recyclers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first()) ?? null
    );
  },
});

/** Admin: update authorization status of a recycler facility. */
export const setAuthStatus = mutation({
  args: {
    recyclerId: v.id("recyclers"),
    authStatus: v.union(
      v.literal("verified"),
      v.literal("pending"),
      v.literal("expired"),
      v.literal("unverified"),
    ),
  },
  handler: async (ctx, a) => {
    await ctx.db.patch(a.recyclerId, { authStatus: a.authStatus });
    return true;
  },
});
