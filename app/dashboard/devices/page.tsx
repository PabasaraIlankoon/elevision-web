"use client";

import { RefreshCw } from "lucide-react";
import { mockDevices } from "@/lib/mock-data";
import { DeviceCard } from "@/components/cards/device-card";
import { Button } from "@/components/ui/button";

export default function DevicesPage() {
  return (
    <div className="grid-bg">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Device Status</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor all detection devices across railway zones
            </p>
          </div>
          <Button className="gap-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold">
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </Button>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockDevices.map((device) => (
            <DeviceCard key={device.device_id} device={device} />
          ))}
        </div>
      </div>
    </div>
  );
}
