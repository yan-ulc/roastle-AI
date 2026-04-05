"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { AlertTriangle, Ghost, History } from "lucide-react";
import { api } from "../../../../convex/_generated/api";

export function RoasterDisplay() {
  const { user } = useUser();
  const history = useQuery(api.chronicler.getPastSummaries, {
    userId: user?.id ?? "",
  });

  if (history === undefined)
    return <div className="h-32 animate-pulse bg-zinc-900 rounded-xl" />;

  const latestSummary = history[0];

  return (
    <div className="relative overflow-hidden p-6 bg-zinc-950 border border-red-900/50 rounded-2xl mb-8 group hover:border-red-600 transition-all duration-500">
      {/* Background Glow Effect */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-600/10 blur-3xl rounded-full group-hover:bg-red-600/20 transition-all" />

      <div className="flex items-start gap-4 relative z-10">
        <div className="p-3 bg-red-950/30 border border-red-800 rounded-lg text-red-500 shadow-[0_0_15px_rgba(153,27,27,0.4)]">
          {latestSummary ? <AlertTriangle size={24} /> : <Ghost size={24} />}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-black text-red-500 uppercase tracking-[0.2em]">
              {latestSummary
                ? "The Chronicler's Last Judgment"
                : "New Victim Detected"}
            </h2>
            {latestSummary && (
              <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                <History size={10} /> {latestSummary.dateStr}
              </span>
            )}
          </div>

          <p className="text-zinc-200 text-sm italic leading-relaxed font-medium">
            {latestSummary
              ? `"${latestSummary.summary}"`
              : "Belum ada catatan dosa. Tapi tenang, kegagalan lu hari ini bakal gw catat permanen. Start failing, blud."}
          </p>
        </div>
      </div>
    </div>
  );
}
