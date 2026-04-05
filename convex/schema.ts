// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    name: v.string(),
  }).index("by_user", ["userId"]),

  tasks: defineTable({
    userId: v.string(),
    originalTitle: v.string(),
    roastTitle: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    // Temporary during migration: older docs may not have dateStr yet.
    dateStr: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_date", ["userId", "dateStr"]) // Buat narik task hari ini
    .index("by_user_status", ["userId", "status"]), // Buat ngecek yang masih "pending"

  dailySummaries: defineTable({
    userId: v.string(),
    dateStr: v.string(),
    summary: v.string(),
    stats: v.object({
      completed: v.number(),
      failed: v.number(),
    }),
  }).index("by_user_date", ["userId", "dateStr"]),
});
