"use client";

import { X, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface EmergencyBannerProps {
  activeDetections: number;
}

export function EmergencyBanner({ activeDetections }: EmergencyBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || activeDetections === 0) return null;

  return (
    <div className="bg-red-500/10 border-b border-red-500/20 px-4 md:px-6 py-3 flex items-center justify-between pulse-glow">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
        <div>
          <p className="text-sm font-semibold text-red-400">Active Detection Alert</p>
          <p className="text-xs text-red-400/70">
            {activeDetections} elephant detection{activeDetections !== 1 ? "s" : ""} require attention
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-red-400" />
      </button>
    </div>
  );
}
