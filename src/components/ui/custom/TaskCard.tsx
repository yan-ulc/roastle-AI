type TaskCardProps = {
  task: {
    _id: string;
    originalTitle: string;
    roastTitle: string;
    status: "pending" | "completed" | "failed";
  };
};

export function TaskCard({ task }: TaskCardProps) {
  const statusColor =
    task.status === "completed"
      ? "text-emerald-400 bg-emerald-950/40 border-emerald-900"
      : task.status === "failed"
        ? "text-rose-400 bg-rose-950/40 border-rose-900"
        : "text-amber-300 bg-amber-950/40 border-amber-900";

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-100">
          {task.roastTitle}
        </h3>
        <span
          className={`rounded border px-2 py-1 text-[10px] uppercase ${statusColor}`}
        >
          {task.status}
        </span>
      </div>
      <p className="text-xs text-zinc-400">Original: {task.originalTitle}</p>
    </article>
  );
}
