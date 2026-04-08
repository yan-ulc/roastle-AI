"use client";
import { Play, Plus, Trash2, Zap, Target, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PlanItem = {
  title: string;
  time: string;
  duration: number;
};

const DURATIONS = [
  { value: "15", label: "15 MIN" },
  { value: "30", label: "30 MIN" },
  { value: "45", label: "45 MIN" },
  { value: "60", label: "1 HR" },
  { value: "90", label: "1.5 HRS" },
  { value: "120", label: "2 HRS" },
  { value: "180", label: "3 HRS" },
];

function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
    />
  );
}

function GlitchText({ text }: { text: string }) {
  return (
    <span className="relative inline-block glitch-wrapper" data-text={text}>
      {text}
      <style jsx>{`
        .glitch-wrapper {
          position: relative;
        }
        .glitch-wrapper::before,
        .glitch-wrapper::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .glitch-wrapper::before {
          color: #ff0000;
          animation: glitch-1 4s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          transform: translateX(-2px);
        }
        .glitch-wrapper::after {
          color: #ccff00;
          animation: glitch-2 4s infinite;
          clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
          transform: translateX(2px);
        }
        @keyframes glitch-1 {
          0%, 90%, 100% { opacity: 0; transform: translateX(-2px); }
          92% { opacity: 1; transform: translateX(-4px) skewX(-2deg); }
          94% { opacity: 0; }
          96% { opacity: 1; transform: translateX(2px); }
          98% { opacity: 0; }
        }
        @keyframes glitch-2 {
          0%, 90%, 100% { opacity: 0; transform: translateX(2px); }
          93% { opacity: 1; transform: translateX(4px) skewX(2deg); }
          95% { opacity: 0; }
          97% { opacity: 1; transform: translateX(-2px); }
          99% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

function ScanlineEffect() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }}
    />
  );
}

function MissionCounter({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs text-zinc-600 tracking-widest">
      <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
      <span>{String(count).padStart(2, "0")} MISSIONS LOADED</span>
    </div>
  );
}

function MissionRow({
  item,
  idx,
  onUpdate,
  onDelete,
  isOnly,
}: {
  item: PlanItem;
  idx: number;
  onUpdate: (idx: number, key: keyof PlanItem, val: any) => void;
  onDelete: (idx: number) => void;
  isOnly: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative flex items-center gap-3 p-4 border transition-all duration-200 group ${
        focused || hovered
          ? "border-red-600 bg-zinc-950"
          : "border-zinc-900 bg-black"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* order number */}
      <span
        className={`font-mono text-xs w-6 text-right shrink-0 transition-colors ${
          focused || hovered ? "text-red-600" : "text-zinc-800"
        }`}
      >
        {String(idx + 1).padStart(2, "0")}
      </span>

      {/* accent bar */}
      <div
        className={`w-0.5 h-8 shrink-0 transition-colors duration-200 ${
          focused ? "bg-red-600" : hovered ? "bg-zinc-700" : "bg-zinc-900"
        }`}
      />

      {/* title input */}
      <input
        placeholder="MISSION BRIEFING..."
        className="flex-1 bg-transparent outline-none font-black text-base uppercase tracking-wide placeholder:text-zinc-800 placeholder:font-normal placeholder:normal-case placeholder:tracking-normal text-white caret-red-600"
        value={item.title}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onUpdate(idx, "title", e.target.value)}
        style={{ fontFamily: "'Anton', 'Impact', sans-serif", letterSpacing: "0.05em" }}
      />

      {/* time input */}
      <div className="relative shrink-0">
        <Clock size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-700" />
        <input
          type="time"
          className="bg-zinc-950 border border-zinc-800 pl-6 pr-2 py-2 outline-none focus:border-red-600 font-mono text-xs text-zinc-400 focus:text-white transition-colors w-28"
          value={item.time}
          onChange={(e) => onUpdate(idx, "time", e.target.value)}
        />
      </div>

      {/* duration select */}
      <div className="shrink-0 w-28">
        <Select
          value={item.duration.toString()}
          onValueChange={(val) => onUpdate(idx, "duration", parseInt(val))}
        >
          <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 rounded-none h-9 font-mono text-xs text-zinc-400 focus:border-red-600 focus:ring-0 focus:ring-offset-0">
            <Zap size={10} className="text-zinc-700 shrink-0" />
            <SelectValue placeholder="DUR" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-400 rounded-none font-mono text-xs">
            {DURATIONS.map((d) => (
              <SelectItem
                key={d.value}
                value={d.value}
                className="focus:bg-zinc-900 focus:text-red-500"
              >
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* delete */}
      {!isOnly && (
        <button
          onClick={() => onDelete(idx)}
          className="shrink-0 text-zinc-800 hover:text-red-600 transition-colors duration-150 opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      )}
      {isOnly && <div className="w-15px shrink-0" />}

      {/* corner accent */}
      <div
        className={`absolute bottom-0 right-0 w-4 h-4 border-b border-r transition-colors duration-200 ${
          focused || hovered ? "border-red-600" : "border-transparent"
        }`}
      />
    </div>
  );
}

export default function PlanPage() {
  const [items, setItems] = useState<PlanItem[]>([
    { title: "", time: "08:00", duration: 30 },
  ]);
  const [saving, setSaving] = useState(false);
  const [tick, setTick] = useState(0);
  const clockRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    clockRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);

  const addItem = () => {
    const lastTime = items[items.length - 1]?.time ?? "08:00";
    const [h, m] = lastTime.split(":").map(Number);
    const nextMinutes = h * 60 + m + 60;
    const nextH = Math.floor(nextMinutes / 60) % 24;
    const nextM = nextMinutes % 60;
    const nextTime = `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;
    setItems([...items, { title: "", time: nextTime, duration: 30 }]);
  };

  const updateItem = (index: number, key: keyof PlanItem, val: any) => {
    const newItems = [...items];
    (newItems[index] as any)[key] = val;
    setItems(newItems);
  };

  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const savePlan = useMutation(api.task.saveDailyPlan);
  const { user } = useUser();
  const router = useRouter();

  const totalMinutes = items.reduce((acc, item) => acc + item.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const handleSaveAll = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await savePlan({
        userId: user.id,
        tasks: items.map((item, index) => ({
          originalTitle: item.title,
          startTime: item.time,
          duration: item.duration,
          order: index + 1,
        })),
      });
      router.push("/focus");
    } catch (err) {
      setSaving(false);
      alert("MISSION FAILED. TRY AGAIN, SOLDIER.");
    }
  };

  return (
    <>
      <GrainOverlay />
      <ScanlineEffect />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Share+Tech+Mono&display=swap');

        .scan-anim {
          animation: scandown 3s linear infinite;
        }
        @keyframes scandown {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        .press-btn:active {
          transform: scale(0.97);
        }

        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1) opacity(0.2);
        }
      `}</style>

      <div className="relative z-10 min-h-screen bg-black text-white">
        {/* Vertical accent lines */}
        <div className="fixed left-0 top-0 bottom-0 w-px bg-zinc-900" />
        <div className="fixed right-0 top-0 bottom-0 w-px bg-zinc-900" />

        {/* Top bar */}
        <div className="border-b border-zinc-900 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target size={14} className="text-red-600" />
            <span className="font-mono text-xs text-zinc-600 tracking-[0.3em] uppercase">
              ROASTLE.AI // MISSION PLANNER
            </span>
          </div>
          <div className="font-mono text-xs text-zinc-700 tracking-widest tabular-nums">
            {timeStr}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-red-600 tracking-[0.4em] mb-3 uppercase">
                  &gt; INITIALIZING BATTLE PLAN
                </p>
                <h1
                  className="text-6xl font-black uppercase leading-none mb-1 text-white"
                  style={{ fontFamily: "'Anton', 'Impact', sans-serif", letterSpacing: "0.02em" }}
                >
                  SET YOUR
                </h1>
                <h1
                  className="text-6xl font-black uppercase leading-none"
                  style={{ fontFamily: "'Anton', 'Impact', sans-serif", letterSpacing: "0.02em" }}
                >
                  DAILY{" "}
                  <span className="text-red-600 relative">
                    <GlitchText text="TRAPS" />
                  </span>
                </h1>
              </div>

              {/* Stats block */}
              <div className="border border-zinc-900 p-4 text-right mt-2">
                <div className="font-mono text-xs text-zinc-700 tracking-widest mb-1">TOTAL LOCKED IN</div>
                <div
                  className="text-4xl font-black text-white"
                  style={{ fontFamily: "'Anton', 'Impact', sans-serif" }}
                >
                  {totalHours}
                  <span className="text-lg text-zinc-600 ml-1">HRS</span>
                </div>
                <div className="font-mono text-xs text-zinc-700 mt-1">{totalMinutes} MINUTES</div>
              </div>
            </div>

            {/* Decorative line */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-zinc-900" />
              <div className="w-2 h-2 border border-red-600 rotate-45" />
              <div className="flex-1 h-px bg-zinc-900" />
            </div>
          </div>

          {/* Mission counter */}
          <div className="mb-4">
            <MissionCounter count={items.length} />
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 mb-2 px-4">
            <span className="w-6" />
            <div className="w-0.5" />
            <span className="flex-1 font-mono text-[10px] text-zinc-700 tracking-[0.3em] uppercase">Mission</span>
            <span className="w-28 font-mono text-[10px] text-zinc-700 tracking-[0.3em] uppercase">Deploy</span>
            <span className="w-28 font-mono text-[10px] text-zinc-700 tracking-[0.3em] uppercase">Duration</span>
            <span className="w-15px" />
          </div>

          {/* Mission rows */}
          <div className="space-y-1 mb-8">
            {items.map((item, idx) => (
              <MissionRow
                key={idx}
                item={item}
                idx={idx}
                onUpdate={updateItem}
                onDelete={deleteItem}
                isOnly={items.length === 1}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {/* Add button */}
            <button
              onClick={addItem}
              className="press-btn group flex items-center gap-2 border border-zinc-800 bg-transparent hover:border-zinc-600 hover:bg-zinc-950 px-6 py-4 font-mono text-xs text-zinc-600 hover:text-zinc-400 transition-all duration-150 tracking-widest uppercase"
            >
              <Plus
                size={14}
                className="group-hover:rotate-90 transition-transform duration-200"
              />
              ADD MISSION
            </button>

            {/* Start button */}
            <button
              onClick={handleSaveAll}
              disabled={saving || items.every((i) => !i.title.trim())}
              className="press-btn relative flex-1 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-8 py-4 font-black flex justify-center items-center gap-3 transition-all duration-150 uppercase overflow-hidden group"
              style={{ fontFamily: "'Anton', 'Impact', sans-serif", letterSpacing: "0.08em", fontSize: "1.1rem" }}
            >
              {/* animated scan line on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20">
                <div
                  className="absolute inset-x-0 h-8 scan-anim"
                  style={{
                    background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent)",
                  }}
                />
              </div>

              {saving ? (
                <>
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                  DEPLOYING...
                </>
              ) : (
                <>
                  EXECUTE MISSION
                  <Play size={16} fill="currentColor" />
                </>
              )}
            </button>
          </div>

          {/* Footer note */}
          <p className="font-mono text-[10px] text-zinc-800 mt-6 text-center tracking-widest uppercase">
            NO EXCUSES // NO MERCY // ROASTLE WILL REMEMBER
          </p>
        </div>
      </div>
    </>
  );
}