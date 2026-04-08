"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  CheckCircle,
  Clock,
  Loader2,
  LogOut,
  RefreshCcw,
  Target,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";

// ─── SHARED VISUAL LAYERS ────────────────────────────────────────────────────

function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
    />
  );
}

function ScanlineEffect() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
      }}
    />
  );
}

function GlitchText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-block glitch-root ${className}`}
      data-text={text}
    >
      {text}
      <style jsx>{`
        .glitch-root::before,
        .glitch-root::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .glitch-root::before {
          color: #ff0000;
          animation: g1 5s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 42%, 0 42%);
        }
        .glitch-root::after {
          color: #ccff00;
          animation: g2 5s infinite;
          clip-path: polygon(0 58%, 100% 58%, 100% 100%, 0 100%);
        }
        @keyframes g1 {
          0%,
          88%,
          100% {
            opacity: 0;
            transform: translateX(-3px);
          }
          90% {
            opacity: 1;
            transform: translateX(-5px) skewX(-3deg);
          }
          92% {
            opacity: 0;
          }
          94% {
            opacity: 1;
            transform: translateX(3px);
          }
          96% {
            opacity: 0;
          }
        }
        @keyframes g2 {
          0%,
          88%,
          100% {
            opacity: 0;
            transform: translateX(3px);
          }
          91% {
            opacity: 1;
            transform: translateX(5px) skewX(2deg);
          }
          93% {
            opacity: 0;
          }
          95% {
            opacity: 1;
            transform: translateX(-3px);
          }
          97% {
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}

// ─── TIMER ───────────────────────────────────────────────────────────────────

function useElapsedTimer() {
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(Date.now());
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - start.current) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toTimeString().slice(0, 8));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time}</span>;
}

// ─── FONT SIZE HELPER ─────────────────────────────────────────────────────────

function getDynamicFontClass(len: number) {
  if (len < 20) return "text-[clamp(3.5rem,10vw,7rem)]";
  if (len < 40) return "text-[clamp(2.8rem,8vw,5.5rem)]";
  if (len < 70) return "text-[clamp(2.2rem,6vw,4.5rem)]";
  if (len < 110) return "text-[clamp(1.8rem,5vw,3.5rem)]";
  return "text-[clamp(1.4rem,4vw,2.5rem)]";
}

// ─── LOADING STATE ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <>
      <GrainOverlay />
      <ScanlineEffect />
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative">
          <div className="w-16 h-16 border border-red-600/30 rounded-full animate-ping absolute inset-0" />
          <div className="w-16 h-16 border border-zinc-800 rounded-full flex items-center justify-center">
            <Target className="text-red-600" size={24} />
          </div>
        </div>
        <p className="font-mono text-xs text-zinc-700 tracking-[0.4em] uppercase animate-pulse mt-2">
          ACQUIRING TARGET...
        </p>
      </div>
    </>
  );
}

// ─── DONE STATE ───────────────────────────────────────────────────────────────

