"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Radio, Clock, TrendingUp } from "lucide-react";
import { EmergencyBanner } from "@/components/dashboard/emergency-banner";
import { StatCard } from "@/components/cards/stat-card";
import { AlertCard } from "@/components/cards/alert-card";
import type { Detection, Device } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function DashboardPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
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
        { data: detectionsData, error: detectionsError },
        { data: devicesData, error: devicesError },
      ] = await Promise.all([
        supabase
          .from("detections")
          .select(
            "id, device_id, location_name, latitude, longitude, animal, confidence, detection_time, image_url, status",
          )
          .order("detection_time", { ascending: false })
          .limit(25),
        supabase
          .from("devices")
          .select(
            "device_id, location_name, latitude, longitude, status, last_ping, camera_status, uptime_percent",
          )
          .order("device_id", { ascending: true }),
      ]);

      if (isCancelled) return;

      if (detectionsError || devicesError) {
        setError(
          detectionsError?.message ||
            devicesError?.message ||
            "Failed to load data",
        );
        setDetections([]);
        setDevices([]);
      } else {
        setDetections((detectionsData as Detection[]) || []);
        setDevices((devicesData as Device[]) || []);
      }

      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("dashboard-detections")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "detections" },
        (payload) => {
          const inserted = payload.new as Detection;
          setDetections((prev) => [inserted, ...prev].slice(0, 25));
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

  const activeCount = useMemo(
    () => detections.filter((d) => d.status === "active").length,
    [detections],
  );

  const todayCount = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    return detections.filter((det) => {
      const dt = new Date(det.detection_time);
      return (
        dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d
      );
    }).length;
  }, [detections]);

  const onlineDevices = useMemo(
    () => devices.filter((dev) => dev.status === "online").length,
    [devices],
  );

  const lastDetectionTime = useMemo(() => {
    const first = detections[0]?.detection_time;
    if (!first) return "N/A";
    const dt = new Date(first);
    return Number.isNaN(dt.getTime())
      ? "N/A"
      : dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [detections]);

  return (
    <div className="grid-bg">
      <EmergencyBanner activeDetections={activeCount} />

      <div className="p-4 md:p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={AlertCircle}
            label="Total Detections Today"
            value={loading ? "…" : todayCount}
            accent
          />
          <StatCard
            icon={TrendingUp}
            label="Active Alerts"
            value={loading ? "…" : activeCount}
            accent={activeCount > 0}
          />
          <StatCard
            icon={Radio}
            label="Devices Online"
            value={loading ? "…" : `${onlineDevices}/${devices.length || 0}`}
          />
          <StatCard
            icon={Clock}
            label="Last Detection"
            value={loading ? "…" : lastDetectionTime}
          />
        </div>

        {/* Alert Feed */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Detections
          </h2>
          <div className="space-y-3">
            {!loading && detections.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                No detections yet.
              </div>
            ) : (
              detections.map((detection, index) => (
                <AlertCard
                  key={detection.id}
                  detection={detection}
                  index={index}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
