import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";

export const dailyRecapAction = internalAction({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // 1. Ambil semua task user hari ini
    const tasks: Doc<"tasks">[] = await ctx.runQuery(
      internal.chronicler.getUserTasksToday,
      {
        userId: args.userId,
      },
    );

    if (tasks.length === 0) return;

    const completed = tasks.filter((t) => t.status === "completed").length;
    const failed = tasks.filter(
      (t) => t.status === "pending" || t.status === "failed",
    ).length;

    const taskSummary = tasks
      .map((t) => `- ${t.originalTitle} (Status: ${t.status})`)
      .join("\n");

    // 2. Minta Gemini/Groq buat ngerangkum dosa (Pake logic fallback yang udah kita bikin)
    const systemPrompt = `You are 'The Chronicler'. Your job is to summarize the user's day in one toxic paragraph.
    Focus on their failures. If they finished tasks, belittle their achievements. 
    Use Gen-Z slang: L, cooked, mid, NPC, blud. 
    Stats: ${completed} finished, ${failed} failed.`;

    const userPrompt = `Here is my task list today:\n${taskSummary}`;

    const recapContent = await ctx.runAction(internal.ai.getRoastResponse, {
      systemPrompt,
      userPrompt,
    });

    // 3. Simpan ke tabel dailySummaries
    await ctx.runMutation(internal.chronicler.saveDailySummary, {
      userId: args.userId,
      content:
        recapContent ??
        "User beneran gak ngapa-ngapain hari ini. Peak NPC behavior.",
      stats: { completed, failed },
    });
  },
});

export const triggerAllUserRecaps = internalAction({
  args: {},
  handler: async (ctx): Promise<{ scheduled: number }> => {
    const userIds: string[] = await ctx.runQuery(
      internal.chronicler.listUsersForRecap,
      {
        limit: 200,
      },
    );

    for (const userId of userIds) {
      await ctx.scheduler.runAfter(0, internal.chronicler.dailyRecapAction, {
        userId,
      });
    }

    return { scheduled: userIds.length };
  },
});

export const listUsersForRecap = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const recentTasks = await ctx.db
      .query("tasks")
      .order("desc")
      .take(args.limit);
    return Array.from(new Set(recentTasks.map((task) => task.userId)));
  },
});

// Helper Query & Mutation
export const getUserTasksToday = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Logic ambil task 24 jam terakhir
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gt(q.field("createdAt"), oneDayAgo))
      .collect();
  },
});

export const saveDailySummary = internalMutation({
  args: {
    userId: v.string(),
    content: v.string(),
    stats: v.object({ completed: v.number(), failed: v.number() }),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("dailySummaries", {
      userId: args.userId,
      content: args.content,
      date: new Date().toISOString().split("T")[0],
      severity: args.stats.failed > args.stats.completed ? 10 : 5,
    });
  },
});
