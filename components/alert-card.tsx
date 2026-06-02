'use client'

import { AlertTriangle, MapPin, Clock, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface AlertCardProps {
  id: string
  location: string
  timestamp: string
  confidence: number
  elephantCount: number
  severity: 'critical' | 'high' | 'medium'
  distance?: string
}

const severityColors = {
  critical: 'bg-red-900/20 border-red-500/50',
  high: 'bg-yellow-900/20 border-yellow-500/50',
  medium: 'bg-orange-900/20 border-orange-500/50',
}

const severityBadgeColors = {
  critical: 'bg-red-500/20 text-red-300',
  high: 'bg-yellow-500/20 text-yellow-300',
  medium: 'bg-orange-500/20 text-orange-300',
}

export function AlertCard({
  id,
  location,
  timestamp,
  confidence,
  elephantCount,
  severity,
  distance,
}: AlertCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border p-4 ${severityColors[severity]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
            severity === 'critical' ? 'text-red-500' :
            severity === 'high' ? 'text-yellow-500' :
            'text-orange-500'
          }`} />
          <div>
            <h3 className="font-semibold text-foreground">Elephant Detection Alert</h3>
            <p className="text-sm text-muted-foreground">{id}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${severityBadgeColors[severity]}`}>
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-foreground">{location}</span>
          {distance && <span className="text-muted-foreground">({distance} away)</span>}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-foreground">{timestamp}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-background/40 rounded p-3">
          <p className="text-xs text-muted-foreground mb-1">Confidence</p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{confidence}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
        <div className="bg-background/40 rounded p-3">
          <p className="text-xs text-muted-foreground mb-1">Elephant Count</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-secondary">{elephantCount}</span>
            <span className="text-xs text-muted-foreground">detected</span>
          </div>
        </div>
      </div>

      <button className="w-full px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium">
        View Details
      </button>
    </motion.div>
  )
}
