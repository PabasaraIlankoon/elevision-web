"use client";

import { useEffect, useMemo, useState } from "react";
import { Train, MapPin } from "lucide-react";
import {
  TRAIN_SCHEDULES,
  RISK_COLORS,
  RISK_LABELS,
  getApproachingTrains,
  getAllStations,
  type TrainSchedule,
} from "@/lib/trains/schedule";

function minutesLabel(minutesAway: number): string {
  if (minutesAway < 0) return `Passed ${Math.abs(minutesAway)}m ago`;
  if (minutesAway === 0) return "NOW";
  if (minutesAway < 60) return `In ${minutesAway}m`;
  const h = Math.floor(minutesAway / 60);
  const m = minutesAway % 60;
  return `In ${h}h ${m}m`;
}

export default function TrainSchedulePage() {
  const [now, setNow] = useState(new Date());
  const [selectedStation, setSelectedStation] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const stations = useMemo(() => getAllStations(), []);

  const approaching = useMemo(
    () =>
      selectedStation
        ? getApproachingTrains(selectedStation, 180, now)
        : [],
    [selectedStation, now],
  );

  return (
    <div className="grid-bg">
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Train Schedule
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            High-risk trains through the elephant corridor
          </p>
        </div>

        {/* Station picker */}
        <div className="rounded-lg border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Check trains near a station
          </label>
          <select
            className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
          >
            <option value="">Select a station…</option>
            {stations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {selectedStation && (
            <div className="mt-4 space-y-2">
              {approaching.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No high-risk trains scheduled near {selectedStation} within
                  3 hours.
                </p>
              ) : (
                approaching.map((entry, i) => (
                  <div
                    key={`${entry.train.trainNumber}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold text-white"
                        style={{
                          backgroundColor: RISK_COLORS[entry.train.riskLevel],
                        }}
                      >
                        #{entry.train.trainNumber}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {entry.train.trainName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.train.direction}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        entry.minutesAway < 0
                          ? "text-muted-foreground"
                          : entry.minutesAway <= 30
                            ? "text-red-400"
                            : "text-amber-400"
                      }`}
                    >
                      {minutesLabel(entry.minutesAway)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Full schedule */}
        <div className="space-y-4">
          {TRAIN_SCHEDULES.map((train) => (
            <TrainScheduleCard key={train.trainNumber} train={train} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrainScheduleCard({ train }: { train: TrainSchedule }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: `${RISK_COLORS[train.riskLevel]}20` }}
      >
        <div className="flex items-center gap-3">
          <Train
            className="w-5 h-5"
            style={{ color: RISK_COLORS[train.riskLevel] }}
          />
          <div>
            <p className="text-sm font-bold text-foreground">
              Train {train.trainNumber} · {train.trainName}
            </p>
            <p className="text-xs text-muted-foreground">{train.direction}</p>
          </div>
        </div>
        <span
          className="px-2 py-1 rounded text-xs font-semibold text-white"
          style={{ backgroundColor: RISK_COLORS[train.riskLevel] }}
        >
          {RISK_LABELS[train.riskLevel]}
        </span>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
              <th className="pb-2 pr-4">Station</th>
              <th className="pb-2 pr-4">Arrival</th>
              <th className="pb-2">Departure</th>
            </tr>
          </thead>
          <tbody>
            {train.stops.map((stop) => (
              <tr key={stop.station} className="border-t border-border">
                <td className="py-2 pr-4 text-foreground font-medium">
                  {stop.station}
                </td>
                <td className="py-2 pr-4 font-mono text-muted-foreground">
                  {stop.arrival}
                </td>
                <td className="py-2 font-mono text-muted-foreground">
                  {stop.departure}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
