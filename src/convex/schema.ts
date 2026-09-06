import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

/** GreenSetu platform roles */
export const platformRoleValidator = v.union(
  v.literal("collector"),
  v.literal("recycler"),
  v.literal("admin"),
);

export const authStatusValidator = v.union(
  v.literal("verified"),
  v.literal("pending"),
  v.literal("expired"),
  v.literal("unverified"),
);

export const conditionValidator = v.union(
  v.literal("good"),
  v.literal("average"),
  v.literal("damaged"),
);

export const lotStatusValidator = v.union(
  v.literal("created"),
  v.literal("matched"),
  v.literal("quoted"),
  v.literal("pickup_requested"),
  v.literal("pickup_scheduled"),
  v.literal("handed_over"),
  v.literal("confirmed"),
  v.literal("payment_pending"),
  v.literal("paid"),
  v.literal("completed"),
);

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    /** GreenSetu per-user profile (one row per signed-in user) */
    profiles: defineTable({
      userId: v.id("users"),
      platformRole: platformRoleValidator,
      displayName: v.string(),
      phone: v.optional(v.string()),
      language: v.optional(v.string()),
      city: v.optional(v.string()),
      // Recycler-profile extras
      companyName: v.optional(v.string()),
      facilityId: v.optional(v.id("recyclers")),
    })
      .index("by_user", ["userId"])
      .index("by_role", ["platformRole"]),

    /** Material catalog + market prices (single source of truth for price board) */
    materials: defineTable({
      key: v.string(),
      emoji: v.string(),
      color: v.string(),
      labelEn: v.string(),
      labelHi: v.string(),
      labelMr: v.string(),
      category: v.string(),
      unit: v.string(),
      basePrice: v.number(),
      trendPct: v.number(),
      priceMin: v.number(),
      priceMax: v.number(),
      priceHistory: v.array(v.number()),
      demo: v.boolean(),
    }).index("by_key", ["key"]),

    /** Authorized recycler facilities */
    recyclers: defineTable({
      userId: v.optional(v.id("users")),
      name: v.string(),
      logoEmoji: v.string(),
      city: v.string(),
      address: v.string(),
      lat: v.number(),
      lng: v.number(),
      phone: v.string(),
      materialsAccepted: v.array(v.string()),
      rates: v.array(v.object({ material: v.string(), rate: v.number() })),
      pickupAvailable: v.boolean(),
      serviceRadiusKm: v.number(),
      authStatus: authStatusValidator,
      authNumber: v.string(),
      authExpiry: v.string(),
      rating: v.number(),
      demo: v.boolean(),
    })
      .index("by_city", ["city"])
      .index("by_user", ["userId"]),

    /** Digital material lots */
    lots: defineTable({
      lotId: v.string(),
      demo: v.boolean(),
      collectorId: v.optional(v.id("users")),
      collectorName: v.string(),
      material: v.string(),
      materialLabel: v.string(),
      subcategory: v.optional(v.string()),
      description: v.optional(v.string()),
      photoStorageId: v.optional(v.id("_storage")),
      photoPreview: v.optional(v.string()), // small dataURL (offline draft carry-over)
      weightKg: v.number(),
      condition: conditionValidator,
      estimatedValue: v.number(),
      marketRate: v.number(),
      city: v.string(),
      locationLabel: v.optional(v.string()),
      lat: v.optional(v.number()),
      lng: v.optional(v.number()),
      status: lotStatusValidator,
      recyclerId: v.optional(v.id("recyclers")),
      recyclerName: v.optional(v.string()),
      quotedRate: v.optional(v.number()),
      finalValue: v.optional(v.number()),
      handoverRef: v.optional(v.string()),
      handoverConfirmedAt: v.optional(v.number()),
      anomalyFlag: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_collector", ["collectorId"])
      .index("by_lot_id", ["lotId"])
      .index("by_recycler", ["recyclerId"])
      .index("by_status", ["status"]),

    /** Transactions (one per confirmed handover) */
    transactions: defineTable({
      lotDocId: v.id("lots"),
      lotId: v.string(),
      demo: v.boolean(),
      collectorId: v.optional(v.id("users")),
      collectorName: v.string(),
      recyclerId: v.id("recyclers"),
      recyclerName: v.string(),
      material: v.string(),
      materialLabel: v.string(),
      weightKg: v.number(),
      finalValue: v.number(),
      paymentMethod: v.union(v.literal("cash"), v.literal("upi"), v.literal("bank")),
      paymentStatus: v.union(v.literal("pending"), v.literal("paid")),
      recyclerPaidAt: v.optional(v.number()),
      collectorConfirmedAt: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_collector", ["collectorId"])
      .index("by_recycler", ["recyclerId"])
      .index("by_lot_doc", ["lotDocId"]),

    /** Traceability timeline events */
    traceability: defineTable({
      lotDocId: v.id("lots"),
      lotId: v.string(),
      event: v.string(),
      label: v.string(),
      note: v.optional(v.string()),
      actor: v.string(),
      ts: v.number(),
    }).index("by_lot_doc", ["lotDocId"]),

    /** Safety center content (multi-language) */
    safetyContent: defineTable({
      key: v.string(),
      emoji: v.string(),
      titleEn: v.string(),
      titleHi: v.string(),
      titleMr: v.string(),
      textEn: v.string(),
      textHi: v.string(),
      textMr: v.string(),
    }).index("by_key", ["key"]),

    /** Offline sync audit */
    syncLogs: defineTable({
      userId: v.optional(v.id("users")),
      kind: v.string(),
      count: v.number(),
      ts: v.number(),
    }),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
