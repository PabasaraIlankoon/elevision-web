"use client";

import { Bell, Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-30">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between scan-line">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 hover:bg-muted rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h1 className="hidden sm:block text-lg font-bold text-amber-400">ElephantGuard</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <span className="text-xs font-bold text-black">OP</span>
          </div>
        </div>
      </div>
    </header>
  );
}
