"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function RoasterDisplay() {
  const { user } = useUser();
  const summary = useQuery(
    api.chronicler.getPastSummaries,
    user ? { userId: user.id } : "skip",
  );

  if (!summary || summary.length === 0) return null;

  const latestDose = summary[0];

  return (
    <div className="p-6 bg-red-950/20 border-2 border-red-900 rounded-xl mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-2xl">💀</span>
        </div>
        <div>
          <h2 className="text-red-500 font-black uppercase tracking-tighter">
            The Chronicler&apos;s Judgment
          </h2>
          <p className="text-xs text-red-400 opacity-70">
            {latestDose.dateStr}
          </p>
        </div>
      </div>

      <p className="text-zinc-200 italic font-medium leading-relaxed">
        &quot;{latestDose.summary}&quot;
      </p>

      <div className="mt-4 flex gap-2">
        <span className="text-[10px] bg-red-900 px-2 py-1 rounded text-red-200">
          FAIL: {latestDose.stats.failed}
        </span>
        <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-400">
          DONE: {latestDose.stats.completed}
        </span>
      </div>
    </div>
  );
}
