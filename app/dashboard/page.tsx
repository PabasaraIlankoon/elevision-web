"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Radio, Clock, TrendingUp, Check, ArrowRight, Activity } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { AlertCard } from "@/components/cards/alert-card";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/badges/confidence-badge";
import type { Alert, Device } from "@/lib/types";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeAlerts, markAlertSeen } from "@/lib/firebase/alerts";
import { subscribeDevices } from "@/lib/firebase/devices";

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      setError("Firebase is not configured. Add env vars to .env.local.");
      return;
    }

    setLoading(true);
    setError(null);

    const unsubAlerts = subscribeAlerts(
      (data) => {
        setAlerts(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    const unsubDevices = subscribeDevices(
      (data) => setDevices(data),
      (err) => setError((prev) => prev ?? err.message),
    );

    return () => {
      unsubAlerts();
      unsubDevices();
    };
  }, []);

  const activeCount = useMemo(
    () => alerts.filter((a) => a.status === "new").length,
    [alerts],
  );

  const todayCount = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    return alerts.filter((a) => {
      const dt = new Date(a.timestampMs);
      return (
        dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d
      );
    }).length;
  }, [alerts]);

  const onlineDevices = useMemo(
    () => devices.filter((dev) => dev.status === "online").length,
    [devices],
  );

  const lastDetectionTime = useMemo(() => {
    const first = alerts[0]?.timestampMs;
    if (!first) return "N/A";
    const dt = new Date(first);
    return Number.isNaN(dt.getTime())
      ? "N/A"
      : dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [alerts]);

  const activeAlert = useMemo(
    () => alerts.find((a) => a.status === "new") ?? null,
    [alerts],
  );

  const [acking, setAcking] = useState(false);
  const handleAcknowledge = async () => {
    if (!activeAlert) return;
    setAcking(true);
    try {
      await markAlertSeen(activeAlert.id);
    } finally {
      setAcking(false);
    }
  };

  return (
    <div className="grid-bg">
      <div className="p-4 md:p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Bento grid: active alert + stats */}
        {activeAlert ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Image — large left tile, spans 2 cols and 2 rows */}
            <div className="lg:col-span-2 lg:row-span-2 rounded-lg border border-blue-600/40 bg-card overflow-hidden relative min-h-70 lg:min-h-90">
              {activeAlert.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeAlert.imageUrl}
                  alt="Active detection"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img src="/placeholder.png" alt="No detection image" className="w-full h-full object-cover opacity-60" />
              )}
              {/* Overlay info */}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  ACTIVE ALERT
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">
                      {activeAlert.locationName ?? "Unknown location"}
                    </p>
                    <p className="text-xs text-white/70 font-mono mt-0.5">
                      ID: {activeAlert.deviceId}
                    </p>
                  </div>
                  <ConfidenceBadge confidence={activeAlert.confidence} />
                </div>
              </div>
            </div>

            {/* Action card */}
            <div className="rounded-lg border border-blue-600/40 bg-card p-4 flex flex-col gap-3 justify-center">
              <Button
                onClick={handleAcknowledge}
                disabled={acking}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                <Check className="w-4 h-4" />
                Acknowledge
              </Button>
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href={`/dashboard/alerts/${activeAlert.id}`}>
                  Details <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Stat cards fill remaining bento cells */}
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
        ) : (
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
        )}

        {/* Alert Feed */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Detections
          </h2>
          <div className="space-y-3">
            {!loading && alerts.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                No alerts yet.
              </div>
            ) : (
              alerts.map((alert, index) => (
                <AlertCard key={alert.id} alert={alert} index={index} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
