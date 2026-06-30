<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a936f,100:114b5f&height=220&section=header&text=Elevision%20Web&fontSize=55&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Real-time%20Elephant%20Detection%20Dashboard%20for%20Sri%20Lankan%20Railways&descAlignY=58&descSize=17" width="100%" alt="Elevision Web banner"/>

<a href="https://github.com/PabasaraIlankoon/elevision-web">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=2800&pause=900&color=2E9E6B&center=true&vCenter=true&width=720&lines=Next.js+operations+dashboard+for+railway+control+rooms+%F0%9F%9A%82;Live+Firestore+alerts+%2B+train+risk+%2B+device+map+%F0%9F%97%BA%EF%B8%8F;Shares+one+Firebase+backend+with+the+Pi+%2B+Flutter+app+%F0%9F%90%98;Public%2C+no+login+required" alt="Typing SVG" />
</a>

<br><br>

[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
![Status](https://img.shields.io/badge/status-deployed%20%26%20active-success?style=flat-square)
![Auth](https://img.shields.io/badge/auth-none%20required-blue?style=flat-square)
![Maintained](https://img.shields.io/badge/maintained-yes-brightgreen?style=flat-square)

</div>

<p align="center">
<b>Elevision Web</b> is a real-time operations dashboard for railway control rooms. It's the web counterpart to the
<a href="https://github.com/PabasaraIlankoon/elevision-app">Elevision Flutter mobile app</a> and the Raspberry Pi
detection nodes - all three share a single Firebase project, so an elephant detected in the field appears on this
dashboard within seconds, with zero login required.
</p>

<div align="center">

[Overview](#-overview) • [Features](#-features) • [Architecture](#-system-architecture) • [Screenshots](#-dashboard-screens) • [Setup](#-getting-started) • [Tech Stack](#%EF%B8%8F-tech-stack)

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%">

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Dashboard Screens](#-dashboard-screens)
- [Data Model](#-data-model)
- [Getting Started](#-getting-started)
- [Firestore Rules & Deployment](#-firestore-rules--deployment)
- [Train Schedule Data](#-train-schedule-data)
- [Project Structure](#-project-structure)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Deployment](#-deployment)
- [Related Repositories](#-related-repositories)

## 🌟 Overview

Elevision Web gives railway control room staff a real-time, publicly viewable window into the Elevision elephant
detection network. The moment a Raspberry Pi node in the field confirms a detection, it's written straight to
Firestore - and this dashboard, the mobile app, and every other connected screen update live, with no polling and
no manual refresh.

> **Why a web dashboard too?** Control rooms run on shared screens, not personal phones. Elevision Web is built to
> sit on a wall-mounted monitor - large hero alerts, a live device map, and zero login friction.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%">

## ✨ Features

### 🚨 Live Dashboard
- Active alert hero card - image, location, device ID, confidence score
- One-tap **Acknowledge** to mark an alert as seen
- Real-time Firestore subscription, no page refresh needed

### 📜 Alert History
- Full feed of past detections
- Date-range filtering
- CSV export for record-keeping and reporting

### 🔍 Alert Detail
- Detection image with confidence breakdown
- Device, location, and GPS coordinates
- Embedded map of the alert location
- Live train risk assessment for that location
- Mark as reviewed / download image

### 🗺️ Map
- Sri Lanka railway zone map (Leaflet + OpenStreetMap)
- All device locations plotted with live status
- Active alerts highlighted on the map in real time

### 🛰️ Devices
- Online / offline status per detection node
- Coordinates and last-seen state for every Pi unit

### 🚂 Train Schedule
- High-risk train schedules near the elephant corridor
- Live "approaching" risk assessment, same engine as the mobile app

### 📊 Analytics
- Detection trends over time
- Confidence distribution statistics
- Top-detecting devices leaderboard

> **No authentication required** - this dashboard is intentionally public-read, designed for operations visibility rather than restricted access.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%">

## 🏗 System Architecture

```mermaid
flowchart LR
    subgraph EDGE["🌐 EDGE LAYER"]
        direction TB
        PI(["Raspberry Pi Nodes"])
        ADMIN["firebase-admin<br/>direct write"]
        PI --> ADMIN
    end

    subgraph CLOUD["☁️ FIREBASE — elevision-606a9"]
        direction TB
        FIRESTORE[("Firestore<br/>alerts / system")]
        STORAGE[("Firebase Storage<br/>Alert Images")]
        RULES["firestore.rules<br/>public read · scoped write"]
    end

    subgraph CLIENTS["💻 CLIENT LAYER"]
        direction TB
        WEB["Elevision Web<br/>Next.js Dashboard"]
        MOBILE["Elevision App<br/>Flutter"]
    end

    ADMIN -- "writes alerts" --> FIRESTORE
    ADMIN -- "uploads image" --> STORAGE
    FIRESTORE --- RULES
    FIRESTORE -- "real-time read" --> WEB
    FIRESTORE -- "real-time read" --> MOBILE
    STORAGE -- "image URL" --> WEB
    STORAGE -- "image URL" --> MOBILE
    WEB -- "write: status field only" --> FIRESTORE

    classDef edge fill:#1a936f,stroke:#114b5f,color:#fff,stroke-width:2px
    classDef cloud fill:#3a86ff,stroke:#1b4965,color:#fff,stroke-width:2px
    classDef client fill:#ff6b35,stroke:#c1121f,color:#fff,stroke-width:2px
    classDef rules fill:#ffd60a,stroke:#997404,color:#000,stroke-width:2px

    class PI,ADMIN edge
    class FIRESTORE,STORAGE cloud
    class WEB,MOBILE client
    class RULES rules
```

### 🔄 Live Alert Flow

```mermaid
flowchart TD
    A["🐘 Pi node confirms detection"] --> B[("🗄️ firebase-admin writes<br/>alerts/{id} to Firestore")]
    B --> C["📡 onSnapshot listener fires<br/>in Next.js dashboard"]
    C --> D["🚨 Hero alert card updates<br/>— no refresh needed"]
    B --> E["📡 Firestore listener fires<br/>in Flutter app"]
    E --> F["📲 Mobile push + dashboard update"]
    D --> G{"Operator clicks<br/>Acknowledge?"}
    G -- "Yes" --> H["✍️ Web writes status: 'seen'<br/>back to Firestore"]
    H --> I["🔄 All connected clients<br/>sync instantly"]
    G -- "Not yet" --> J["🟡 Alert stays active<br/>on hero card"]

    classDef detect fill:#1a936f,stroke:#114b5f,color:#fff,stroke-width:2px
    classDef cloud fill:#3a86ff,stroke:#1b4965,color:#fff,stroke-width:2px
    classDef web fill:#ff6b35,stroke:#c1121f,color:#fff,stroke-width:2px
    classDef decision fill:#ffd60a,stroke:#997404,color:#000,stroke-width:2px
    classDef done fill:#2ec4b6,stroke:#0b6e4f,color:#fff,stroke-width:2px

    class A detect
    class B,H cloud
    class C,D,E,F,I web
    class G decision
    class J done
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%">

## 📸 Dashboard Screens

<div align="center">

<table>
<tr>
<td align="center" width="25%">
<img src="public/dashboard-web.jpeg" width="220"><br>
<sub><b>Dashboard</b><br>Active alert hero, stats & quick actions</sub>
</td>
<td align="center" width="25%">
<img src="public/alert-web.jpeg" width="220"><br>
<sub><b>Alert History</b><br>Filterable feed with CSV export</sub>
</td>
<td align="center" width="25%">
<img src="public/alert-detail-web.jpeg" width="220"><br>
<sub><b>Alert Detail</b><br>Confidence, GPS, map & train risk</sub>
</td>
<td align="center" width="25%">
<img src="public/map-web.jpeg" width="220"><br>
<sub><b>Railway Zone Map</b><br>Live device & alert locations</sub>
</td>
</tr>
</table>

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%">

## 🗄 Data Model

The web dashboard reads from the **same Firestore database** as the Pi nodes and Flutter app — no separate backend.

```mermaid
flowchart LR
    PROJECT[("🔥 elevision-606a9<br/>project")]

    subgraph ALERTS["📂 alerts/{alertId}"]
        A1["timestampMs"]
        A2["imageUrl"]
        A3["confidence"]
        A4["deviceId"]
        A5["locationName"]
        A6["latitude / longitude"]
        A7["status: 'new' | 'seen'"]
    end

    subgraph DEVICES["📂 system/devices"]
        D1["{deviceId}_lat"]
        D2["{deviceId}_lng"]
        D3["{deviceId}_name"]
        D4["{deviceId}_status"]
    end

    PROJECT --> ALERTS
    PROJECT --> DEVICES

    classDef project fill:#114b5f,stroke:#0a2533,color:#fff,stroke-width:2px
    classDef alertsC fill:#e63946,stroke:#9d0208,color:#fff,stroke-width:2px
    classDef devicesC fill:#3a86ff,stroke:#1b4965,color:#fff,stroke-width:2px

    class PROJECT project
    class A1,A2,A3,A4,A5,A6,A7 alertsC
    class D1,D2,D3,D4 devicesC
```

| Collection / Document | Purpose |
|---|---|
| `alerts/{alertId}` | Each detection event: `timestampMs`, `imageUrl`, `confidence`, `deviceId`, `locationName`, `latitude`, `longitude`, `status` (`new` \| `seen`) |
| `system/devices` | Single flattened doc with `{deviceId}_lat`, `{deviceId}_lng`, `{deviceId}_name`, `{deviceId}_status` keys for every registered device |

Detection nodes (Raspberry Pi) write directly to Firestore via `firebase-admin`. The web app only **reads** `alerts`
and `system/devices`, and **writes** the `status` field on alerts (for Acknowledge / Mark as Reviewed).

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%">

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Copy the example env file:

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Firebase web app config from **Firebase Console → Project Settings → Your apps → Web app** (project `elevision-606a9`):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=elevision-606a9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=elevision-606a9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=elevision-606a9.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=863719577998
NEXT_PUBLIC_FIREBASE_APP_ID=your-web-app-id
```

> If you haven't registered a web app yet: **Firebase Console → Project Settings → "Your apps" → Add app → Web** → give it a nickname (e.g. *"Elevision Web Dashboard"*) → copy the generated config values above.

> ⚠️ **Important:** all variables must be prefixed with `NEXT_PUBLIC_`, and the dev server must be **fully restarted** (not hot-reloaded) after changing `.env.local`.

### 3. Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000**.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%">

## 🔐 Firestore Rules & Deployment

Rules live in `firestore.rules` and allow public read of alerts/device status, with writes restricted to toggling
an alert's `status`:

```bash
firebase login
firebase use elevision-606a9
firebase deploy --only firestore:rules
```

## 🚂 Train Schedule Data

High-risk train schedules near Gal Oya Junction are defined in `lib/trains/schedule.ts`, ported from the Flutter
app's train model.

```mermaid
flowchart LR
    SCHEDULE["📄 lib/trains/schedule.ts<br/>static schedule data"] --> ENGINE["⚙️ Risk Engine"]
    ALERT["🚨 Active alert location"] --> ENGINE
    NOW["🕐 Current time"] --> ENGINE
    ENGINE --> RESULT["🔴 Train risk badge<br/>shown on Alert Detail page"]

    classDef data fill:#3a86ff,stroke:#1b4965,color:#fff,stroke-width:2px
    classDef engine fill:#1a936f,stroke:#114b5f,color:#fff,stroke-width:2px
    classDef result fill:#e63946,stroke:#9d0208,color:#fff,stroke-width:2px

    class SCHEDULE,ALERT,NOW data
    class ENGINE engine
    class RESULT result
```

> Update `lib/trains/schedule.ts` directly if train schedules change — no Firestore collection is involved.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%">

## 📁 Project Structure

```
elevision-web/
│
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                 ← Main dashboard (active alert + stats)
│   │   ├── history/                 ← Alert history + CSV export
│   │   ├── alerts/[id]/             ← Alert detail page
│   │   ├── map/                     ← Device map
│   │   ├── devices/                 ← Device status grid
│   │   ├── trains/                  ← Train schedule
│   │   └── analytics-report/        ← Analytics charts
│
├── components/
│   ├── cards/                       ← Alert / device / stat cards
│   ├── badges/                      ← Confidence / device status badges
│   ├── dashboard/                   ← Sidebar, topbar, map
│   └── branding/                    ← Logo
│
├── lib/
│   ├── firebase/                    ← Firestore config + subscriptions
│   ├── trains/                      ← Train schedule data + helpers
│   └── types.ts                     ← Shared TypeScript types
│
├── public/
│   ├── dashboard-web.jpeg           ← README screenshot
│   ├── alert-web.jpeg               ← README screenshot
│   ├── alert-detail-web.jpeg        ← README screenshot
│   └── map-web.jpeg                 ← README screenshot
│
├── firestore.rules
├── firebase.json
├── .env.example
└── README.md
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%">

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Database | Firebase Firestore — real-time data (alerts, device status) |
| Styling | Tailwind CSS |
| Maps | react-leaflet + OpenStreetMap |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | lucide-react |
| Hosting | Vercel / Firebase Hosting / any Node host |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%">

## ☁️ Deployment

This is a standard Next.js app — deploy to **Vercel**, **Firebase Hosting** (with Cloud Functions for SSR), or any
Node host. Set the same `NEXT_PUBLIC_FIREBASE_*` environment variables in your hosting provider's dashboard.

```mermaid
flowchart LR
    REPO["📦 GitHub Repo"] --> BUILD["⚙️ npm run build"]
    BUILD --> ENV["🔑 NEXT_PUBLIC_FIREBASE_* env vars"]
    ENV --> DEPLOY{"Deploy Target"}
    DEPLOY -- "Vercel" --> V["▲ Vercel Edge"]
    DEPLOY -- "Firebase" --> F["🔥 Firebase Hosting + SSR"]
    DEPLOY -- "Other" --> N["🖥️ Any Node Host"]

    classDef repo fill:#114b5f,stroke:#0a2533,color:#fff,stroke-width:2px
    classDef build fill:#3a86ff,stroke:#1b4965,color:#fff,stroke-width:2px
    classDef target fill:#1a936f,stroke:#114b5f,color:#fff,stroke-width:2px
    classDef decision fill:#ffd60a,stroke:#997404,color:#000,stroke-width:2px

    class REPO repo
    class BUILD,ENV build
    class DEPLOY decision
    class V,F,N target
```

## 🔗 Related Repositories

| Repo | Description |
|---|---|
| [elevision-app](https://github.com/PabasaraIlankoon/elevision-app) | Flutter mobile app + Raspberry Pi detection pipeline |
| **elevision-web** *(this repo)* | Next.js operations dashboard |

## 📄 License

MIT License — Copyright (c) 2026 Elevision Team

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so.

<div align="center">

### 🐘 "Every elephant saved is a victory for conservation" 🐘

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:114b5f,100:1a936f&height=120&section=footer" width="100%"/>

<sub>Built with 🐘 by the <b>Elevision Team</b></sub>

</div>
