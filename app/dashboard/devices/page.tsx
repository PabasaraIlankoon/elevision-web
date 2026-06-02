"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { DeviceCard } from "@/components/cards/device-card";
import { Button } from "@/components/ui/button";
import type { Device } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setError("Supabase is not configured. Add env vars to .env.local.");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: loadError } = await supabase
      .from("devices")
      .select(
        "device_id, location_name, latitude, longitude, status, last_ping, camera_status, uptime_percent",
      )
      .order("device_id", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setDevices([]);
    } else {
      setDevices((data as Device[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid-bg">
      <div className="p-4 md:p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Device Status
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor all detection devices across railway zones
            </p>
          </div>
          <Button
            onClick={load}
            disabled={loading}
            className="gap-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            {loading ? "Refreshing…" : "Refresh Status"}
          </Button>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!loading && devices.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground lg:col-span-3">
              No devices yet.
            </div>
          ) : (
            devices.map((device) => (
              <DeviceCard key={device.device_id} device={device} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
