"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { RoasterDisplay } from "../../../components/ui/custom/RoasterDisplay";
import { TaskCard } from "../../../components/ui/custom/TaskCard";

export default function Dashboard() {
  const { user } = useUser();
  const [taskTitle, setTaskTitle] = useState("");
  const saveDailyPlan = useMutation(api.task.saveDailyPlan);
  const tasks = useQuery(api.task.getMyTasks, {
    userId: user?.id ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !user) return;

    await saveDailyPlan({
      userId: user.id,
      tasks: [
        {
          originalTitle: taskTitle,
          startTime: "08:00",
          duration: 30,
          order: 1,
        },
      ],
    });
    setTaskTitle("");
  };

  return (
    <main className="max-w-2xl mx-auto p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2">HABIT ROASTER</h1>
        <p className="text-zinc-500">Stop being mid. Start doing something.</p>
      </header>

      <RoasterDisplay />

      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="What's your next failure?"
          className="flex-1 bg-zinc-900 border-zinc-800 border p-3 rounded-lg text-white focus:outline-none focus:border-red-600"
        />
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 rounded-lg transition-colors">
          ADD
        </button>
      </form>

      <div className="space-y-4">
        {tasks?.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
      </div>
    </main>
  );
}
