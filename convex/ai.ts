import { GoogleGenerativeAI } from "@google/generative-ai";
import { v } from "convex/values";
import Groq from "groq-sdk";
import { internalAction } from "./_generated/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

export const getRoastResponse = internalAction({
  args: { systemPrompt: v.string(), userPrompt: v.string() },
  handler: async (ctx, args) => {
    // 1. COBA GEMINI (Model Utama)
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(
        `${args.systemPrompt}\n\nUser: ${args.userPrompt}`,
      );
      return result.response.text();
    } catch {
      // 2. FALLBACK KE GROQ (Kalo Gemini Limit/Error)
      console.warn("Gemini limit/error, switching to Groq, blud...");

      if (!groq) {
        return "Gemini lagi error, terus GROQ_API_KEY belum diset. Set env key dulu biar fallback jalan.";
      }

      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: args.systemPrompt },
            { role: "user", content: args.userPrompt },
          ],
          model: "llama-3.3-70b-versatile",
        });
        return completion.choices[0].message.content;
      } catch {
        return "Bahkan AI pun males ngeroast lu. Lu beneran hopeless, blud.";
      }
    }
  },
});
