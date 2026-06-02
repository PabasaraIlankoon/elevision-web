"use client";

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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Clock, TrendingUp, Target, Zap } from "lucide-react";
import {
  getDailyDetections,
  getDetectionsByLocation,
  getConfidenceTimeline,
} from "@/lib/mock-data";
import { StatCard } from "@/components/cards/stat-card";

export default function AnalyticsPage() {
  const dailyData = getDailyDetections();
  const locationData = getDetectionsByLocation();
  const confidenceData = getConfidenceTimeline();

  const COLORS = ["#F59E0B", "#10B981", "#EF4444", "#3B82F6", "#8B5CF6"];

  return (
    <div className="grid-bg">
      <div className="p-4 md:p-6 space-y-6">
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
            value="18:00"
            accent
          />
          <StatCard
            icon={TrendingUp}
            label="Most Active Zone"
            value="Gal Oya"
          />
          <StatCard
            icon={Target}
            label="Avg Confidence"
            value="84%"
            accent
          />
          <StatCard
            icon={Zap}
            label="Total Detections"
            value="87"
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
                <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
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
                  label={({ location, percent }) => `${location} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {locationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            Detection Confidence Timeline (24h)
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
                label={{ value: "Confidence", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#F3F4F6" }}
                formatter={(value) => [(value * 100).toFixed(1) + "%", "Confidence"]}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#F59E0B"
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
