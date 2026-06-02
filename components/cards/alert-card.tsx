"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Detection } from "@/lib/types";
import { ConfidenceBadge } from "@/components/badges/confidence-badge";
import { Button } from "@/components/ui/button";

interface AlertCardProps {
  detection: Detection;
  index?: number;
}

export function AlertCard({ detection, index = 0 }: AlertCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-lg border p-4 ${
        detection.status === "active"
          ? "border-red-500/30 bg-red-500/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-md bg-muted flex-shrink-0 overflow-hidden">
          {detection.image_url ? (
            <img
              src={detection.image_url}
              alt="Detection"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-mono text-muted-foreground">
                {detection.device_id}
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">
                {detection.location_name}
              </p>
            </div>
            {detection.status === "active" && (
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono mb-3">
            {detection.detection_time}
          </p>
          <div className="flex items-center justify-between">
            <ConfidenceBadge confidence={detection.confidence} />
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
            >
              <Link href={`/dashboard/history#${detection.id}`}>
                View Details <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
