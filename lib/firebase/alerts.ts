import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  Unsubscribe,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import type { Alert, AlertStatus } from "@/lib/types";

function toAlert(docSnap: QueryDocumentSnapshot<DocumentData>): Alert {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    timestampMs: typeof data.timestampMs === "number" ? data.timestampMs : 0,
    imageUrl: data.imageUrl ?? "",
    confidence: typeof data.confidence === "number" ? data.confidence : 0,
    deviceId: data.deviceId ?? "unknown",
    locationName: data.locationName ?? null,
    latitude: typeof data.latitude === "number" ? data.latitude : null,
    longitude: typeof data.longitude === "number" ? data.longitude : null,
    status: (data.status === "seen" ? "seen" : "new") as AlertStatus,
  };
}

/**
 * Subscribe to the latest alerts (most recent 50), real-time.
 * Mirrors the Flutter app's FirestoreService.alertsStream.
 */
export function subscribeAlerts(
  callback: (alerts: Alert[]) => void,
  onError?: (error: Error) => void,
  max = 50,
): Unsubscribe {
  const alertsRef = query(
    collection(db, "alerts"),
    orderBy("timestampMs", "desc"),
    limit(max),
  );

  return onSnapshot(
    alertsRef,
    (snapshot) => {
      const alerts = snapshot.docs.map(toAlert);
      callback(alerts);
    },
    (error) => {
      console.error("alerts subscription error:", error);
      onError?.(error as Error);
    },
  );
}

/** Mark a single alert as seen/acknowledged. */
export async function markAlertSeen(alertId: string): Promise<void> {
  await updateDoc(doc(db, "alerts", alertId), { status: "seen" });
}
