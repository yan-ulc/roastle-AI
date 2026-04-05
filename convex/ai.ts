import { google } from '@ai-sdk/google';
import { v } from "convex/values";
import { groq } from '@ai-sdk/groq';
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { generateText } from "ai";


// Inisialisasi Provider


import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

export const askAI = internalAction({
  args: {
    systemPrompt: v.string(),
    userPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Setup Providers di dalam handler (biar fresh baca env)
    const googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const groqProvider = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // PRIMARY → GEMINI
    try {
      if (!process.env.GOOGLE_API_KEY) throw new Error("Missing Google Key");

      const { text } = await generateText({
        model: googleProvider("gemini-2.5-flash"), // Gunakan instance googleProvider
        system: args.systemPrompt,
        prompt: args.userPrompt,
      });

      return text;
    } catch (error) {
      console.warn("Gemini failed or rate limited → switching to Groq, blud.");

      // FALLBACK → GROQ
      try {
        if (!process.env.GROQ_API_KEY) throw new Error("Missing Groq Key");

        const { text } = await generateText({
          model: groqProvider("llama-3.3-70b-versatile"), // Gunakan instance groqProvider
          system: args.systemPrompt,
          prompt: args.userPrompt,
        });

        return text;
      } catch (finalError) {
        console.error("All AI Providers failed:", finalError);
        return "Bahkan AI pun nyerah liat kemalasan lu. Set API key di Convex dashboard dulu, blud!";
      }
    }
  },
});

// AGENT 1: Roasting Berbasis Context Teks
export const processRoast = internalAction({
  args: { taskId: v.id("tasks"), userId: v.string(), title: v.string() },
  handler: async (ctx, args) => {
    // Ambil 3 summary terakhir buat amunisi
    const histories = await ctx.runQuery(internal.ai.getPastSummaries, {
      userId: args.userId,
    });

    const contextHistory =
      histories.length > 0
        ? histories.map((h) => `[${h.dateStr}]: ${h.summary}`).join(" | ")
        : "User baru. Belum ada dosa tercatat, tapi mukanya mencurigakan.";

    const systemPrompt = `You are a savage, toxic productivity AI. 
    User History: ${contextHistory}. 
    User wants to: ${args.title}. 
    
    Rename this task to something short, insulting, and personal based on their history. 
    Use Gen-Z slang (cooked, L, mid, blud, wacana). Max 6 words.`;

    const roastTitle = await ctx.runAction(internal.ai.askAI, {
      systemPrompt,
      userPrompt: "Generate the toxic title now!",
    });

    await ctx.runMutation(internal.ai.updateRoastTitle, {
      taskId: args.taskId,
      roastTitle: roastTitle ?? "Task Sampah",
    });
  },
});

// Query buat ambil history
export const getPastSummaries = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailySummaries")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(3);
  },
});

export const updateRoastTitle = internalMutation({
  args: { taskId: v.id("tasks"), roastTitle: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { roastTitle: args.roastTitle });
  },
});
