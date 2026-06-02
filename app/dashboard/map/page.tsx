"use client";

import { useState } from "react";
import { MapPin, Radio } from "lucide-react";
import { mockDevices, mockDetections } from "@/lib/mock-data";
import { DeviceStatusBadge } from "@/components/badges/device-status-badge";

export default function MapPage() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  return (
    <div className="grid-bg h-full">
      <div className="flex h-full">
        {/* Map */}
        <div className="flex-1 relative bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
          {/* SVG Railway Map */}
          <svg
            className="w-full h-full"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Railway track */}
            <line x1="100" y1="300" x2="700" y2="300" stroke="#6B7280" strokeWidth="3" strokeDasharray="10,5" />
            <circle cx="150" cy="300" r="6" fill="#F59E0B" opacity="0.6" />
            <circle cx="250" cy="300" r="6" fill="#10B981" opacity="0.6" />
            <circle cx="350" cy="300" r="6" fill="#10B981" opacity="0.6" />
            <circle cx="500" cy="300" r="6" fill="#F59E0B" opacity="0.6" />
            <circle cx="650" cy="300" r="6" fill="#10B981" opacity="0.6" />
          </svg>

          {/* Device Markers Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {mockDevices.map((device, idx) => {
              const positions = [
                { x: "20%", y: "50%" },
                { x: "35%", y: "50%" },
                { x: "50%", y: "50%" },
                { x: "65%", y: "50%" },
                { x: "80%", y: "50%" },
                { x: "42%", y: "35%" },
              ];
              const pos = positions[idx] || { x: "50%", y: "50%" };
              const detection = mockDetections.find((d) => d.device_id === device.device_id);
              const hasActiveDetection = detection?.status === "active";

              return (
                <button
                  key={device.device_id}
                  onClick={() => setSelectedDevice(device.device_id)}
                  className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: pos.x, top: pos.y }}
                >
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      hasActiveDetection
                        ? "border-red-500 bg-red-500/20 pulse-glow"
                        : "border-amber-400 bg-amber-400/10"
                    }`}
                  >
                    <Radio className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 border border-border rounded-lg px-2 py-1 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {device.device_id}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 border-l border-border bg-card overflow-y-auto">
          <div className="p-4 border-b border-border sticky top-0 bg-card z-10">
            <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Devices
            </h2>
          </div>

          <div className="divide-y divide-border">
            {mockDevices.map((device) => {
              const detection = mockDetections.find((d) => d.device_id === device.device_id);
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
                    <p className="text-xs font-mono text-muted-foreground">{device.device_id}</p>
                    <DeviceStatusBadge status={device.status} />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{device.location_name}</p>
                  {detection && (
                    <p className="text-xs text-red-400 mt-1">
                      {detection.status === "active" ? "🔴 Active Detection" : "Last: " + detection.detection_time}
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
