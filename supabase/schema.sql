-- Elevision (Elephant Detection) - Supabase schema
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- Devices (fixed installation points)
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  location_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  status text not null default 'offline' check (status in ('online', 'offline')),
  last_ping timestamptz,
  camera_status text not null default 'active' check (camera_status in ('active', 'inactive')),
  uptime_percent real not null default 0 check (uptime_percent >= 0 and uptime_percent <= 100),
  api_key_hash text not null,
  created_at timestamptz not null default now()
);

-- Detections/events
create table if not exists public.detections (
  id uuid primary key default gen_random_uuid(),
  device_id text not null references public.devices(device_id) on delete cascade,
  location_name text,
  latitude double precision,
  longitude double precision,
  animal text not null default 'elephant',
  confidence real not null check (confidence >= 0 and confidence <= 1),
  detection_time timestamptz not null default now(),
  image_url text,
  status text not null default 'active' check (status in ('active', 'resolved')),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.devices enable row level security;
alter table public.detections enable row level security;

-- Read access for authenticated dashboard users
create policy if not exists "devices_read_authenticated" on public.devices
  for select
  to authenticated
  using (true);

create policy if not exists "detections_read_authenticated" on public.detections
  for select
  to authenticated
  using (true);

-- Allow authenticated users to update detection status (e.g., resolve alerts)
create policy if not exists "detections_update_authenticated" on public.detections
  for update
  to authenticated
  using (true)
  with check (true);

-- Optional: allow authenticated users to update device metadata
create policy if not exists "devices_update_authenticated" on public.devices
  for update
  to authenticated
  using (true)
  with check (true);
