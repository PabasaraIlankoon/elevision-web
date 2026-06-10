"use client";

import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { Detection, Device } from "@/lib/types";

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
  detections: Detection[];
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
}

export function DeviceMap({
  devices,
  detections,
  selectedDeviceId,
  onSelectDevice,
}: DeviceMapProps) {
  const activeDeviceIds = useMemo(() => {
    const set = new Set<string>();
    for (const det of detections) {
      if (det.status === "active") set.add(det.device_id);
    }
    return set;
  }, [detections]);

  const selectedDevice = useMemo(
    () => devices.find((d) => d.device_id === selectedDeviceId) || null,
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
        zoom={selectedDevice ? 11 : 7}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFocus device={selectedDevice} />

        {devices.map((device) => {
          const isActive = activeDeviceIds.has(device.device_id);
          const isSelected = device.device_id === selectedDeviceId;

          const color = isActive ? "#ef4444" : "#f59e0b";
          const fill = isActive ? "#ef4444" : "#f59e0b";

          return (
            <CircleMarker
              key={device.device_id}
              center={[device.latitude, device.longitude]}
              radius={isSelected ? 12 : 9}
              pathOptions={{
                color,
                fillColor: fill,
                fillOpacity: isActive ? 0.4 : 0.25,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelectDevice(device.device_id),
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="text-xs font-mono">{device.device_id}</div>
                  <div className="text-sm font-semibold">
                    {device.location_name}
                  </div>
                  <div className="text-xs">
                    {device.latitude.toFixed(5)}, {device.longitude.toFixed(5)}
                  </div>
                  {isActive ? (
                    <div className="text-xs text-red-600">Active detection</div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      No active detection
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
