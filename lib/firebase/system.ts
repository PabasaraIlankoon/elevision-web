import { doc, onSnapshot, setDoc, serverTimestamp, Unsubscribe } from "firebase/firestore";
import { db } from "./config";

/** Subscribe to system/status.armed, real-time. */
export function subscribeArmedStatus(
  callback: (armed: boolean) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const ref = doc(db, "system", "status");

  return onSnapshot(
    ref,
    (snapshot) => {
      callback(Boolean(snapshot.data()?.armed));
    },
    (error) => {
      console.error("system status subscription error:", error);
      onError?.(error as Error);
    },
  );
}

/** Arm/disarm the system, mirrors FirestoreService.setArmed in the Flutter app. */
export async function setArmed(armed: boolean): Promise<void> {
  await setDoc(
    doc(db, "system", "status"),
    {
      armed,
      updatedAt: serverTimestamp(),
      updatedBy: "web_dashboard",
    },
    { merge: true },
  );
}
