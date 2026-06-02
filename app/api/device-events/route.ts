import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BodySchema = z.object({
  event: z.enum(["ping", "detection"]),
  device_id: z.string().min(1),

  // optional device telemetry
  camera_status: z.enum(["active", "inactive"]).optional(),
  uptime_percent: z.number().min(0).max(100).optional(),

  // detection fields
  confidence: z.number().min(0).max(1).optional(),
  status: z.enum(["active", "resolved"]).optional(),
  detection_time: z.string().datetime().optional(),

  // image upload (optional)
  image_base64: z.string().min(1).optional(),
  image_content_type: z.string().min(1).optional(),
});

function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function POST(request: Request) {
  const deviceKeyHeader = request.headers.get("x-device-key") || "";
  const deviceKeyBearer =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const deviceKey = deviceKeyHeader || deviceKeyBearer;

  if (!deviceKey) {
    return NextResponse.json({ error: "Missing device key" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;
  const supabase = createAdminClient();

  const deviceKeyHash = sha256Hex(deviceKey);

  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select(
      "device_id, location_name, latitude, longitude, api_key_hash, status, last_ping, camera_status, uptime_percent",
    )
    .eq("device_id", body.device_id)
    .maybeSingle();

  if (deviceError) {
    return NextResponse.json({ error: deviceError.message }, { status: 500 });
  }

  if (!device || device.api_key_hash !== deviceKeyHash) {
    return NextResponse.json(
      { error: "Invalid device credentials" },
      { status: 401 },
    );
  }

  const nowIso = new Date().toISOString();

  // Always mark device as online when it talks to us.
  const { error: deviceUpdateError } = await supabase
    .from("devices")
    .update({
      status: "online",
      last_ping: nowIso,
      camera_status: body.camera_status ?? device.camera_status,
      uptime_percent: body.uptime_percent ?? device.uptime_percent,
    })
    .eq("device_id", body.device_id);

  if (deviceUpdateError) {
    return NextResponse.json(
      { error: deviceUpdateError.message },
      { status: 500 },
    );
  }

  if (body.event === "ping") {
    return NextResponse.json({ ok: true });
  }

  // detection
  if (typeof body.confidence !== "number") {
    return NextResponse.json({ error: "Missing confidence" }, { status: 400 });
  }

  let imageUrl: string | null = null;

  if (body.image_base64) {
    const contentType = body.image_content_type || "image/jpeg";
    const base64 = body.image_base64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    const ext = contentType.includes("png") ? "png" : "jpg";
    const fileName = `${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
    const path = `${body.device_id}/${fileName}`;

    const upload = await supabase.storage
      .from("detections")
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

    if (upload.error) {
      return NextResponse.json(
        { error: upload.error.message },
        { status: 500 },
      );
    }

    const { data: publicUrl } = supabase.storage
      .from("detections")
      .getPublicUrl(path);
    imageUrl = publicUrl.publicUrl;
  }

  const detectionTime = body.detection_time || nowIso;

  const { data: detection, error: insertError } = await supabase
    .from("detections")
    .insert({
      device_id: body.device_id,
      location_name: device.location_name,
      latitude: device.latitude,
      longitude: device.longitude,
      animal: "elephant",
      confidence: body.confidence,
      detection_time: detectionTime,
      image_url: imageUrl,
      status: body.status ?? "active",
    })
    .select(
      "id, device_id, location_name, latitude, longitude, animal, confidence, detection_time, image_url, status",
    )
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, detection });
}
