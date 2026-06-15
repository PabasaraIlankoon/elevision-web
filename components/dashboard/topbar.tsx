"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="md:hidden border-b border-border bg-card sticky top-0 z-30">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between scan-line">
        <div className="flex items-center gap-3 w-full justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 hover:bg-muted rounded-lg"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="dark p-0 border-r border-[hsl(222,25%,22%)] w-70"
              style={{ backgroundColor: "hsl(222, 47%, 6%)" }}
            >
              {/* Header */}
              <SheetHeader className="flex flex-row gap-4 items-center px-4 py-5 border-b border-[hsl(222,25%,22%)]">
                <SheetTitle className="flex items-center gap-2">
                  <Image
                    src="/elevision-logo.png"
                    alt="Elevision"
                    width={60}
                    height={60}
                    className="rounded-md"
                  />
                </SheetTitle>
                <div className="flex flex-col gap-1">
                  <span className="text-blue-400 text-lg font-bold">
                    Elevision
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5 font-normal">
                    Elephant Detection System
                  </p>
                </div>
              </SheetHeader>

              {/* Nav */}
              <nav className="p-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                          isActive
                            ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>

              {/* Footer */}
              <SheetFooter className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-[hsl(222,25%,22%)]">
                <p className="text-xs text-slate-500">Elevision v1.0</p>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">Elevision</h1>
              <Image
                src="/elevision-logo.png"
                alt="Elevision"
                width={45}
                height={45}
                className="rounded-md"
              />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
