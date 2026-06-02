"use client";

import { AlertCircle, Radio, Clock, TrendingUp } from "lucide-react";
import {
  mockDetections,
  getActiveDetectionsCount,
  getTodayDetectionsCount,
  getOnlineDevicesCount,
  getLastDetectionTime,
} from "@/lib/mock-data";
import { EmergencyBanner } from "@/components/dashboard/emergency-banner";
import { StatCard } from "@/components/cards/stat-card";
import { AlertCard } from "@/components/cards/alert-card";

export default function DashboardPage() {
  const activeCount = getActiveDetectionsCount();
  const todayCount = getTodayDetectionsCount();
  const onlineDevices = getOnlineDevicesCount();
  const lastDetectionTime = getLastDetectionTime();

  return (
    <div className="grid-bg">
      <EmergencyBanner activeDetections={activeCount} />

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={AlertCircle}
            label="Total Detections Today"
            value={todayCount}
            accent
          />
          <StatCard
            icon={TrendingUp}
            label="Active Alerts"
            value={activeCount}
            accent={activeCount > 0}
          />
          <StatCard
            icon={Radio}
            label="Devices Online"
            value={`${onlineDevices}/6`}
          />
          <StatCard
            icon={Clock}
            label="Last Detection"
            value={lastDetectionTime.split(" ")[1] || "N/A"}
          />
        </div>

        {/* Alert Feed */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Detections</h2>
          <div className="space-y-3">
            {mockDetections.map((detection, index) => (
              <AlertCard key={detection.id} detection={detection} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
