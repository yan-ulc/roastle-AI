import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";



export const saveDailyPlan = mutation({
  args: {
    userId: v.string(),
    tasks: v.array(
      v.object({
        originalTitle: v.string(),
        startTime: v.string(),
        duration: v.number(), 
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];

    // 1. Bersihkan rencana lama hari ini (Clean Slate)
    const existingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_date_order", (q) =>
        q.eq("userId", args.userId).eq("dateStr", today)
      )
      .collect();

    for (const task of existingTasks) {
      await ctx.db.delete(task._id);
    }

    // 2. Insert rencana baru & Trigger Roaster buat masing-masing task
    for (const taskData of args.tasks) {
      const taskId = await ctx.db.insert("tasks", {
        ...taskData,
        userId: args.userId,
        roastTitle: "Calculating your audacity...", // Placeholder
        status: "pending",
        dateStr: today,
        createdAt: Date.now(),
      });

      // Panggil Agent 1 buat nge-roast task ini
      await ctx.scheduler.runAfter(0, internal.ai.processRoast, {
        taskId,
        userId: args.userId,
        title: taskData.originalTitle,
      });
    }

    return { success: true, message: "Agenda dosa berhasil disimpan." };
  },
});

export const completeTask = mutation({
  args: { taskId: v.id("tasks"), userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    
    // 1. Set status to completed
    await ctx.db.patch(args.taskId, { status: "completed" });

    // 2. Check if there are any pending tasks left for today
    const pending = await ctx.db.query("tasks")
      .withIndex("by_user_status", q => q.eq("userId", args.userId).eq("status", "pending"))
      .filter(q => q.eq(q.field("dateStr"), today))
      .collect();

    // 3. If zero pending, trigger Agent 2 for the final judgment
    if (pending.length === 0) {
      await ctx.scheduler.runAfter(0, internal.chronicler.dailyRecapAction, {
        userId: args.userId,
        dateStr: today
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

export const getNextFocusTask = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];

    // Ambil task pending pertama berdasarkan urutan (order)
    return await ctx.db
      .query("tasks")
      .withIndex("by_user_date_order", (q) =>
        q.eq("userId", args.userId).eq("dateStr", today)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .order("asc") // Dari yang paling pagi/awal
      .first();
  },
});

export const resetDailyTasks = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_date_order", (q) => q.eq("userId", args.userId).eq("dateStr", today))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }
  },
});