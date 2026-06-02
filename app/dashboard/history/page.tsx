"use client";

import { useState } from "react";
import { Download, Filter } from "lucide-react";
import { mockDetections } from "@/lib/mock-data";
import { AlertCard } from "@/components/cards/alert-card";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const [filteredDetections] = useState(mockDetections);

  return (
    <div className="grid-bg">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detection History</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredDetections.length} detections recorded
            </p>
          </div>
          <Button className="gap-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold">
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
            />
          </div>
          <div className="flex-1">
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
              placeholder="To date"
            />
          </div>
          <button className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Detection List */}
        <div className="space-y-3">
          {filteredDetections.map((detection, index) => (
            <AlertCard key={detection.id} detection={detection} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
