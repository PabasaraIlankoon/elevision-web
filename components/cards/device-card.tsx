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
            {device.device_id}
          </p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {device.location_name}
          </p>
        </div>
        <DeviceStatusBadge status={device.status} />
      </div>

      <div className="space-y-2 text-xs mb-3">
        <div className="flex justify-between text-muted-foreground">
          <span>Coordinates</span>
          <span className="font-mono text-foreground">
            {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Last Ping</span>
          <span className="font-mono text-foreground">
            {device.last_ping
              ? new Date(device.last_ping).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Never"}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Camera Status</span>
          <span
            className={
              device.camera_status === "active"
                ? "text-emerald-300"
                : "text-gray-400"
            }
          >
            {device.camera_status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Uptime</span>
          <span className="font-mono text-foreground">
            {device.uptime_percent.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="w-full bg-muted rounded h-1">
        <div
          className="bg-amber-400 h-1 rounded transition-all"
          style={{ width: `${device.uptime_percent}%` }}
        />
      </div>
    </div>
  );
}
