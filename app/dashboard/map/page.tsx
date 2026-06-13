"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { DeviceStatusBadge } from "@/components/badges/device-status-badge";
import type { Alert, Device } from "@/lib/types";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeAlerts } from "@/lib/firebase/alerts";
import { subscribeDevices } from "@/lib/firebase/devices";

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
  const [alerts, setAlerts] = useState<Alert[]>([]);
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

  const latestByDevice = useMemo(() => {
    const map = new Map<string, Alert>();
    for (const a of alerts) {
      if (!map.has(a.deviceId)) map.set(a.deviceId, a);
    }
    return map;
  }, [alerts]);

  if (error) {
    return (
      <div className="grid-bg h-full">
        <div className="p-4 md:p-6">
          <h1 className="text-xl font-bold text-foreground mb-4">
            Sri Lanka Railway Zone Map
          </h1>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-bg h-full">
      <div className="flex h-full">
        {/* Map */}
        <div className="flex-1 relative bg-card overflow-hidden">
          <DeviceMap
            devices={devices}
            alerts={alerts}
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
              const alert = latestByDevice.get(device.deviceId);
              const isSelected = selectedDevice === device.deviceId;

              return (
                <button
                  key={device.deviceId}
                  onClick={() => setSelectedDevice(device.deviceId)}
                  className={`w-full text-left p-4 transition-colors ${
                    isSelected
                      ? "bg-amber-400/10 border-l-2 border-amber-400"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-mono text-muted-foreground">
                      {device.deviceId}
                    </p>
                    <DeviceStatusBadge status={device.status} />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {device.name}
                  </p>
                  {alert && (
                    <p className="text-xs text-red-400 mt-1">
                      {alert.status === "new"
                        ? "Active alert"
                        : "Last: " +
                          new Date(alert.timestampMs).toLocaleString()}
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
