#!/usr/bin/env node
/**
 * Elevision — Multi-Device Simulator
 * ------------------------------------
 * Simulates multiple Raspberry Pi units sending realistic pings and
 * detections to your API. Great for testing before real hardware arrives.
 *
 * Usage:
 *   node simulate-devices.mjs
 *
 * Env vars (or edit DEFAULTS below):
 *   API_URL      – your Vercel / localhost URL
 *   DEVICE_KEY   – the raw key you registered devices with
 *
 * The script will:
 *   1. Register all SIMULATED_DEVICES in Supabase (via your API route)
 *      — skipped if they already exist; you must INSERT them via SQL first
 *      (see the SQL block printed on startup)
 *   2. Send periodic pings from each device
 *   3. Fire random detections at realistic intervals
 *   4. Randomly go "offline" and come back, just like a flaky field device
 *   5. Generate a mix of high/low confidence detections
 *   6. Attach tiny synthetic JPEG thumbnails so image_url fields populate
 */

import { createHash } from "node:crypto";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const API_URL = process.env.API_URL || "http://localhost:3000";
const DEVICE_KEY = process.env.DEVICE_KEY || "MY_SECRET_DEVICE_KEY_001";

// How often each device pings (ms)
const PING_INTERVAL_MS = 15_000;         // 15 s (real Pi: 60 s)
// Roughly how often a detection fires per device (ms range)
const DETECTION_MIN_MS = 20_000;         // 20 s
const DETECTION_MAX_MS = 90_000;         // 90 s
// Chance (0–1) a device "goes offline" between cycles
const OFFLINE_CHANCE = 0.05;
// How long an offline period lasts (ms)
const OFFLINE_DURATION_MS = 30_000;

// ─── SIMULATED DEVICES ───────────────────────────────────────────────────────
// These must also be registered in Supabase with the same device_id and a
// SHA-256 hash of DEVICE_KEY.  The startup message prints the SQL for you.

const SIMULATED_DEVICES = [
  {
    device_id: "SIM-HABARANA-001",
    location_name: "Habarana Junction",
    latitude: 8.0373,
    longitude: 80.7497,
  },
  {
    device_id: "SIM-MINNERIYA-002",
    location_name: "Minneriya Crossing",
    latitude: 8.0259,
    longitude: 80.8994,
  },
  {
    device_id: "SIM-POLONNARUWA-003",
    location_name: "Polonnaruwa North Gate",
    latitude: 7.9403,
    longitude: 81.0188,
  },
  {
    device_id: "SIM-KAUDULLA-004",
    location_name: "Kaudulla Buffer Zone",
    latitude: 8.1667,
    longitude: 80.9000,
  },
  {
    device_id: "SIM-GALNEWA-005",
    location_name: "Galnewa Bend",
    latitude: 8.1100,
    longitude: 80.5400,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function sha256(str) {
  return createHash("sha256").update(str).digest("hex");
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Generate a tiny 1×1 solid-colour JPEG as base64.
 * Real Pi sends a full frame; this just populates the image_url field.
 */
function tinyJpegBase64() {
  // Minimal valid JPEG (1×1 orange pixel)
  const jpegBytes = Buffer.from(
    "ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffc4001f0000010501010101010100000000000000000102030405060708090a0bffda00080101000000003f00faf50000fffd",
    "hex"
  );
  return jpegBytes.toString("base64");
}

async function postEvent(device, body) {
  const url = `${API_URL}/api/device-events`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-device-key": DEVICE_KEY,
      },
      body: JSON.stringify({ device_id: device.device_id, ...body }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`[${device.device_id}] ✗ ${res.status}`, json?.error ?? json);
    }
    return res.ok;
  } catch (e) {
    console.error(`[${device.device_id}] ✗ network error:`, e.message);
    return false;
  }
}

// ─── PER-DEVICE SIMULATION LOOP ──────────────────────────────────────────────

async function runDevice(device) {
  let uptime = rand(90, 100);
  let online = true;

  console.log(`▶  Starting simulation for ${device.device_id} (${device.location_name})`);

  // Stagger startup so all devices don't fire at the same second
  await sleep(randInt(0, 8000));

  async function maybePing() {
    if (!online) return;
    const ok = await postEvent(device, {
      event: "ping",
      camera_status: "active",
      uptime_percent: +(uptime + rand(-0.5, 0.5)).toFixed(1),
    });
    if (ok) process.stdout.write(`[${device.device_id}] 🟢 ping\n`);
  }

  async function maybeDetect() {
    if (!online) return;
    const confidence = +(rand(0.62, 0.99)).toFixed(2);
    const status = Math.random() < 0.4 ? "active" : "resolved";
    const ok = await postEvent(device, {
      event: "detection",
      confidence,
      status,
      image_base64: tinyJpegBase64(),
      image_content_type: "image/jpeg",
    });
    if (ok) {
      console.log(
        `[${device.device_id}] 🐘 detection  conf=${(confidence * 100).toFixed(0)}%  status=${status}`
      );
    }
  }

  // ── Ping loop ──
  (async () => {
    while (true) {
      await maybePing();
      await sleep(PING_INTERVAL_MS);
    }
  })();

  // ── Detection loop ──
  (async () => {
    while (true) {
      const delay = randInt(DETECTION_MIN_MS, DETECTION_MAX_MS);
      await sleep(delay);
      await maybeDetect();
    }
  })();

  // ── Offline simulation ──
  (async () => {
    while (true) {
      await sleep(randInt(60_000, 180_000));
      if (Math.random() < OFFLINE_CHANCE) {
        online = false;
        console.log(`[${device.device_id}] 🔴 went OFFLINE`);
        await sleep(OFFLINE_DURATION_MS);
        online = true;
        console.log(`[${device.device_id}] 🟢 back ONLINE`);
        uptime = Math.max(85, uptime - rand(1, 3));
      }
    }
  })();
}

// ─── STARTUP BANNER ──────────────────────────────────────────────────────────

const keyHash = sha256(DEVICE_KEY);

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           ELEVISION — Multi-Device Simulator                 ║
╚══════════════════════════════════════════════════════════════╝

  API URL   : ${API_URL}
  Devices   : ${SIMULATED_DEVICES.length}
  Key hash  : ${keyHash}

  ⚠  Run the following SQL in Supabase → SQL Editor FIRST
     (skip rows that already exist — the ON CONFLICT handles it):

─────────────────────────────────────────────────────────────────
${SIMULATED_DEVICES.map(
  (d) => `INSERT INTO public.devices (device_id, location_name, latitude, longitude, api_key_hash)
VALUES ('${d.device_id}', '${d.location_name}', ${d.latitude}, ${d.longitude}, '${keyHash}')
ON CONFLICT (device_id) DO NOTHING;`
).join("\n")}
─────────────────────────────────────────────────────────────────

  Press Ctrl-C to stop.

`);

// ─── LAUNCH ALL DEVICES ──────────────────────────────────────────────────────

for (const device of SIMULATED_DEVICES) {
  runDevice(device);
}
