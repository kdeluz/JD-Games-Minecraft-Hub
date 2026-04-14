-- ============================================================
-- JD GAMES — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Announcements
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  date date not null default current_date,
  pinned boolean not null default false,
  tag text not null default 'update',
  created_at timestamptz default now()
);

alter table public.announcements enable row level security;
create policy "Anyone can read announcements"
  on public.announcements for select using (true);

-- 2. Timeline entries
create table public.timeline_entries (
  id uuid default gen_random_uuid() primary key,
  date_label text not null,          -- e.g. "Apr 2026"
  title text not null,
  description text not null default '',
  tag text not null default 'milestone',
  sort_order int not null default 0, -- for manual ordering
  created_at timestamptz default now()
);

alter table public.timeline_entries enable row level security;
create policy "Anyone can read timeline"
  on public.timeline_entries for select using (true);

-- 3. Whitelist applications
create table public.whitelist_applications (
  id uuid default gen_random_uuid() primary key,
  mc_username text not null,
  real_name text not null,
  discord text default '',
  note text default '',
  status text not null default 'pending',  -- pending | approved | denied
  created_at timestamptz default now()
);

alter table public.whitelist_applications enable row level security;
-- Anyone can submit an application
create policy "Anyone can submit applications"
  on public.whitelist_applications for insert with check (true);
-- Only service_role (admin API) can read/update/delete (bypasses RLS)

-- 4. Server info (single row)
create table public.server_info (
  id int primary key default 1 check (id = 1),  -- always one row
  version text not null default '1.21.5',
  modpack text not null default 'Cobbleverse',
  status text not null default 'Online',
  season text not null default 'Season 3',
  last_wipe text not null default 'April 2026'
);

alter table public.server_info enable row level security;
create policy "Anyone can read server info"
  on public.server_info for select using (true);

-- Insert default server info row
insert into public.server_info (id, version, modpack, status, season, last_wipe)
values (1, '1.21.5', 'Cobbleverse', 'Online', 'Season 3', 'April 2026');

-- ============================================================
-- SEED DATA (optional — delete if you want to start empty)
-- ============================================================

insert into public.announcements (title, body, date, pinned, tag) values
  ('Season 3 Has Launched!', 'The new season is live with a fresh map, new mods, and updated rules. Hop in and claim your spot!', '2026-04-10', true, 'launch'),
  ('New Mods Added', 'We''ve added Create, Farmer''s Delight, and Supplementaries to the modpack. Update your client to join.', '2026-04-08', false, 'update'),
  ('Community Build Event — April 20th', 'Join us for a group build event this Saturday. Theme: medieval village. Prizes for the best build!', '2026-04-05', false, 'event');

insert into public.timeline_entries (date_label, title, description, tag, sort_order) values
  ('Jan 2024', 'JD Games Founded', 'Kyle starts JD Games and launches the first Minecraft server for friends.', 'milestone', 1),
  ('Mar 2024', 'Season 1 — Vanilla', 'Pure vanilla survival. 8 players on day one.', 'season', 2),
  ('Sep 2024', 'Season 2 — Modded', 'First modded season with a curated modpack. Community grows to 20+.', 'season', 3),
  ('Apr 2025', 'Discord Server Revamp', 'New roles, channels, and community events system.', 'milestone', 4),
  ('Apr 2026', 'Season 3 — Cobbleverse', 'Biggest season yet. New modpack, fresh map, and this website.', 'season', 5);
