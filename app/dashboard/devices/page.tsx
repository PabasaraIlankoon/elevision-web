"use client";

import { useEffect, useState } from "react";
import { DeviceCard } from "@/components/cards/device-card";
import type { Device } from "@/lib/types";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeDevices } from "@/lib/firebase/devices";

export default function DevicesPage() {
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

    const unsub = subscribeDevices(
      (data) => {
        setDevices(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  return (
    <div className="grid-bg">
      <div className="p-4 md:p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Device Status
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor all detection devices across railway zones
          </p>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!loading && devices.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground lg:col-span-3">
              No devices found in system/devices.
            </div>
          ) : (
            devices.map((device) => (
              <DeviceCard key={device.deviceId} device={device} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
