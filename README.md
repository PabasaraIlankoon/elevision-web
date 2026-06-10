# Elevision - Elephant Detection Dashboard

This is the admin dashboard for an AI-based railway safety + elephant detection system.

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Supabase setup (Auth + DB + Storage + Realtime)

1. Create a Supabase project.

2. Create the database tables + RLS policies

- Open Supabase Dashboard → SQL Editor
- Run: `supabase/schema.sql`

3. Create a storage bucket for images

- Storage → New bucket → name: `detections`
- Make it **Public** (simplest for the dashboard).

4. Add environment variables

Create `.env.local` (do not commit it) with:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Notes:

- `NEXT_PUBLIC_*` values are used by the browser dashboard.
- `SUPABASE_SERVICE_ROLE_KEY` is used only by server routes (device ingestion). Never expose it to clients.

5. Create a dashboard user

- Authentication → Users → Add user
- Use that email/password in `/login`.

6. Register a device row

The device API authenticates using a device key (sent in `x-device-key`). The DB stores the SHA-256 hash.

Example (Linux/macOS):

```bash
echo -n "MY_DEVICE_KEY" | sha256sum
```

Insert a device (SQL Editor):

```sql
insert into public.devices (device_id, location_name, latitude, longitude, api_key_hash)
values ('DEV-TEST-001', 'Test Zone', 7.8731, 80.7718, '<sha256 hex here>');
```

7. Enable realtime for detections

- Database → Replication
- Ensure `public.detections` is enabled for realtime.

## Simulate a Raspberry Pi (no hardware needed)

Start the dev server, then run:

```bash
DEVICE_ID=DEV-TEST-001 \
DEVICE_KEY=MY_DEVICE_KEY \
node scripts/simulate-device.mjs
```

To include an image:

```bash
DEVICE_ID=DEV-TEST-001 \
DEVICE_KEY=MY_DEVICE_KEY \
node scripts/simulate-device.mjs --image ./path/to/photo.jpg
```

## API (for Raspberry Pi)

POST `/api/device-events`

Headers:

- `x-device-key: <device key>` (or `Authorization: Bearer <device key>`)

Body examples:

Ping:

```json
{
  "event": "ping",
  "device_id": "DEV-TEST-001",
  "camera_status": "active",
  "uptime_percent": 99.5
}
```

Detection:

```json
{
  "event": "detection",
  "device_id": "DEV-TEST-001",
  "confidence": 0.92,
  "image_base64": "...",
  "image_content_type": "image/jpeg"
}
```
