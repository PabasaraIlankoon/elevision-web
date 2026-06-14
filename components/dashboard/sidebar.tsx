"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  Clock,
  Map,
  Radio,
  BarChart3,
  Train,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", icon: AlertCircle, label: "Dashboard", exact: true },
  { href: "/dashboard/history", icon: Clock, label: "Alert History" },
  { href: "/dashboard/map", icon: Map, label: "Map" },
  { href: "/dashboard/devices", icon: Radio, label: "Devices" },
  { href: "/dashboard/trains", icon: Train, label: "Train Schedule" },
  { href: "/dashboard/analytics-report", icon: BarChart3, label: "Analytics" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar text-sidebar-foreground h-screen sticky top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/elevision-logo.png" alt="Elevision" width={60} height={60} className="rounded-md" />
          <div>
            <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400 leading-tight">
              Elevision
            </h1>
            <p className="text-xs text-muted-foreground">
              Live Elephant Guard
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-600/30"
                  : "text-sidebar-foreground hover:bg-blue-600/5"
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
        <p className="text-xs text-muted-foreground">Elevision v1.0.0</p>
      </div>
    </nav>
  );
}
