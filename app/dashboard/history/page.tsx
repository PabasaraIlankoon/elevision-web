"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Filter } from "lucide-react";
import { AlertCard } from "@/components/cards/alert-card";
import { Button } from "@/components/ui/button";
import type { Detection } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function HistoryPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [appliedFrom, setAppliedFrom] = useState<string>("");
  const [appliedTo, setAppliedTo] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        setError("Supabase is not configured. Add env vars to .env.local.");
        return;
      }

      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data, error: loadError } = await supabase
        .from("detections")
        .select(
          "id, device_id, location_name, latitude, longitude, animal, confidence, detection_time, image_url, status",
        )
        .order("detection_time", { ascending: false })
        .limit(500);

      if (loadError) {
        setError(loadError.message);
        setDetections([]);
      } else {
        setDetections((data as Detection[]) || []);
      }

      setLoading(false);
    };

    load();
  }, []);

  const filteredDetections = useMemo(() => {
    const from = appliedFrom ? new Date(appliedFrom + "T00:00:00") : null;
    const to = appliedTo ? new Date(appliedTo + "T23:59:59") : null;

    return detections.filter((det) => {
      const t = new Date(det.detection_time);
      if (from && t < from) return false;
      if (to && t > to) return false;
      return true;
    });
  }, [detections, appliedFrom, appliedTo]);

  const exportCsv = () => {
    const headers = [
      "id",
      "device_id",
      "location_name",
      "latitude",
      "longitude",
      "animal",
      "confidence",
      "detection_time",
      "status",
      "image_url",
    ];

    const rows = filteredDetections.map((d) => [
      d.id,
      d.device_id,
      d.location_name ?? "",
      d.latitude ?? "",
      d.longitude ?? "",
      d.animal,
      d.confidence,
      d.detection_time,
      d.status,
      d.image_url ?? "",
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
    a.download = `detections_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid-bg">
      <div className="p-4 md:p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
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
              {filteredDetections.length} detections recorded
            </p>
          </div>
          <Button
            onClick={exportCsv}
            disabled={loading || filteredDetections.length === 0}
            className="gap-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold"
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

        {/* Detection List */}
        <div className="space-y-3">
          {!loading && filteredDetections.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              No detections for the selected range.
            </div>
          ) : (
            filteredDetections.map((detection, index) => (
              <div key={detection.id} id={detection.id}>
                <AlertCard detection={detection} index={index} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
