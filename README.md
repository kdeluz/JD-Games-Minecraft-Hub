# JD Games — Minecraft Server Hub

A private Minecraft server community site built with Next.js and Supabase, designed to deploy on Vercel.

## Features

- **Announcements** — Post updates with tags (Launch, Update, Event, Alert), pin important ones
- **Server Info Bar** — Live display of version, modpack, season, status, and last wipe date
- **Server Timeline** — Visual history of JD Games from founding to now
- **Server Rules** — Numbered rule list
- **Whitelist Applications** — Public form for players to apply (Minecraft username, real name, Discord)
- **Admin Panel** — Password-protected dashboard to manage everything
- **"Message Kyle on Discord"** — Server IP is private, no public display

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Once created, go to **SQL Editor** in the dashboard
3. Paste the contents of `supabase-schema.sql` and run it
4. This creates all 4 tables, sets up Row Level Security, and seeds starter data

### 2. Get Your Keys

In your Supabase dashboard, go to **Settings → API**. You need:

- **Project URL** (e.g. `https://abc123.supabase.co`)
- **anon / public key** (safe for browser)
- **service_role key** (server-side only — keep this secret)

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

### 4. Install & Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

1. Push the project to a GitHub repo
2. Go to [vercel.com](https://vercel.com), import the repo
3. In the Vercel project settings, add the same 4 environment variables from `.env.local`
4. Deploy — done

## How It Works

| Layer | What | How |
|-------|-------|-----|
| **Public reads** | Announcements, timeline, server info | Client-side Supabase with `anon` key (RLS allows SELECT) |
| **Whitelist submissions** | Player applications | Client-side Supabase INSERT (RLS allows INSERT) |
| **Admin operations** | CRUD for all tables | Next.js API route (`/api/admin`) using `service_role` key |
| **Admin auth** | Password gate | Checked server-side in the API route |

The `service_role` key bypasses Row Level Security and is only ever used in the API route (server-side). It never reaches the browser.

## Admin Panel

Navigate to the **Admin** tab and log in with your `ADMIN_PASSWORD`. From there you can:

- **Review whitelist applications** — Approve, deny, or remove
- **Manage announcements** — Create, edit, pin, tag, or delete
- **Edit the timeline** — Add milestones and seasons with sort ordering
- **Update server info** — Change version, modpack, status, season, last wipe

## Changing the Admin Password

Update `ADMIN_PASSWORD` in your `.env.local` (locally) or in Vercel's environment variable settings (production). No code changes needed.

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + RLS)
- **Vercel** (hosting)
- No CSS framework — custom CSS with CSS variables
