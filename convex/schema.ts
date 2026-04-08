import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tetap simpan user buat identitas
  users: defineTable({
    userId: v.string(), // Clerk ID
    name: v.string(),
  }).index("by_user", ["userId"]),

  // Tabel Tasks: Sekarang mendukung Planning & Focus Mode
  tasks: defineTable({
    userId: v.string(),
    originalTitle: v.string(),
    roastTitle: v.string(), // Diisi Agent 1 (The Roaster)
    
    // Field baru untuk Planning
    startTime: v.string(),   // Format "HH:mm" (e.g., "09:00")
    duration: v.number(),    // Dalam menit (e.g., 45)
    order: v.number(),       // Urutan eksekusi (1, 2, 3...)
    
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    dateStr: v.string(),     // Format "YYYY-MM-DD"
    createdAt: v.number(),
  })
    // Index krusial untuk narik list task seharian berdasarkan urutan
    .index("by_user_date_order", ["userId", "dateStr", "order"])
    // Index untuk ngecek apakah semua task sudah kelar (trigger Agent 2)
    .index("by_user_status", ["userId", "status"]),

  // Tabel Memory: "Buku Dosa" dari Agent 2 (The Chronicler)
  dailySummaries: defineTable({
    userId: v.string(),
    dateStr: v.string(),
    summary: v.string(), // Paragraf recap toxic
    stats: v.object({
      completed: v.number(),
      failed: v.number(),
    }),
  }).index("by_user_date", ["userId", "dateStr"]),
});