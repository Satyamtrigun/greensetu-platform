import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { platformRoleValidator } from "./schema";

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return (
      (await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first()) ?? null
    );
  },
});

export const upsert = mutation({
  args: {
    platformRole: platformRoleValidator,
    displayName: v.string(),
    language: v.optional(v.string()),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    companyName: v.optional(v.string()),
    facilityId: v.optional(v.id("recyclers")),
  },
  handler: async (ctx, a) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...a });
    } else {
      await ctx.db.insert("profiles", { userId, ...a });
    }

    // Bind recycler facility to this user account
    if (a.platformRole === "recycler" && a.facilityId) {
      const facility = await ctx.db.get(a.facilityId);
      if (facility) {
        await ctx.db.patch(a.facilityId, { userId });
      }
    }

    return true;
  },
});

/** Admin: list all profiles joined with basic user info. */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    return await Promise.all(
      profiles.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          _id: p._id,
          platformRole: p.platformRole,
          displayName: p.displayName,
          city: p.city,
          phone: p.phone,
          companyName: p.companyName,
          email: user?.email ?? null,
          isAnonymous: user?.isAnonymous ?? null,
        };
      }),
    );
  },
});
