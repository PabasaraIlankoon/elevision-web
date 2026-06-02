"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  Clock,
  Map,
  Radio,
  BarChart3,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: AlertCircle, label: "Alerts", exact: true },
  { href: "/dashboard/history", icon: Clock, label: "History" },
  { href: "/dashboard/map", icon: Map, label: "Map" },
  { href: "/dashboard/devices", icon: Radio, label: "Devices" },
  { href: "/dashboard/analytics-report", icon: BarChart3, label: "Analytics" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar text-sidebar-foreground h-screen sticky top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-amber-400">Elevision</h1>
        <p className="text-xs text-muted-foreground mt-1">Detection System</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
