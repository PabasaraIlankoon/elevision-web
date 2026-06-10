-- =====================================================
-- EleVision - Elephant Detection System
-- Supabase Database Schema
-- v2 — Fully self-contained. Run once in SQL Editor.
-- Covers: tables, indexes, RLS, storage, realtime,
--         cron jobs, and storage policies.
-- =====================================================


-- =====================================================
-- EXTENSIONS
-- =====================================================

create extension if not exists pgcrypto;

-- pg_cron is pre-installed on Supabase — just enable it
create extension if not exists pg_cron;


-- =====================================================
-- DEVICES
-- =====================================================

create table if not exists public.devices (
  id             uuid              primary key default gen_random_uuid(),
  device_id      text              not null unique,
  location_name  text              not null,
  latitude       double precision  not null,
  longitude      double precision  not null,
  status         text              not null default 'offline'
                   check (status in ('online', 'offline')),
  last_ping      timestamptz,
  camera_status  text              not null default 'active'
                   check (camera_status in ('active', 'inactive')),
  uptime_percent real              not null default 0
                   check (uptime_percent >= 0 and uptime_percent <= 100),
  api_key_hash   text              not null,
  created_at     timestamptz       not null default now()
);


-- =====================================================
-- DETECTIONS / EVENTS
-- =====================================================

create table if not exists public.detections (
  id             uuid         primary key default gen_random_uuid(),
  device_id      text         not null
                   references public.devices(device_id)
                   on delete cascade,
  location_name  text,
  latitude       double precision,
  longitude      double precision,
  animal         text         not null default 'elephant',
  confidence     real         not null
                   check (confidence >= 0 and confidence <= 1),
  detection_time timestamptz  not null default now(),
  image_url      text,
  status         text         not null default 'active'
                   check (status in ('active', 'resolved')),
  created_at     timestamptz  not null default now()
);


-- =====================================================
-- INDEXES
-- =====================================================

create index if not exists idx_devices_device_id
  on public.devices(device_id);

create index if not exists idx_detections_device_id
  on public.detections(device_id);

create index if not exists idx_detections_detection_time
  on public.detections(detection_time desc);

create index if not exists idx_detections_status
  on public.detections(status);

-- Composite index — speeds up the dashboard "last 30 days" query
create index if not exists idx_detections_time_status
  on public.detections(detection_time desc, status);


-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.devices    enable row level security;
alter table public.detections enable row level security;


-- =====================================================
-- RLS POLICIES — authenticated users (dashboard login)
-- =====================================================

drop policy if exists "devices_read_authenticated"    on public.devices;
drop policy if exists "devices_update_authenticated"  on public.devices;
drop policy if exists "detections_read_authenticated" on public.detections;
drop policy if exists "detections_update_authenticated" on public.detections;

create policy "devices_read_authenticated"
  on public.devices for select to authenticated using (true);

create policy "devices_update_authenticated"
  on public.devices for update to authenticated using (true) with check (true);

create policy "detections_read_authenticated"
  on public.detections for select to authenticated using (true);

create policy "detections_update_authenticated"
  on public.detections for update to authenticated using (true) with check (true);


-- =====================================================
-- RLS POLICIES — anon users (public dashboard, no login)
-- =====================================================

drop policy if exists "devices_read_anon"    on public.devices;
drop policy if exists "devices_update_anon"  on public.devices;
drop policy if exists "detections_read_anon" on public.detections;
drop policy if exists "detections_update_anon" on public.detections;

create policy "devices_read_anon"
  on public.devices for select to anon using (true);

-- Anon update needed so the dashboard can mark detections as resolved
create policy "devices_update_anon"
  on public.devices for update to anon using (true) with check (true);

create policy "detections_read_anon"
  on public.detections for select to anon using (true);

create policy "detections_update_anon"
  on public.detections for update to anon using (true) with check (true);


-- =====================================================
-- STORAGE — detections image bucket
-- NOTE: Service role (used by the Pi API route) bypasses
--       storage RLS automatically, so no INSERT policy
--       is needed for uploads.
-- =====================================================

insert into storage.buckets (id, name, public)
  values ('detections', 'detections', true)
  on conflict (id) do update set public = true;

