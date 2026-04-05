import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";

export const getPastSummaries = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailySummaries")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(3);
  },
});

export const dailyRecapAction = internalAction({
  args: { userId: v.string(), dateStr: v.string() },
  handler: async (ctx, args) => {
    const tasks = await ctx.runQuery(internal.chronicler.getTodayTasks, {
      userId: args.userId,
      dateStr: args.dateStr,
    });

    const done = tasks.filter((t) => t.status === "completed").length;
    const fail = tasks.filter((t) => t.status !== "completed").length;

    const systemPrompt = `You are 'The Chronicler'. Your job is to document this user's failure. 
    Today's Stats: ${done} completed, ${fail} failed/pending. 
    Use the specific task names: ${tasks.map((t) => t.originalTitle).join(", ")}. 
    Write a 1-paragraph summary that is toxic, judgmental, and personal. Gen-Z slang only.`;

    const summary = await ctx.runAction(internal.ai.askAI, {
      systemPrompt,
      userPrompt: "Recap my day.",
    });

    await ctx.runMutation(internal.chronicler.saveSummary, {
      userId: args.userId,
      dateStr: args.dateStr,
      summary: summary ?? "User beneran gak ngapa-ngapain. Cooked.",
      stats: { completed: done, failed: fail },
    });
  },
});

export const getTodayTasks = internalQuery({
  args: { userId: v.string(), dateStr: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("dateStr", args.dateStr),
      )
      .collect();
  },
});

export const saveSummary = internalMutation({
  args: {
    userId: v.string(),
    dateStr: v.string(),
    summary: v.string(),
    stats: v.any(),
  },
  handler: async (ctx, args) => {
    // Cari apakah sudah ada summary hari ini (buat update)
    const existing = await ctx.db
      .query("dailySummaries")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("dateStr", args.dateStr),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        summary: args.summary,
        stats: args.stats,
      });
    } else {
      await ctx.db.insert("dailySummaries", {
        userId: args.userId,
        dateStr: args.dateStr,
        summary: args.summary,
        stats: args.stats,
      });
    }
  },
});

// Tambahkan di convex/chronicler.ts

export const triggerAllUserRecaps = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];

    // 1. Ambil semua task yang dibuat hari ini biar tau user mana aja yang aktif
    const activeTasks = await ctx.db
      .query("tasks")
      // Kita pake filter karena kita mau ambil semua user unik hari ini
      .filter((q) => q.eq(q.field("dateStr"), today))
      .collect();

    // 2. Ambil list unik userId
    const activeUserIds = Array.from(new Set(activeTasks.map((t) => t.userId)));

    // 3. Untuk setiap user, cek apakah mereka sudah punya 'final summary'
    for (const userId of activeUserIds) {
      const summary = await ctx.db
        .query("dailySummaries")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).eq("dateStr", today),
        )
        .first();

      // Kalau belum ada summary atau belum final (karena mereka kabur/malas)
      // Kita paksa Agent 2 buat nge-recap sekarang.
      if (!summary) {
        await ctx.scheduler.runAfter(0, internal.chronicler.dailyRecapAction, {
          userId,
          dateStr: today,
        });
      }
    }
  },
});
