# Client Task Dashboard

A financial-grade client task management system built with Next.js 14, Supabase, and TailwindCSS.

## Features

- 🔐 Auth via Email/Password or Google OAuth
- 🛡️ Row Level Security (RLS) — Staff see only their tasks; Admins see all
- 📊 Dynamic filters (Pending, In Progress, Completed) — no page refresh
- ⚠️ **Overdue Warning System** — tasks past due date are flagged in red with aging counter
- 🏷️ Priority tags (Critical, High, Medium, Low)
- 💼 Client/matter tagging for financial firm workflows

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Deployment**: Vercel

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd client-task-dashboard
npm install
```

### 2. Supabase Setup

Create a project at [supabase.com](https://supabase.com), then run the SQL in `supabase/schema.sql`.

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run

```bash
npm run dev
```

## RLS Policy Summary

| Role  | View Tasks | Edit Tasks | Delete Tasks |
|-------|-----------|-----------|-------------|
| Staff | Own tasks only | Own assigned tasks | ❌ |
| Admin | All tasks | All tasks | ✅ |
