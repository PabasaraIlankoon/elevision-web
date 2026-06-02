'use client'

import { Signal, Battery, MapPin, Activity } from 'lucide-react'

interface DeviceCardProps {
  id: string
  name: string
  location: string
  status: 'active' | 'inactive' | 'low-battery'
  signalStrength: number
  battery: number
  lastUpdate: string
}

export function DeviceCard({
  id,
  name,
  location,
  status,
  signalStrength,
  battery,
  lastUpdate,
}: DeviceCardProps) {
  const statusColors = {
    active: { bg: 'bg-green-900/30', text: 'text-green-400', dot: 'bg-green-500' },
    inactive: { bg: 'bg-gray-900/30', text: 'text-gray-400', dot: 'bg-gray-500' },
    'low-battery': { bg: 'bg-yellow-900/30', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  }

  const colors = statusColors[status]

  return (
    <div className="rounded-lg border border-border bg-card p-5 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">{id}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${colors.dot} animate-pulse`} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-foreground">{location}</span>
        </div>

        <div className="flex items-center gap-2">
          <Signal className="w-4 h-4 text-primary" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Signal</span>
              <span className="text-xs font-semibold text-foreground">{signalStrength}%</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${signalStrength}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Battery className="w-4 h-4 text-primary" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Battery</span>
              <span className={`text-xs font-semibold ${battery < 20 ? 'text-red-400' : 'text-foreground'}`}>
                {battery}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-colors ${
                  battery < 20 ? 'bg-red-500' : 'bg-secondary'
                }`}
                style={{ width: `${battery}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          <span>Last: {lastUpdate}</span>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
          {status === 'active' ? 'Active' : status === 'low-battery' ? 'Low Battery' : 'Inactive'}
        </span>
      </div>
    </div>
  )
}
