"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Alert } from "@/lib/types";
import { ConfidenceBadge } from "@/components/badges/confidence-badge";
import { Button } from "@/components/ui/button";
import { markAlertSeen } from "@/lib/firebase/alerts";

interface AlertCardProps {
  alert: Alert;
  index?: number;
}

export function AlertCard({ alert, index = 0 }: AlertCardProps) {
  const isNew = alert.status === "new";
  const [acking, setAcking] = useState(false);
  const time = alert.timestampMs
    ? new Date(alert.timestampMs).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown time";

  const handleAcknowledge = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAcking(true);
    try {
      await markAlertSeen(alert.id);
    } finally {
      setAcking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className={`rounded-lg border p-4 ${
        isNew ? "border-amber-400/40 bg-amber-400/5" : "border-border bg-card"
      }`}
    >
      <div className="flex gap-4">
        <div className="w-40 h-40 rounded-md bg-muted shrink-0 overflow-hidden">
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
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-mono text-muted-foreground">
                {alert.deviceId}
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">
                {alert.locationName ?? "Unknown location"}
              </p>
            </div>
            {isNew && (
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono mb-3">
            {time}
          </p>
          <div className="flex items-center justify-between gap-2">
            <ConfidenceBadge confidence={alert.confidence} />
            <div className="flex items-center gap-1">
              {isNew && (
                <Button
                  onClick={handleAcknowledge}
                  disabled={acking}
                  variant="ghost"
                  size="sm"
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Acknowledge
                </Button>
              )}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
              >
                <Link href={`/dashboard/alerts/${alert.id}`}>
                  View Details <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

