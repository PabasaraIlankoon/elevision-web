import Link from "next/link";
import Image from "next/image";
import { Shield, Radio, Map, BarChart3, Zap, Eye } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-background grid-bg text-foreground">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Image src="/elevision-logo.png" alt="Elevision" width={60} height={60} className="rounded-md" />
              <span className="text-2xl sm:block hidden font-bold text-amber-400">
                Elevision
              </span>
            </div>
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-black text-sm font-semibold transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Real-time Railway Elephant Detection
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Protect Railways.
          <br />
          <span className="text-amber-400">Save Elephants.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          AI-powered detection system using Raspberry Pi and YOLO to detect
          elephants near railway tracks in real time — preventing collisions
          before they happen.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-amber-400 hover:bg-amber-500 text-black font-semibold text-base transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Live Dashboard
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: "Instant Detection",
              desc: "YOLO-powered CV on Raspberry Pi 4B detects elephants within seconds of entering the camera frame.",
            },
            {
              icon: Radio,
              title: "Device Telemetry",
              desc: "Each Pi pings the cloud continuously. Know if a camera goes offline before it becomes a blind spot.",
            },
            {
              icon: Map,
              title: "Live Map View",
              desc: "All devices plotted on a Sri Lanka railway map. Active detections light up red in real time.",
            },
            {
              icon: BarChart3,
              title: "Analytics",
              desc: "Peak detection hours, location breakdowns, and confidence trends across your entire network.",
            },
            {
              icon: Shield,
              title: "Alert Feed",
              desc: "Detection events stream live to the dashboard via Supabase Realtime — no polling, no delays.",
            },
            {
              icon: Eye,
              title: "Image Evidence",
              desc: "Each detection event stores the captured frame to Supabase Storage for review and audit.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Elevision — Railway Elephant Safety System · Built for Sri Lankan
        Railways
      </footer>
    </main>
  );
}
