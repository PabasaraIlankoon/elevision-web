'use client'

import { Bell, Settings, User } from 'lucide-react'

export function TopBar() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm text-muted-foreground">
          <p>Status: <span className="text-secondary font-semibold">Active</span></p>
        </div>
        
        <button className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground">
          <Bell className="w-5 h-5" />
        </button>
        
        <button className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>
    </header>
  )
}
