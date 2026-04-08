# ROASTLE.AI

## Stop being mid, start being a machine.

ROASTLE.AI is a toxic productivity app built to weaponize accountability.
This is not another gentle to-do list. This is a commitment ritual that drags your goals into the spotlight and forces execution.

You plan your day, enter Focus Mode, and get roasted by AI until the task is done.
At the end, The Chronicler writes your daily judgment.

---

## Why ROASTLE.AI Exists

Most productivity apps fail because they are polite.
ROASTLE.AI is not polite.

ROASTLE.AI is designed around pressure, contrast, and consequence:

1. You commit up front.
2. You execute one task at a time.
3. You face a daily recap of what you did or failed to do.

---

## Core Features

### 1. Planning Ritual

Define your daily mission before execution starts.

- Add all planned activities for the day
- Set start time, duration, and execution order
- Save the full plan in one action
- Replace old daily plans with a clean slate when needed

This prevents fake productivity and random task hopping.

### 2. The Roast Chamber (Focus Mode)

A high-contrast fullscreen execution interface that shows exactly one task at a time.

- Displays the next pending task in sequence
- Shows AI-generated roast title and original task intent
- Strong visual hierarchy for focus and urgency
- One-tap completion to move to the next mission
- Session complete state with restart/reset actions

This is where excuses go to die.

### 3. The Chronicler's Recap

At the end of the day, an AI agent writes your daily verdict.

- Counts completed vs failed/pending tasks
- Uses real task context for personalized recap
- Stores summaries for historical reflection
- Triggered when all tasks are complete (or via scheduled fallback)

This gives every day a narrative consequence.

---

## System Architecture

## Dual Agent System

ROASTLE.AI runs two specialized AI agents:

### Agent 1: The Roaster (Instant Motivation)

Purpose: real-time task roasting during execution.

- Triggered when tasks are created/planned
- Generates brutal roast phrasing per task
- Optimized for fast response and UX continuity
- Updates task display data used by Focus Mode

### Agent 2: The Chronicler (Daily Judgment)

Purpose: end-of-day behavioral summary.

- Triggered when all tasks are completed or via scheduled recap flow
- Pulls all relevant tasks for a given user and date
- Produces one toxic summary paragraph with outcome stats
- Persists summary in the daily summaries table

---

## Tech Stack

- Frontend: Next.js 15 (App Router), Tailwind CSS, Lucide React
- Backend + Database: Convex (real-time queries, mutations, internal actions, cron jobs)
- Authentication: Clerk
- AI Engine:
  - Primary: AI SDK with Gemini 1.5 Flash
  - Fallback: Groq with Llama 3
- Runtime: TypeScript across frontend and backend

---

## Data Flow (High Level)

1. User signs in with Clerk.
2. User creates daily plan in Planning Ritual.
3. Convex stores tasks and schedules roast-generation actions.
4. Focus Mode queries next pending task in real time.
5. User completes tasks one by one.
6. On completion of all tasks, Chronicler generates daily recap.
7. Recap is stored and available in summary history.

---

## Getting Started

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm, pnpm, or yarn
- Convex account/project
- Clerk application
- API keys for Gemini and Groq

## 1) Install Dependencies

```bash
npm install
```

## 2) Configure Environment Variables

Create a file named .env.local at project root and set:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI Providers
GOOGLE_API_KEY=
GROQ_API_KEY=
```

Optional but commonly used in Clerk + Next.js setups:

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 3) Run Convex Dev Server

In one terminal:

```bash
npx convex dev
```

This generates Convex API types and runs backend functions locally.

## 4) Run Next.js App

In a second terminal:

```bash
npm run dev
```

Open http://localhost:3000

---

## Recommended Project Workflow

1. Start Convex dev first.
2. Start Next.js dev server.
3. Sign in with Clerk.
4. Build daily plan.
5. Enter Focus Mode and execute.
6. Review The Chronicler recap.

---

## Environment Variables Reference

| Variable                          | Required | Description                                   |
| --------------------------------- | -------- | --------------------------------------------- |
| NEXT_PUBLIC_CONVEX_URL            | Yes      | Convex deployment URL used by frontend client |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Yes      | Clerk publishable key for browser auth        |
| CLERK_SECRET_KEY                  | Yes      | Clerk server secret key                       |
| GOOGLE_API_KEY                    | Yes      | Gemini provider key for primary AI generation |
| GROQ_API_KEY                      | Yes      | Groq provider key for fallback model routing  |

---

## Deployment Notes

- Deploy frontend on Vercel (recommended for Next.js).
- Deploy Convex backend via Convex deployment flow.
- Configure all env vars in deployment platform settings.
- Ensure Clerk domain/origins are set for deployed URL.

---

## Product Philosophy

ROASTLE.AI is intentionally confrontational.
The app uses aggressive language as a behavior design choice, not as abuse for its own sake.

Mission:

- Reduce procrastination
- Increase completion rate
- Turn intention into execution through pressure and clarity

If your current productivity stack is too soft, ROASTLE.AI is the intervention.

---

## License

Add your preferred license here (MIT recommended for open projects).

---

## Final Warning

You can ignore your calendar.
You can ignore your notes app.
ROASTLE.AI will remember what you promised.
