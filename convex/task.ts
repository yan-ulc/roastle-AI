import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export const createTask = mutation({
  args: { title: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];

    const taskId = await ctx.db.insert("tasks", {
      userId: args.userId,
      originalTitle: args.title,
      roastTitle: "Analyzing your wacana...",
      status: "pending",
      dateStr: today,
      createdAt: Date.now(),
    });

    // Panggil Agent 1
    await ctx.scheduler.runAfter(0, internal.ai.processRoast, {
      taskId,
      userId: args.userId,
      title: args.title,
    });

    return taskId;
  },
});

export const completeTask = mutation({
  args: { taskId: v.id("tasks"), userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    await ctx.db.patch(args.taskId, { status: "completed" });

    // Cek apakah hari ini sudah kelar semua
    const pending = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "pending"),
      )
      .filter((q) => q.eq(q.field("dateStr"), today))
      .collect();

    if (pending.length === 0) {
      // Trigger Agent 2 (The Chronicler)
      await ctx.scheduler.runAfter(0, internal.chronicler.dailyRecapAction, {
        userId: args.userId,
        dateStr: today,
      });
    }
  },
});

export const getMyTasks = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});
