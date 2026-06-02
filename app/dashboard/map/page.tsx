"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { DeviceStatusBadge } from "@/components/badges/device-status-badge";
import type { Detection, Device } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const DeviceMap = dynamic(
  () => import("@/components/dashboard/device-map").then((m) => m.DeviceMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);

export default function MapPage() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setError("Supabase is not configured. Add env vars to .env.local.");
      return;
    }

    const supabase = createClient();
    let isCancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const [
        { data: devicesData, error: devicesError },
        { data: detectionsData, error: detectionsError },
      ] = await Promise.all([
        supabase
          .from("devices")
          .select(
            "device_id, location_name, latitude, longitude, status, last_ping, camera_status, uptime_percent",
          )
          .order("device_id", { ascending: true }),
        supabase
          .from("detections")
          .select(
            "id, device_id, location_name, latitude, longitude, animal, confidence, detection_time, image_url, status",
          )
          .order("detection_time", { ascending: false })
          .limit(500),
      ]);

      if (isCancelled) return;

      if (devicesError || detectionsError) {
        setError(
          devicesError?.message ||
            detectionsError?.message ||
            "Failed to load map data",
        );
        setDevices([]);
        setDetections([]);
      } else {
        setDevices((devicesData as Device[]) || []);
        setDetections((detectionsData as Detection[]) || []);
      }

      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("map-detections")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "detections" },
        (payload) => {
          const inserted = payload.new as Detection;
          setDetections((prev) => [inserted, ...prev].slice(0, 500));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "detections" },
        (payload) => {
          const updated = payload.new as Detection;
          setDetections((prev) =>
            prev.map((d) => (d.id === updated.id ? updated : d)),
          );
        },
      )
      .subscribe();

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const latestByDevice = useMemo(() => {
    const map = new Map<string, Detection>();
    for (const det of detections) {
      if (!map.has(det.device_id)) map.set(det.device_id, det);
    }
    return map;
  }, [detections]);

  return (
    <div className="grid-bg h-full">
      <div className="flex h-full">
        {/* Map */}
        <div className="flex-1 relative bg-card overflow-hidden">
          {error && (
            <div className="absolute top-4 left-4 right-4 z-20 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <DeviceMap
            devices={devices}
            detections={detections}
            selectedDeviceId={selectedDevice}
            onSelectDevice={setSelectedDevice}
          />
        </div>

        {/* Sidebar */}
        <div className="w-64 border-l border-border bg-card overflow-y-auto">
          <div className="p-4 border-b border-border sticky top-0 bg-card z-10">
            <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Devices
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {loading
                ? "Loading…"
                : `${devices.length} device${devices.length === 1 ? "" : "s"}`}
            </p>
          </div>

          <div className="divide-y divide-border">
            {devices.map((device) => {
              const detection = latestByDevice.get(device.device_id);
              const isSelected = selectedDevice === device.device_id;

              return (
                <button
                  key={device.device_id}
                  onClick={() => setSelectedDevice(device.device_id)}
                  className={`w-full text-left p-4 transition-colors ${
                    isSelected
                      ? "bg-amber-400/10 border-l-2 border-amber-400"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-mono text-muted-foreground">
                      {device.device_id}
                    </p>
                    <DeviceStatusBadge status={device.status} />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {device.location_name}
                  </p>
                  {detection && (
                    <p className="text-xs text-red-400 mt-1">
                      {detection.status === "active"
                        ? "Active detection"
                        : "Last: " +
                          new Date(detection.detection_time).toLocaleString()}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
