'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

interface EmergencyBannerProps {
  message: string
  onDismiss?: () => void
  autoClose?: boolean
}

export function EmergencyBanner({ message, onDismiss, autoClose = true }: EmergencyBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <div className="bg-red-500/10 border border-red-500/30 px-6 py-4 rounded-lg flex items-start gap-4 animate-in fade-in-50 duration-300">
      <div className="flex items-start gap-4 flex-1">
        <div className="relative">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="absolute inset-0 animate-pulse opacity-75">
            <div className="w-5 h-5 rounded-full border border-red-500/50" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-300 mb-1">Alert</h3>
          <p className="text-sm text-red-200">{message}</p>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
        aria-label="Dismiss alert"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