function DoneScreen({
  onReset,
  onExit,
}: {
  onReset: () => void;
  onExit: () => void;
}) {
  return (
    <>
      <GrainOverlay />
      <ScanlineEffect />
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Anton&family=Share+Tech+Mono&display=swap");
        .done-enter {
          animation: fadeup 0.8s ease both;
        }
        .done-enter-delay-1 {
          animation: fadeup 0.8s 0.15s ease both;
        }
        .done-enter-delay-2 {
          animation: fadeup 0.8s 0.3s ease both;
        }
        .done-enter-delay-3 {
          animation: fadeup 0.8s 0.5s ease both;
        }
        @keyframes fadeup {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .press-btn:active {
          transform: scale(0.97);
        }
      `}</style>

      <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(220,38,38,0.07),transparent)]" />

        {/* Vertical lines */}
        <div className="fixed left-0 top-0 bottom-0 w-px bg-zinc-900" />
        <div className="fixed right-0 top-0 bottom-0 w-px bg-zinc-900" />

        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 border-b border-zinc-900 px-8 py-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <span className="font-mono text-xs text-zinc-700 tracking-[0.3em] uppercase">
              ROASTLE.AI // SESSION END
            </span>
          </div>
          <LiveClock />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Icon */}
          <div className="done-enter flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 border border-red-600/20 rotate-45 absolute -inset-2" />
              <div className="w-16 h-16 border border-red-600/50 flex items-center justify-center">
                <LogOut className="text-red-600" size={28} />
              </div>
            </div>
          </div>

          {/* Eyebrow */}
          <p className="done-enter-delay-1 font-mono text-xs text-red-600 tracking-[0.5em] uppercase mb-4">
            &gt; ALL MISSIONS TERMINATED
          </p>

          {/* Title */}
          <h1
            className="done-enter-delay-1 font-black uppercase leading-none text-white mb-3"
            style={{
              fontFamily: "'Anton','Impact',sans-serif",
              fontSize: "clamp(3rem, 10vw, 7rem)",
              letterSpacing: "0.02em",
            }}
          >
            SESSION <GlitchText text="COMPLETE." className="text-red-600" />
          </h1>

          {/* Decorative line */}
          <div className="done-enter-delay-2 flex items-center gap-4 max-w-md mx-auto my-8">
            <div className="flex-1 h-px bg-zinc-900" />
            <div className="w-1.5 h-1.5 border border-red-600/60 rotate-45" />
            <div className="flex-1 h-px bg-zinc-900" />
          </div>

          {/* Subtext */}
          <p
            className="done-enter-delay-2 text-zinc-500 max-w-lg mx-auto mb-12 leading-relaxed"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.85rem",
            }}
          >
            Finished everything? Don't expect a hug. Now get out — or start over
            if you're addicted to being roasted.
          </p>

          {/* Buttons */}
          <div className="done-enter-delay-3 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onReset}
              className="press-btn flex items-center justify-center gap-3 border border-zinc-700 bg-transparent hover:bg-white hover:text-black px-8 py-4 font-mono text-[10px] text-zinc-400 transition-all duration-300 uppercase tracking-[0.2em]"
              style={{
                fontFamily: "'Anton','Impact',sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              <RefreshCcw
                size={14}
                className="group-hover:rotate-180 transition-transform duration-500"
              />
              NEW SESSION
            </button>

            <button
              onClick={onExit}
              className="press-btn group flex items-center justify-center gap-3 border border-zinc-700 bg-transparent hover:bg-[#ccff00] hover:border-[#ccff00] px-8 py-4 font-mono text-[10px] text-zinc-400 hover:text-black transition-all duration-300 uppercase tracking-[0.2em]"
              style={{
                fontFamily: "'Anton','Impact',sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              GET THE F*CK OUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ACTIVE FOCUS STATE ───────────────────────────────────────────────────────

function FocusScreen({
  task,
  onComplete,
}: {
  task: any;
  onComplete: () => Promise<unknown> | void;
}) {
  const elapsed = useElapsedTimer();
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    setPressed(false);
  }, [task?._id]);

  const displayTitle =
    task.roastTitle
      .replace(/^\s*\*{0,2}\s*roast\s*title\s*:\s*\*{0,2}\s*/i, "")
      .trim() || task.roastTitle;

  const fontClass = getDynamicFontClass(displayTitle.length);

  return (
    <>
      <GrainOverlay />
      <ScanlineEffect />
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Anton&family=Share+Tech+Mono&display=swap");

        .press-btn:active {
          transform: scale(0.96);
        }

        .target-in {
          animation: targetin 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes targetin {
          from {
            opacity: 0;
            transform: translateY(30px) skewY(-1deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) skewY(0);
          }
        }

        .stats-in {
          animation: fadein 0.5s 0.1s ease both;
        }
        .cta-in {
          animation: fadein 0.5s 0.25s ease both;
        }
        @keyframes fadein {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pulse-border {
          animation: pulseborder 2s ease-in-out infinite;
        }
        @keyframes pulseborder {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(220, 38, 38, 0.08);
          }
        }

        .scan-sweep {
          animation: sweep 2.5s linear infinite;
        }
        @keyframes sweep {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(100vh);
          }
        }
      `}</style>

      <div className="min-h-screen w-screen bg-black relative overflow-x-hidden">
        {/* Background radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(220,38,38,0.05),transparent)]" />

        {/* Vertical rails */}
        <div className="fixed left-0 top-0 bottom-0 w-px bg-zinc-900" />
        <div className="fixed right-0 top-0 bottom-0 w-px bg-zinc-900" />

        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 border-b border-zinc-900 px-6 py-3 flex items-center justify-between z-20 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span className="font-mono text-xs text-zinc-600 tracking-[0.3em] uppercase">
              ROASTLE.AI // FOCUS MODE
            </span>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs text-zinc-700 tracking-widest">
            <span>
              <LiveClock />
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">
          {/* Stats pill */}
          <div className="stats-in flex items-center gap-6 border border-zinc-900 bg-zinc-950/80 px-5 py-2.5 mb-12 font-mono text-[10px] tracking-[0.3em] text-zinc-700 uppercase">
            <div className="flex items-center gap-2">
              <Clock size={10} className="text-zinc-700" />
              <span>DEPLOY</span>
              <span className="text-zinc-400 ml-1">{task.startTime}</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <Zap size={10} className="text-zinc-700" />
              <span>LIMIT</span>
              <span className="text-zinc-400 ml-1">{task.duration} MIN</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="text-red-600">ELAPSED</span>
              <span className="text-red-500 ml-1 tabular-nums">{elapsed}</span>
            </div>
          </div>

          {/* Eyebrow */}
          <p className="target-in font-mono text-xs text-red-600 tracking-[0.5em] uppercase mb-6">
            &gt;&gt; TARGET ACQUIRED
          </p>

          {/* The roast title — main event */}
          <div className="target-in text-center max-w-5xl mx-auto mb-6">
            {/* Corner brackets */}
            <div className="relative inline-block">
              <span
                className="absolute -top-3 -left-4 font-mono text-red-600/30 text-2xl select-none"
                aria-hidden
              >
                [
              </span>
              <span
                className="absolute -bottom-3 -right-4 font-mono text-red-600/30 text-2xl select-none"
                aria-hidden
              >
                ]
              </span>

              <h1
                className={`${fontClass} font-black uppercase leading-[1.08] text-white`}
                style={{
                  fontFamily: "'Anton','Impact',sans-serif",
                  letterSpacing: "0.03em",
                  wordBreak: "break-word",
                }}
              >
                {displayTitle}
              </h1>
            </div>
          </div>

          {/* Original intent */}
          <div className="target-in mb-12 text-center">
            <p className="font-mono text-[10px] text-zinc-700 tracking-[0.35em] uppercase mb-2">
              ORIGINAL INTENT
            </p>
            <p
              className="text-zinc-500 italic border-b border-zinc-900 pb-2 max-w-xl"
              style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.9rem",
              }}
            >
              "{task.originalTitle}"
            </p>
          </div>

          {/* CTA */}
          <div className="cta-in">
            <button
              onClick={async () => {
                if (pressed) return;
                setPressed(true);
                try {
                  await Promise.resolve(onComplete());
                } catch {
                  setPressed(false);
                }
              }}
              disabled={pressed}
              className="press-btn pulse-border relative overflow-hidden group flex items-center gap-4 bg-red-600 hover:bg-white text-white hover:text-black px-12 py-6 font-black text-lg transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none uppercase"
              style={{
                fontFamily: "'Anton','Impact',sans-serif",
                letterSpacing: "0.08em",
              }}
            >
              {/* Sweep line on hover */}
              <div
                className="absolute inset-x-0 h-10 opacity-0 group-hover:opacity-10 pointer-events-none scan-sweep"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, white, transparent)",
                }}
              />

              {pressed ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  NEXT TARGET...
                </>
              ) : (
                <>
                  MISSION COMPLETE
                  <CheckCircle size={20} strokeWidth={2.5} />
                </>
              )}
            </button>

            <p className="mt-4 font-mono text-[10px] text-zinc-800 text-center tracking-widest uppercase">
              TAP WHEN DONE // NO LYING
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── PAGE SHELL ───────────────────────────────────────────────────────────────

export default function FocusPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const currentTask = useQuery(api.task.getNextFocusTask, {
    userId: user?.id ?? "",
  });

  const finishTask = useMutation(api.task.completeTask);
  const resetTasks = useMutation(api.task.resetDailyTasks);

  if (currentTask === undefined) return <LoadingScreen />;

  if (currentTask === null)
    return (
      <DoneScreen
        onReset={async () => {
          await resetTasks({ userId: user?.id ?? "" });
          router.push("/plan");
        }}
        onExit={async () => {
          await signOut({ redirectUrl: "/landing" });
        }}
      />
    );

  return (
    <FocusScreen
      task={currentTask}
      onComplete={() =>
        finishTask({ taskId: currentTask._id, userId: user?.id ?? "" })
      }
    />
  );
}
