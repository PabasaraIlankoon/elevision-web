"use client";

import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { Alert, Device } from "@/lib/types";

function MapFocus({ device }: { device: Device | null }) {
  const map = useMap();

  useEffect(() => {
    if (!device) return;
    map.setView(
      [device.latitude, device.longitude],
      Math.max(map.getZoom(), 11),
      {
        animate: true,
      },
    );
  }, [device, map]);

  return null;
}

interface DeviceMapProps {
  devices: Device[];
  alerts: Alert[];
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
}

export function DeviceMap({
  devices,
  alerts,
  selectedDeviceId,
  onSelectDevice,
}: DeviceMapProps) {
  const activeDeviceIds = useMemo(() => {
    const set = new Set<string>();
    for (const a of alerts) {
      if (a.status === "new") set.add(a.deviceId);
    }
    return set;
  }, [alerts]);

  const selectedDevice = useMemo(
    () => devices.find((d) => d.deviceId === selectedDeviceId) || null,
    [devices, selectedDeviceId],
  );

  // Center roughly on Sri Lanka by default.
  const defaultCenter: [number, number] = [7.8731, 80.7718];

  return (
    <div className="h-full w-full">
      <MapContainer
        center={
          selectedDevice
            ? [selectedDevice.latitude, selectedDevice.longitude]
            : defaultCenter
        }
        zoom={selectedDevice ? 11 : 8}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFocus device={selectedDevice} />

        {devices.map((device) => {
          const isActive = activeDeviceIds.has(device.deviceId);
          const isSelected = device.deviceId === selectedDeviceId;

          const color = isActive ? "#ef4444" : "#FF8C00";
          const fill = isActive ? "#ef4444" : "#FF8C00";

          return (
            <CircleMarker
              key={device.deviceId}
              center={[device.latitude, device.longitude]}
              radius={isSelected ? 12 : 9}
              pathOptions={{
                color,
                fillColor: fill,
                fillOpacity: isActive ? 0.4 : 0.25,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelectDevice(device.deviceId),
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="text-xs font-mono">{device.deviceId}</div>
                  <div className="text-sm font-semibold">{device.name}</div>
                  <div className="text-xs">
                    {device.latitude.toFixed(5)}, {device.longitude.toFixed(5)}
                  </div>
                  {isActive ? (
                    <div className="text-xs text-red-600">Active alert</div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      No active alert
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
