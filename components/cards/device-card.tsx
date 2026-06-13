import type { Device } from "@/lib/types";
import { DeviceStatusBadge } from "@/components/badges/device-status-badge";

interface DeviceCardProps {
  device: Device;
}

export function DeviceCard({ device }: DeviceCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-mono text-muted-foreground">
            {device.deviceId}
          </p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {device.name}
          </p>
        </div>
        <DeviceStatusBadge status={device.status} />
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Coordinates</span>
          <span className="font-mono text-foreground">
            {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}
