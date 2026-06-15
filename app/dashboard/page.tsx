"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Radio,
  Clock,
  TrendingUp,
  Check,
  ArrowRight,
} from "lucide-react";
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
  const [acking, setAcking] = useState(false);
  const pinnedHeroId = useRef<string | null>(null);

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
        if (pinnedHeroId.current === null && data.length > 0) {
          pinnedHeroId.current = data[0].id;
        }
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

  const heroAlert = useMemo(() => alerts[0] ?? null, [alerts]);
  const isNew = heroAlert?.status === "new";

  const activeCount = useMemo(
    () => alerts.filter((a) => a.status === "new").length,
    [alerts],
  );

  const todayCount = useMemo(() => {
    const now = new Date();
    return alerts.filter((a) => {
      const dt = new Date(a.timestampMs);
      return (
        dt.getFullYear() === now.getFullYear() &&
        dt.getMonth() === now.getMonth() &&
        dt.getDate() === now.getDate()
      );
    }).length;
  }, [alerts]);

  const onlineDevices = useMemo(
    () => devices.filter((d) => d.status === "online").length,
    [devices],
  );

  const lastDetectionTime = useMemo(() => {
    const ts = alerts[0]?.timestampMs;
    if (!ts) return "N/A";
    const dt = new Date(ts);
    return isNaN(dt.getTime())
      ? "N/A"
      : dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [alerts]);

  const handleAcknowledge = async () => {
    if (!heroAlert || !isNew) return;
    setAcking(true);
    try {
      await markAlertSeen(heroAlert.id);
    } finally {
      setAcking(false);
    }
  };

  return (
    <div className="grid-bg min-h-screen">
      <div className="p-4 md:p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {heroAlert ? (
          // Fixed-height bento row — image on left, right panel on right
          // The whole row is capped at 380px so nothing gets huge
          <div
            className="flex flex-col lg:flex-row gap-4"
            style={{ height: "auto" }}
          >
            {/* LEFT: image — fixed square, capped */}
            <div className="lg:w-1/3 lg:flex-shrink-0">
              <div
                className={`relative rounded-2xl overflow-hidden border-2 ${
                  isNew ? "border-blue-400/60" : "border-border"
                }`}
                style={{ width: "100%", height: 340 }}
              >
                {/* We use absolute positioning inside the aspect-ratio trick,
                    but clamp the container max-height so it can't grow huge */}
                <div className="relative w-full h-full">
                  {heroAlert.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroAlert.imageUrl}
                      alt="Latest detection"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="/placeholder-detection.png"
                      alt="No image"
                      className="w-full h-full object-cover opacity-50"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  {/* Status pill */}
                  <div className="absolute top-3 left-3">
                    {isNew ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-400 text-black text-xs font-bold shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-black/50 animate-pulse" />
                        ACTIVE ALERT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/70 text-xs font-medium">
                        LATEST DETECTION
                      </span>
                    )}
                  </div>

                  {/* Info overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="text-sm font-bold text-white leading-tight drop-shadow">
                      {heroAlert.locationName ?? "Unknown location"}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-white/60 font-mono">
                        {heroAlert.deviceId}
                      </p>
                      <ConfidenceBadge confidence={heroAlert.confidence} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: stats 2×2 + buttons — fills remaining width, same height as image */}
            <div className="flex-1 flex flex-col gap-3">
              {/* 2×2 stat grid — grows to fill */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                <StatTile
                  label="Total Today"
                  value={loading ? "…" : String(todayCount)}
                  icon={
                    <AlertCircle className="w-3.5 h-3.5 text-blue-400/60" />
                  }
                  valueClass="text-blue-400"
                />
                <StatTile
                  label="Active Alerts"
                  value={loading ? "…" : String(activeCount)}
                  icon={
                    <TrendingUp
                      className={`w-3.5 h-3.5 ${activeCount > 0 ? "text-blue-400/60" : "text-muted-foreground"}`}
                    />
                  }
                  valueClass={
                    activeCount > 0 ? "text-blue-400" : "text-foreground"
                  }
                  highlight={activeCount > 0}
                />
                <StatTile
                  label="Devices Online"
                  value={
                    loading ? "…" : `${onlineDevices}/${devices.length || 0}`
                  }
                  icon={<Radio className="w-3.5 h-3.5 text-muted-foreground" />}
                />
                <StatTile
                  label="Last Detection"
                  value={loading ? "…" : lastDetectionTime}
                  icon={<Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                  valueClass="text-foreground tabular-nums"
                  smallValue
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleAcknowledge}
                  disabled={acking || !isNew}
                  className={`w-full gap-2 h-10 font-semibold text-sm ${
                    isNew
                      ? "bg-blue-400 hover:bg-blue-500 text-black"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 pointer-events-none opacity-100"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {isNew ? "Acknowledge" : "Acknowledged"}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full gap-2 h-10 font-medium text-sm"
                >
                  <Link href={`/dashboard/alerts/${heroAlert.id}`}>
                    View Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Alert feed */}
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

// Compact stat tile used inside the bento right panel
function StatTile({
  label,
  value,
  icon,
  valueClass = "text-foreground",
  highlight = false,
  smallValue = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueClass?: string;
  highlight?: boolean;
  smallValue?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 flex flex-col justify-between min-h-0 ${
        highlight ? "border-blue-400/40" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-2">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide leading-tight">
          {label}
        </p>
        {icon}
      </div>
      <p
        className={`font-bold leading-none ${smallValue ? "text-3xl" : "text-4xl"} ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}
