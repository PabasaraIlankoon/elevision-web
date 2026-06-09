-- =====================================================
-- EleVision - Elephant Detection System
-- Supabase Database Schema
-- =====================================================

create extension if not exists pgcrypto;

-- =====================================================
-- DEVICES
-- =====================================================

create table if not exists public.devices (
id uuid primary key default gen_random_uuid(),

device_id text not null unique,

location_name text not null,

latitude double precision not null,
longitude double precision not null,

status text not null default 'offline'
check (status in ('online', 'offline')),

last_ping timestamptz,

camera_status text not null default 'active'
check (camera_status in ('active', 'inactive')),

uptime_percent real not null default 0
check (uptime_percent >= 0 and uptime_percent <= 100),

api_key_hash text not null,

created_at timestamptz not null default now()
);

-- =====================================================
-- DETECTIONS / EVENTS
-- =====================================================

create table if not exists public.detections (
id uuid primary key default gen_random_uuid(),

device_id text not null
references public.devices(device_id)
on delete cascade,

location_name text,

latitude double precision,
longitude double precision,

animal text not null default 'elephant',

confidence real not null
check (confidence >= 0 and confidence <= 1),

detection_time timestamptz not null default now(),

image_url text,

status text not null default 'active'
check (status in ('active', 'resolved')),

created_at timestamptz not null default now()
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

-- Additional indexes from dashboard requirements

create index if not exists idx_detections_time
on public.detections(detection_time desc);

create index if not exists idx_detections_device
on public.detections(device_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.devices enable row level security;
alter table public.detections enable row level security;

-- =====================================================
-- AUTHENTICATED USER POLICIES
-- =====================================================

drop policy if exists "devices_read_authenticated"
on public.devices;

create policy "devices_read_authenticated"
on public.devices
for select
to authenticated
using (true);

---

drop policy if exists "detections_read_authenticated"
on public.detections;

create policy "detections_read_authenticated"
on public.detections
for select
to authenticated
using (true);

---

drop policy if exists "detections_update_authenticated"
on public.detections;

create policy "detections_update_authenticated"
on public.detections
for update
to authenticated
using (true)
with check (true);

---

drop policy if exists "devices_update_authenticated"
on public.devices;

create policy "devices_update_authenticated"
on public.devices
for update
to authenticated
using (true)
with check (true);

-- =====================================================
-- ANONYMOUS ACCESS POLICIES
-- =====================================================

drop policy if exists "devices_read_anon"
on public.devices;

create policy "devices_read_anon"
on public.devices
for select
to anon
using (true);

---

drop policy if exists "detections_read_anon"
on public.detections;

create policy "detections_read_anon"
on public.detections
for select
to anon
using (true);

---

drop policy if exists "detections_update_anon"
on public.detections;

create policy "detections_update_anon"
on public.detections
for update
to anon
using (true)
with check (true);

-- =====================================================
-- STORAGE BUCKET
-- =====================================================

insert into storage.buckets (id, name)
values ('detections', 'detections')
on conflict (id) do nothing;

drop policy if exists "Public read detections bucket"
on storage.objects;

create policy "Public read detections bucket"
on storage.objects
for select
to public
using (bucket_id = 'detections');

-- =====================================================
-- NOTES
-- =====================================================

-- Service role bypasses RLS automatically.
-- No INSERT/UPDATE policies are required if your backend
-- uses the SUPABASE_SERVICE_ROLE_KEY.
--------------------------------------

## -- Recommended flow:

## -- Raspberry Pi -> Backend API -> Supabase (service role)

## -- Public Dashboard -> anon key -> read detections/devices

-- Detection images stored in Storage bucket: detections
-- Image URLs stored in detections.image_url
--------------------------------------------

-- End of schema
