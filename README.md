# Elevision — Web Dashboard

Real-time AI-powered elephant detection dashboard for railway safety. This Next.js app is the web counterpart to the Elevision Flutter mobile app and the Raspberry Pi detection nodes, all sharing a single Firebase project.

## Features

- **Live dashboard** — active alert hero with image, location, device ID, confidence, and one-tap acknowledge
- **Alert History** — full feed of past detections with date filtering and CSV export
- **Alert Detail** — detection image, confidence breakdown, device/location/coordinates, embedded map, train risk assessment, mark as reviewed, download image
- **Map** — Sri Lanka railway zone map showing all device locations and active alerts (Leaflet + OpenStreetMap)
- **Devices** — online/offline status and coordinates for every detection node
- **Train Schedule** — high-risk train schedules near the elephant corridor, with live "approaching" risk assessment
- **Analytics** — detection trends, confidence stats, and top-detecting devices

No login/authentication is required — this dashboard is intended as a publicly viewable operations view.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Firebase Firestore](https://firebase.google.com/docs/firestore) — real-time data (alerts, device status)
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [react-leaflet](https://react-leaflet.js.org/) — map
- [Recharts](https://recharts.org/) — analytics charts
- [Framer Motion](https://www.framer.com/motion/) — UI animation
- [lucide-react](https://lucide.dev/) — icons

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Copy the example env file:

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Firebase **web app** config from the [Firebase Console](https://console.firebase.google.com/) → Project Settings → Your apps → Web app (project `elevision-606a9`):

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=elevision-606a9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=elevision-606a9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=elevision-606a9.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=863719577998
NEXT_PUBLIC_FIREBASE_APP_ID=your-web-app-id
```

> If you haven't registered a web app yet: Firebase Console → Project Settings → "Your apps" → **Add app** → Web → give it a nickname (e.g. "Elevision Web Dashboard") → copy the generated config values above.

**Important:** all variables must be prefixed with `NEXT_PUBLIC_` and the dev server must be **fully restarted** (not hot-reloaded) after changing `.env.local`.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data model

The web dashboard reads from the same Firestore database as the Pi nodes and Flutter app:

| Collection / Document | Purpose |
| --- | --- |
| `alerts/{alertId}` | Each detection event: `timestampMs`, `imageUrl`, `confidence`, `deviceId`, `locationName`, `latitude`, `longitude`, `status` (`new` \| `seen`) |
| `system/devices` | Single flattened doc with `{deviceId}_lat`, `{deviceId}_lng`, `{deviceId}_name`, `{deviceId}_status` keys for every registered device |

Detection nodes (Raspberry Pi) write directly to Firestore via `firebase-admin`. The web app only reads `alerts` and `system/devices`, and writes the `status` field on `alerts` (for Acknowledge / Mark as Reviewed).

## Firestore rules & deployment

Rules live in `firestore.rules` and allow public read of alerts/device status, with writes restricted to toggling an alert's `status`:

```bash
firebase login
firebase use elevision-606a9
firebase deploy --only firestore:rules
```

## Train schedule data

High-risk train schedules near Gal Oya Junction are defined in `lib/trains/schedule.ts`, ported from the Flutter app's train model. Update this file if schedules change — no Firestore collection is involved.

## Project structure

```
app/
  dashboard/
    page.tsx              # Main dashboard (active alert + stats)
    history/              # Alert history + CSV export
    alerts/[id]/          # Alert detail page
    map/                   # Device map
    devices/               # Device status grid
    trains/                # Train schedule
    analytics-report/      # Analytics charts
components/
  cards/                   # Alert / device / stat cards
  badges/                  # Confidence / device status badges
  dashboard/               # Sidebar, topbar, map
  branding/                # Logo
lib/
  firebase/                # Firestore config + subscriptions
  trains/                  # Train schedule data + helpers
  types.ts                 # Shared TypeScript types
```

## Deployment

This is a standard Next.js app — deploy to [Vercel](https://vercel.com/), Firebase Hosting (with Cloud Functions for SSR), or any Node host. Set the same `NEXT_PUBLIC_FIREBASE_*` environment variables in your hosting provider's dashboard.