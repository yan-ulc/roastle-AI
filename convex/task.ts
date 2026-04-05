import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
} from "./_generated/server";

export const createAggressiveTask = mutation({
  args: { title: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    // Ambil history buat amunisi roasting
    const history = await ctx.db
      .query("dailySummaries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(1);

    const memory =
      history.length > 0
        ? `Terakhir kali dia recap: ${history[0].content}`
        : "User baru, tapi mukanya udah keliatan malas.";

    // Simpan task awal
    const taskId = await ctx.db.insert("tasks", {
      userId: args.userId,
      originalTitle: args.title,
      roastTitle: "Calculating how much you'll fail...",
      status: "pending",
      createdAt: Date.now(),
    });

    // Panggil AI Action secara background (Async)
    await ctx.scheduler.runAfter(0, internal.task.processRoast, {
      taskId,
      memory,
      title: args.title,
    });

    return taskId;
  },
});

// Internal mutation buat update title setelah di-roast
export const processRoast = internalAction({
  args: { taskId: v.id("tasks"), memory: v.string(), title: v.string() },
  handler: async (ctx, args) => {
    const systemPrompt = `You are a savage productivity AI. 
        Context Memory: ${args.memory}. 
        Task user: ${args.title}. 
        Rename this task into a toxic, short, and insulting Gen-Z style title.`;

    const roastTitle = await ctx.runAction(internal.ai.getRoastResponse, {
      systemPrompt,
      userPrompt: "Rename this task!",
    });

    await ctx.runMutation(internal.task.updateRoastTitle, {
      taskId: args.taskId,
      roastTitle: roastTitle ?? "Task Sampah",
    });
  },
});

export const updateRoastTitle = internalMutation({
  args: { taskId: v.id("tasks"), roastTitle: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { roastTitle: args.roastTitle });
  },
});
