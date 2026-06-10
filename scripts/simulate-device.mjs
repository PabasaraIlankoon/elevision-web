#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

const apiUrl = process.env.API_URL || "http://localhost:3000";
const deviceId = process.env.DEVICE_ID || getArg("--device") || "DEV-TEST-001";
const deviceKey = process.env.DEVICE_KEY || getArg("--key") || "";
const imagePath = getArg("--image");
const confidence = Number(
  process.env.CONFIDENCE || getArg("--confidence") || "0.93",
);

if (!deviceKey) {
  console.error("Missing DEVICE_KEY (or --key)");
  process.exit(1);
}

const endpoint = new URL("/api/device-events", apiUrl).toString();

async function post(body) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-device-key": deviceKey,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    console.error("Request failed", res.status, json);
    process.exit(2);
  }

  console.log(JSON.stringify(json, null, 2));
}

let imageBase64 = null;
let imageContentType = null;

if (imagePath) {
  const abs = path.resolve(process.cwd(), imagePath);
  const buf = fs.readFileSync(abs);
  imageBase64 = buf.toString("base64");
  imageContentType = abs.toLowerCase().endsWith(".png")
    ? "image/png"
    : "image/jpeg";
}

// 1) ping
await post({
  event: "ping",
  device_id: deviceId,
  camera_status: "active",
  uptime_percent: 99.9,
});

// 2) detection
await post({
  event: "detection",
  device_id: deviceId,
  confidence,
  status: "active",
  image_base64: imageBase64 || undefined,
  image_content_type: imageContentType || undefined,
});
