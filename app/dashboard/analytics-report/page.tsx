"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Clock, TrendingUp, Target, Zap } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import type { Alert } from "@/lib/types";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeAlerts } from "@/lib/firebase/alerts";

export default function AnalyticsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      setError("Firebase is not configured. Add env vars to .env.local.");
      return;
    }

    setLoading(true);
    setError(null);

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const unsub = subscribeAlerts(
      (data) => {
        setAlerts(data.filter((a) => a.timestampMs >= cutoff));
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

  const { dailyData, locationData, confidenceData, stats } = useMemo(() => {
    const now = new Date();

    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    const days = 7;
    const dailyCounts = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date(now);
      dt.setDate(dt.getDate() - i);
      dailyCounts.set(dayKey(dt), 0);
    }

    const locationCounts = new Map<string, number>();
    const hourCounts = new Array(24).fill(0) as number[];
    const hourConfidenceSum = new Array(24).fill(0) as number[];
    const hourConfidenceN = new Array(24).fill(0) as number[];
    let confidenceSum = 0;
    let confidenceN = 0;

    for (const alert of alerts) {
      const t = new Date(alert.timestampMs);
      if (Number.isNaN(t.getTime())) continue;

      const key = dayKey(t);
      if (dailyCounts.has(key)) {
        dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
      }

      const loc = alert.locationName || alert.deviceId;
      locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);

      const hr = t.getHours();
      hourCounts[hr] += 1;
      hourConfidenceSum[hr] += alert.confidence;
      hourConfidenceN[hr] += 1;

      confidenceSum += alert.confidence;
      confidenceN += 1;
    }

    const dailyDataArr = Array.from(dailyCounts.entries()).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    const locationDataArr = Array.from(locationCounts.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const confidenceDataArr = Array.from({ length: 24 }).map((_, hr) => {
      const n = hourConfidenceN[hr] || 0;
      const avg = n ? hourConfidenceSum[hr] / n : 0;
      const label = String(hr).padStart(2, "0") + ":00";
      return { time: label, confidence: avg };
    });

    let peakHour = 0;
    for (let i = 1; i < 24; i++) {
      if (hourCounts[i] > hourCounts[peakHour]) peakHour = i;
    }

    const mostActive = locationDataArr[0]?.location || "N/A";
    const avgConfidence = confidenceN ? confidenceSum / confidenceN : 0;
    const totalDetections = alerts.length;

    return {
      dailyData: dailyDataArr,
      locationData: locationDataArr,
      confidenceData: confidenceDataArr,
      stats: {
        peakHour: String(peakHour).padStart(2, "0") + ":00",
        mostActive,
        avgConfidence,
        totalDetections,
      },
    };
  }, [alerts]);

  // Brand blue as primary, then accent colors from logo palette
  const COLORS = ["#0511F2", "#164773", "#59B5D9", "#F2921D", "#F27127"];

  return (
    <div className="grid-bg">
      <div className="p-4 md:p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detection trends and performance metrics
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Clock}
            label="Peak Detection Hour"
            value={loading ? "…" : stats.peakHour}
            accent
          />
          <StatCard
            icon={TrendingUp}
            label="Most Active Zone"
            value={loading ? "…" : stats.mostActive}
          />
          <StatCard
            icon={Target}
            label="Avg Confidence"
            value={loading ? "…" : Math.round(stats.avgConfidence * 100) + "%"}
            accent
          />
          <StatCard
            icon={Zap}
            label="Total Detections"
            value={loading ? "…" : String(stats.totalDetections)}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Detections Bar Chart */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Daily Detections (7 days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Bar dataKey="count" fill="#0511F2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Location Breakdown Pie Chart */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Detections by Location
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ location, percent }) =>
                    `${location.length > 12 ? location.slice(0, 11) + "…" : location} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {locationData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Timeline */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Avg Detection Confidence by Hour (last 30 days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                interval={3}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                label={{
                  value: "Confidence",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#F3F4F6" }}
                formatter={(value) => {
                  const num = Number(value);
                  return [num === 0 ? "No data" : (num * 100).toFixed(1) + "%", "Confidence"];
                }}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#0511F2"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
