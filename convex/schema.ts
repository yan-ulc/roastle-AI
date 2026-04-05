import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabel Task: Tempat Agent 1 beraksi
  tasks: defineTable({
    userId: v.string(), // ID dari Clerk
    originalTitle: v.string(), 
    roastTitle: v.string(), 
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
  }).index("by_user_status", ["userId", "status"]),

  // Tabel Memory: Amunisi untuk Agent 1
  dailySummaries: defineTable({
    userId: v.string(),
    content: v.string(), // "Recap Dosa" dari Agent 2
    date: v.string(),
    severity: v.number(), // Seberapa parah kemalasan user (1-10)
  }).index("by_user", ["userId"]),
});