"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  Fingerprint,
  MapPin,
  Crosshair,
  Cpu,
  Download,
  Check,
  TrainFront,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/badges/confidence-badge";
import type { Alert } from "@/lib/types";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeAlerts, markAlertSeen } from "@/lib/firebase/alerts";
import {
  getApproachingTrains,
  RISK_COLORS,
  RISK_LABELS,
} from "@/lib/trains/schedule";

function confidenceExplanation(confidence: number): string {
  if (confidence >= 0.9) return "High confidence. Likely a real threat.";
  if (confidence >= 0.7)
    return "Moderate confidence. Review the image to confirm.";
  return "Low confidence. May be a false positive — review carefully.";
}

export default function AlertDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      setError("Firebase is not configured. Add env vars to .env.local.");
      return;
    }

    const unsub = subscribeAlerts(
      (data) => {
        setAlerts(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      500,
    );

    return () => unsub();
  }, []);

  const alert = useMemo(
    () => alerts.find((a) => a.id === params.id),
    [alerts, params.id],
  );

  const time = alert?.timestampMs
    ? new Date(alert.timestampMs).toLocaleString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Unknown time";

  const approachingTrains = useMemo(() => {
    if (!alert) return [];
    return getApproachingTrains(alert.locationName, 60);
  }, [alert]);

  const handleMarkReviewed = async () => {
    if (!alert) return;
    setMarking(true);
    try {
      await markAlertSeen(alert.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update alert");
    } finally {
      setMarking(false);
    }
  };

  const handleDownload = () => {
    if (!alert?.imageUrl) return;
    const a = document.createElement("a");
    a.href = alert.imageUrl;
    a.download = `${alert.id}.jpg`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="grid-bg">
      <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !alert && !error && (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Alert not found. It may have rolled off the recent list.
          </div>
        )}

        {loading && (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading alert…
          </div>
        )}

        {alert && (
          <>
            {/* Image */}
            <div className="rounded-lg overflow-hidden border border-border bg-card aspect-video">
              {alert.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={alert.imageUrl}
                  alt="Detection"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src="/placeholder.png" alt="No detection image" className="w-full h-full object-cover opacity-60" />
              )}
            </div>

            {/* Elephant Alert banner */}
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-400">
                  Elephant Alert
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                  Elephant Detected
                </p>
              </div>
            </div>

            {/* Detection Details */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Detection Details
              </h2>
              <div className="space-y-2">
                <DetailRow icon={Clock} label="Detected at" value={time} />
                <DetailRow
                  icon={Fingerprint}
                  label="Confidence Score"
                  value={`${Math.round(alert.confidence * 100)}%`}
                  valueClassName={
                    alert.confidence >= 0.9
                      ? "text-red-400"
                      : alert.confidence >= 0.7
                        ? "text-amber-400"
                        : "text-muted-foreground"
                  }
                />
                <DetailRow
                  icon={Cpu}
                  label="Device ID"
                  value={alert.deviceId}
                />
                <DetailRow
                  icon={MapPin}
                  label="Location"
                  value={alert.locationName ?? "Unknown location"}
                />
                <DetailRow
                  icon={Crosshair}
                  label="Coordinates"
                  value={
                    alert.latitude != null && alert.longitude != null
                      ? `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`
                      : "N/A"
                  }
                />
                <DetailRow
                  icon={Fingerprint}
                  label="Alert ID"
                  value={alert.id}
                />
              </div>
            </div>

            {/* Detection Location map */}
            {alert.latitude != null && alert.longitude != null && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Detection Location
                </h2>
                <div className="rounded-lg overflow-hidden border border-border h-64">
                  <iframe
                    title="Detection location map"
                    className="w-full h-full"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      alert.longitude - 0.03
                    }%2C${alert.latitude - 0.02}%2C${
                      alert.longitude + 0.03
                    }%2C${alert.latitude + 0.02}&layer=mapnik&marker=${
                      alert.latitude
                    }%2C${alert.longitude}`}
                  />
                </div>
              </div>
            )}

            {/* Train Risk Assessment */}
            <div className="rounded-lg border border-orange-400/30 bg-orange-400/10 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <TrainFront className="w-4 h-4 text-orange-400" />
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  Train Risk Assessment
                </p>
              </div>
              {approachingTrains.length === 0 ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  No trains approaching this location within 1 hour.
                </p>
              ) : (
                <div className="space-y-2">
                  {approachingTrains.map(({ train, minutesAway }) => (
                    <div
                      key={train.trainNumber}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-foreground">
                        Train {train.trainNumber} · {train.trainName}{" "}
                        <span className="text-muted-foreground">
                          ({train.direction})
                        </span>{" "}
                        —{" "}
                        {minutesAway >= 0
                          ? `arriving in ~${minutesAway} min`
                          : `passed ~${Math.abs(minutesAway)} min ago`}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ml-2"
                        style={{
                          backgroundColor: `${RISK_COLORS[train.riskLevel]}26`,
                          color: RISK_COLORS[train.riskLevel],
                        }}
                      >
                        {RISK_LABELS[train.riskLevel]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confidence explanation */}
            <div className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-4 py-3 flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <p className="text-sm text-sky-800 dark:text-sky-200 font-medium">
                <span className="font-semibold">
                  {Math.round(alert.confidence * 100)}%
                </span>{" "}
                - {confidenceExplanation(alert.confidence)}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pb-6">
              <Button
                onClick={handleMarkReviewed}
                disabled={marking || alert.status === "seen"}
                className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                <Check className="w-4 h-4" />
                {alert.status === "seen" ? "Reviewed" : "Mark as Reviewed"}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!alert.imageUrl}
                variant="outline"
                className="w-full gap-2 border-amber-400/40 text-amber-400 hover:bg-amber-400/10"
              >
                <Download className="w-4 h-4" />
                Download Image
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface DetailRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClassName?: string;
}

function DetailRow({ icon: Icon, label, value, valueClassName }: DetailRowProps) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
      <Icon className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-semibold text-foreground truncate ${valueClassName ?? ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
