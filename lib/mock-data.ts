export interface Detection {
  id: string;
  device_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  animal: "elephant";
  confidence: number;
  detection_time: string;
  image_url: string;
  status: "active" | "resolved";
}

export interface Device {
  device_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  status: "online" | "offline";
  last_ping: string;
  camera_status: "active" | "inactive";
  uptime_percent: number;
}

const LOCATIONS = [
  { name: "Gal Oya", lat: 7.5651, lng: 81.4422 },
  { name: "Habarana", lat: 7.7667, lng: 80.8333 },
  { name: "Udawalawe", lat: 6.4167, lng: 80.8167 },
  { name: "Kaudulla", lat: 7.9167, lng: 80.8333 },
  { name: "Minneriya", lat: 7.8833, lng: 80.9833 },
];

export const mockDetections: Detection[] = [
  {
    id: "det-001",
    device_id: "DEV-0847-A",
    location_name: "Gal Oya - Section A",
    latitude: 7.5651,
    longitude: 81.4422,
    animal: "elephant",
    confidence: 0.94,
    detection_time: "2026-06-02 14:35:10",
    image_url: "/placeholder.png",
    status: "active",
  },
  {
    id: "det-002",
    device_id: "DEV-0924-B",
    location_name: "Habarana - North Ridge",
    latitude: 7.7667,
    longitude: 80.8333,
    animal: "elephant",
    confidence: 0.87,
    detection_time: "2026-06-02 13:22:45",
    image_url: "/placeholder.png",
    status: "active",
  },
  {
    id: "det-003",
    device_id: "DEV-0631-C",
    location_name: "Udawalawe - Main Line",
    latitude: 6.4167,
    longitude: 80.8167,
    animal: "elephant",
    confidence: 0.72,
    detection_time: "2026-06-02 12:18:33",
    image_url: "/placeholder.png",
    status: "resolved",
  },
  {
    id: "det-004",
    device_id: "DEV-0156-D",
    location_name: "Kaudulla - Eastern Track",
    latitude: 7.9167,
    longitude: 80.8333,
    animal: "elephant",
    confidence: 0.91,
    detection_time: "2026-06-02 11:05:22",
    image_url: "/placeholder.png",
    status: "resolved",
  },
  {
    id: "det-005",
    device_id: "DEV-0742-E",
    location_name: "Minneriya - Water Junction",
    latitude: 7.8833,
    longitude: 80.9833,
    animal: "elephant",
    confidence: 0.68,
    detection_time: "2026-06-02 09:45:18",
    image_url: "/placeholder.png",
    status: "resolved",
  },
];

export const mockDevices: Device[] = [
  {
    device_id: "DEV-0847-A",
    location_name: "Gal Oya - Section A",
    latitude: 7.5651,
    longitude: 81.4422,
    status: "online",
    last_ping: "2026-06-02 14:35:10",
    camera_status: "active",
    uptime_percent: 99.8,
  },
  {
    device_id: "DEV-0924-B",
    location_name: "Habarana - North Ridge",
    latitude: 7.7667,
    longitude: 80.8333,
    status: "online",
    last_ping: "2026-06-02 14:33:22",
    camera_status: "active",
    uptime_percent: 98.5,
  },
  {
    device_id: "DEV-0631-C",
    location_name: "Udawalawe - Main Line",
    latitude: 6.4167,
    longitude: 80.8167,
    status: "online",
    last_ping: "2026-06-02 14:32:15",
    camera_status: "active",
    uptime_percent: 97.2,
  },
  {
    device_id: "DEV-0156-D",
    location_name: "Kaudulla - Eastern Track",
    latitude: 7.9167,
    longitude: 80.8333,
    status: "offline",
    last_ping: "2026-06-02 13:55:00",
    camera_status: "inactive",
    uptime_percent: 87.3,
  },
  {
    device_id: "DEV-0742-E",
    location_name: "Minneriya - Water Junction",
    latitude: 7.8833,
    longitude: 80.9833,
    status: "online",
    last_ping: "2026-06-02 14:34:08",
    camera_status: "active",
    uptime_percent: 99.1,
  },
  {
    device_id: "DEV-0515-F",
    location_name: "Gal Oya - Section B",
    latitude: 7.5500,
    longitude: 81.4600,
    status: "online",
    last_ping: "2026-06-02 14:30:45",
    camera_status: "active",
    uptime_percent: 96.7,
  },
];

export function getActiveDetectionsCount(): number {
  return mockDetections.filter((d) => d.status === "active").length;
}

export function getTodayDetectionsCount(): number {
  return mockDetections.length;
}

export function getOnlineDevicesCount(): number {
  return mockDevices.filter((d) => d.status === "online").length;
}

export function getLastDetectionTime(): string {
  const sorted = [...mockDetections].sort(
    (a, b) => new Date(b.detection_time).getTime() - new Date(a.detection_time).getTime()
  );
  return sorted[0]?.detection_time || "N/A";
}

export function getDailyDetections(): Array<{ date: string; count: number }> {
  const days = 7;
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      count: Math.floor(Math.random() * 12) + 2,
    });
  }
  return result;
}

export function getDetectionsByLocation(): Array<{ location: string; count: number }> {
  return LOCATIONS.map((loc) => ({
    location: loc.name,
    count: Math.floor(Math.random() * 15) + 3,
  }));
}

export function getConfidenceTimeline(): Array<{ time: string; confidence: number }> {
  const hours = 24;
  const result = [];
  for (let i = 0; i < hours; i++) {
    const hour = String(i).padStart(2, "0");
    result.push({
      time: `${hour}:00`,
      confidence: Math.random() * 0.4 + 0.6,
    });
  }
  return result;
}
