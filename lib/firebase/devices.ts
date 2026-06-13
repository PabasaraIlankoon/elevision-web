import { doc, onSnapshot, Unsubscribe, DocumentData } from "firebase/firestore";
import { db } from "./config";
import type { Device, DeviceStatus } from "@/lib/types";

/**
 * The IDP stores devices as a single flattened document:
 *   system/devices
 *     RW-001_lat: number
 *     RW-001_lng: number
 *     RW-001_name: string
 *     RW-001_status: "online" | "offline"
 *
 * This parses that structure into a Device[] by grouping keys by their
 * "{deviceId}_" prefix.
 */
function parseDevicesDoc(data: DocumentData | undefined): Device[] {
  if (!data) return [];

  const deviceIds = new Set<string>();
  for (const key of Object.keys(data)) {
    const match = key.match(/^(.+)_(lat|lng|name|status)$/);
    if (match) deviceIds.add(match[1]);
  }

  const devices: Device[] = [];
  for (const id of deviceIds) {
    const lat = data[`${id}_lat`];
    const lng = data[`${id}_lng`];
    const name = data[`${id}_name`];
    const status = data[`${id}_status`];

    if (typeof lat !== "number" || typeof lng !== "number") continue;

    devices.push({
      deviceId: id,
      name: typeof name === "string" ? name : id,
      latitude: lat,
      longitude: lng,
      status: status === "online" ? "online" : ("offline" as DeviceStatus),
    });
  }

  // Stable order by deviceId
  return devices.sort((a, b) => a.deviceId.localeCompare(b.deviceId));
}

/** Subscribe to the system/devices document, real-time. */
export function subscribeDevices(
  callback: (devices: Device[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const ref = doc(db, "system", "devices");

  return onSnapshot(
    ref,
    (snapshot) => {
      callback(parseDevicesDoc(snapshot.data()));
    },
    (error) => {
      console.error("devices subscription error:", error);
      onError?.(error as Error);
    },
  );
}
