'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlertCircle, Eye, MapPin, Gauge, BarChart3, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Live Alerts', icon: AlertCircle },
  { href: '/history', label: 'History', icon: Eye },
  { href: '/map', label: 'Map View', icon: MapPin },
  { href: '/devices', label: 'Devices', icon: Gauge },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col min-h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">E</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">ElephantGuard</h1>
            <p className="text-xs text-sidebar-foreground/60">Wildlife Monitor</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