-- Allow anyone to read stored detection images
drop policy if exists "storage_detections_public_read" on storage.objects;

create policy "storage_detections_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'detections');


-- =====================================================
-- REALTIME — enable live push for dashboard
-- These two tables must be in the supabase_realtime
-- publication so the JS client receives INSERT/UPDATE
-- events without polling.
-- =====================================================

-- Add tables to the realtime publication.
-- The "if not exists" equivalent is to check pg_publication_tables first.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and tablename = 'detections'
  ) then
    alter publication supabase_realtime add table public.detections;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and tablename = 'devices'
  ) then
    alter publication supabase_realtime add table public.devices;
  end if;
end $$;


-- =====================================================
-- CRON JOBS — automated maintenance
-- pg_cron runs inside the database on a schedule.
-- All times are UTC.
-- =====================================================

-- 1. Mark devices offline if they haven't pinged in 3 minutes.
--    Runs every 2 minutes so the dashboard reacts quickly.
select cron.schedule(
  'elevision-mark-devices-offline',   -- job name (unique)
  '*/2 * * * *',                      -- every 2 minutes
  $$
    update public.devices
    set    status = 'offline'
    where  status = 'online'
      and  last_ping < now() - interval '3 minutes';
  $$
);

-- 2. Auto-resolve detections that have been "active" for
--    more than 30 minutes (elephant has likely moved on).
select cron.schedule(
  'elevision-auto-resolve-detections',
  '*/10 * * * *',                     -- every 10 minutes
  $$
    update public.detections
    set    status = 'resolved'
    where  status = 'active'
      and  detection_time < now() - interval '30 minutes';
  $$
);

-- 3. Purge detection records older than 90 days to keep
--    the table lean. Images in Storage are unaffected
--    (purge those separately via Storage lifecycle if needed).
select cron.schedule(
  'elevision-purge-old-detections',
  '0 3 * * *',                        -- daily at 03:00 UTC
  $$
    delete from public.detections
    where created_at < now() - interval '90 days';
  $$
);


-- =====================================================
-- VERIFY — run these SELECTs after applying the schema
-- to confirm everything is wired up correctly.
-- =====================================================

-- Tables exist
-- select table_name from information_schema.tables
-- where table_schema = 'public'
--   and table_name in ('devices', 'detections');

-- Realtime publication includes both tables
-- select tablename from pg_publication_tables
-- where pubname = 'supabase_realtime';

-- Cron jobs registered
-- select jobname, schedule, command from cron.job
-- where jobname like 'elevision-%';

-- Storage bucket is public
-- select id, name, public from storage.buckets
-- where id = 'detections';


-- =====================================================
-- REGISTERING A DEVICE (run once per physical Pi unit)
-- Replace the values below with your real device info.
-- Generate the key hash in the SQL editor:
--   select encode(digest('YOUR_SECRET_KEY', 'sha256'), 'hex');
-- Then paste the result as api_key_hash below.
-- =====================================================

-- EXAMPLE (uncomment and edit before running):
-- insert into public.devices
--   (device_id, location_name, latitude, longitude, api_key_hash)
-- values
--   (
--     'DEV-HABARANA-001',
--     'Habarana Junction',
--     8.0373,
--     80.7497,
--     'paste_sha256_hex_here'
--   );


-- =====================================================
-- ARCHITECTURE NOTES
-- =====================================================
--
--  Raspberry Pi
--      │  POST /api/device-events
--      │  Headers: x-device-key: <plain key>
--      ▼
--  Next.js API Route (Vercel)
--      │  Hashes key with SHA-256, looks up device row,
--      │  compares hash, then uses SUPABASE_SERVICE_ROLE_KEY
--      │  to insert detections + update device status.
--      │  Service role bypasses RLS entirely.
--      ▼
--  Supabase DB + Storage
--      │  Detection row inserted → published via Realtime
--      │  Image uploaded to storage/detections/<device_id>/
--      ▼
--  Dashboard (browser, anon key)
--      Subscribes to postgres_changes on detections + devices.
--      Receives live INSERT/UPDATE events with no polling.
--
-- =====================================================
-- End of schema
-- =====================================================