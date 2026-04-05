import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Ini bakal jalan buat semua user (Lu perlu bikin mutation buat nge-trigger ini ke semua user)
crons.cron(
  "Summary Dosa Harian",
  "0 17 * * *", // Jam 00:00 WIB
  internal.chronicler.triggerAllUserRecaps,
);

export default crons;
