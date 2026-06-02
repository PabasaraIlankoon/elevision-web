"use client";

import { Bell, Shield, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/client";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-30">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between scan-line">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 hover:bg-muted rounded-lg"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetHeader className="border-b border-border">
                <SheetTitle className="text-amber-400">Elevision</SheetTitle>
              </SheetHeader>

              <nav className="p-4 space-y-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>

              <SheetFooter className="border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h1 className="hidden sm:block text-lg font-bold text-amber-400">
              Elevision
            </h1>
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
