import { mutation } from "./_generated/server";
import { MATERIALS, RECYCLERS, SAFETY } from "../lib/greensetu-data";

/** Idempotent global catalog seeding (materials, recyclers, safety content). */
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    let materials = 0;
    let recyclers = 0;
    let safety = 0;

    const firstMaterial = await ctx.db
      .query("materials")
      .withIndex("by_key", (q) => q.eq("key", MATERIALS[0].key))
      .first();

    if (!firstMaterial) {
      for (const m of MATERIALS) {
        const exists = await ctx.db
          .query("materials")
          .withIndex("by_key", (q) => q.eq("key", m.key))
          .first();
        if (!exists) {
          await ctx.db.insert("materials", m);
          materials++;
        }
      }
    }

    const firstSafety = await ctx.db
      .query("safetyContent")
      .withIndex("by_key", (q) => q.eq("key", SAFETY[0].key))
      .first();
    if (!firstSafety) {
      for (const s of SAFETY) {
        const exists = await ctx.db
          .query("safetyContent")
          .withIndex("by_key", (q) => q.eq("key", s.key))
          .first();
        if (!exists) {
          await ctx.db.insert("safetyContent", s);
          safety++;
        }
      }
    }

    const firstRecycler = await ctx.db.query("recyclers").first();
    if (!firstRecycler) {
      for (const r of RECYCLERS) {
        await ctx.db.insert("recyclers", r);
        recyclers++;
      }
    }

    return { materials, recyclers, safety };
  },
});
