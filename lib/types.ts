export type DetectionStatus = "active" | "resolved";
export type AnimalType = "elephant";

export interface Detection {
  id: string;
  device_id: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  animal: AnimalType;
  confidence: number;
  detection_time: string;
  image_url: string | null;
  status: DetectionStatus;
}

export type DeviceStatus = "online" | "offline";
export type CameraStatus = "active" | "inactive";

export interface Device {
  device_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  status: DeviceStatus;
  last_ping: string | null;
  camera_status: CameraStatus;
  uptime_percent: number;
}
