"use client";

import { Shield, Menu } from "lucide-react";
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
        {/* Left — hamburger + logo */}
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

            {/*
              The Sheet portal renders outside the normal DOM so CSS variables
              from :root don't always reach it. We apply the .dark class directly
              on SheetContent and hard-code the sidebar background so it's always
              solid regardless of portal context.
            */}
            <SheetContent
              side="left"
              className="dark p-0 border-r border-[hsl(216,20%,18%)] w-70"
              style={{ backgroundColor: "hsl(0, 0%, 100%)" }}
            >
              {/* Header */}
              <SheetHeader className="flex flex-row gap-4 items-center px-4 py-5 border-b border-[hsl(216,20%,18%)]">
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
                  <span className="text-amber-400 text-lg font-bold">
                    Elevision
                  </span>
                  <p className="text-xs text-[hsl(0, 0%, 0%)] mt-0.5 font-normal">
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
                            ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                            : "text-[hsl(216,20%,18%)] hover:bg-[hsl(216,20%,14%)] hover:text-white"
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
              <SheetFooter className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-[hsl(216,20%,18%)]">
                <p className="text-xs text-[hsl(0,0%,45%)]">Elevision v1.0</p>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-amber-400">Elevision</h1>
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
