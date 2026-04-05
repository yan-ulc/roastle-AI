// src/components/custom/TaskCard.tsx
import { Card, CardContent } from "@/components/ui/card";

export function TaskCard({ task }: { task: any }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 mb-4 hover:border-red-500 transition-all">
      <CardContent className="p-4">
        <h3 className="text-red-500 font-bold text-lg italic">
          "{task.roastTitle}"
        </h3>
        <p className="text-zinc-500 text-sm mt-1">
          Original intent: {task.originalTitle}
        </p>
        <div className="flex gap-2 mt-4">
          <button className="bg-green-600 px-3 py-1 text-xs rounded text-white">Done</button>
          <button className="bg-zinc-800 px-3 py-1 text-xs rounded text-zinc-400">Give up</button>
        </div>
      </CardContent>
    </Card>
  );
}