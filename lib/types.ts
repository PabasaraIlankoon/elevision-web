export type AlertStatus = "new" | "seen";

export interface Alert {
  id: string;
  timestampMs: number;
  imageUrl: string;
  confidence: number;
  deviceId: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  status: AlertStatus;
}

export type DeviceStatus = "online" | "offline";

export interface Device {
  deviceId: string;
  name: string;
  latitude: number;
  longitude: number;
  status: DeviceStatus;
}

export interface SystemStatus {
  armed: boolean;
  updatedAt?: unknown;
  updatedBy?: string;
}
