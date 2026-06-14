"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Filter } from "lucide-react";
import { AlertCard } from "@/components/cards/alert-card";
import { Button } from "@/components/ui/button";
import type { Alert } from "@/lib/types";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeAlerts } from "@/lib/firebase/alerts";

export default function HistoryPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [appliedFrom, setAppliedFrom] = useState<string>("");
  const [appliedTo, setAppliedTo] = useState<string>("");

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      setError("Firebase is not configured. Add env vars to .env.local.");
      return;
    }

    setLoading(true);
    setError(null);

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

  const filteredAlerts = useMemo(() => {
    const from = appliedFrom ? new Date(appliedFrom + "T00:00:00").getTime() : null;
    const to = appliedTo ? new Date(appliedTo + "T23:59:59").getTime() : null;

    return alerts.filter((a) => {
      if (from && a.timestampMs < from) return false;
      if (to && a.timestampMs > to) return false;
      return true;
    });
  }, [alerts, appliedFrom, appliedTo]);

  const exportCsv = () => {
    const headers = [
      "id",
      "deviceId",
      "locationName",
      "latitude",
      "longitude",
      "confidence",
      "timestampMs",
      "status",
      "imageUrl",
    ];

    const rows = filteredAlerts.map((a) => [
      a.id,
      a.deviceId,
      a.locationName ?? "",
      a.latitude ?? "",
      a.longitude ?? "",
      a.confidence,
      a.timestampMs,
      a.status,
      a.imageUrl ?? "",
    ]);

    const escape = (value: unknown) => {
      const s = String(value ?? "");
      if (/[\n",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map(escape).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alerts_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid-bg">
      <div className="p-4 md:p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Detection History
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredAlerts.length} alerts recorded
            </p>
          </div>
          <Button
            onClick={exportCsv}
            disabled={loading || filteredAlerts.length === 0}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
              placeholder="From date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
              placeholder="To date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setAppliedFrom(fromDate);
              setAppliedTo(toDate);
            }}
            className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          {!loading && filteredAlerts.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              No alerts for the selected range.
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <div key={alert.id} id={alert.id}>
                <AlertCard alert={alert} index={index} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
