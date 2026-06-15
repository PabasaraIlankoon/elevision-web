import Link from "next/link";
import Image from "next/image";
import { Eye, Train, Radio, BarChart3, Shield, Zap } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden [background-image:linear-gradient(rgba(5,17,242,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(5,17,242,0.04)_1px,transparent_1px)] [background-size:40px_40px]">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/elevision-logo.png" alt="Elevision" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-bold tracking-tight text-blue-500">Elevision</span>
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-lg bg-blue-400 hover:bg-blue-300 text-blue-100 text-sm font-semibold transition-colors"
        >
          Open Dashboard →
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-6">

        {/* Right-side photo background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 inset-y-0 w-full lg:w-[55%]">
            <Image
              src="/hero_5.jpg"
              alt=""
              fill
              className="object-cover object-center"
              priority
            />
            {/* Light overlay so cards remain visible */}
            <div className="absolute inset-0 bg-white/30" />
            {/* Blend into white left panel */}
            <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-white to-transparent" />
          </div>
          {/* blue glow bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-blue-300/20 blur-3xl rounded-full" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-600 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Real-time Railway Protection · Sri Lanka
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6 text-gray-900">
              Protect{" "}
              <span className="text-blue-400">Railways.</span>
              <br />
              Save{" "}
              <span className="relative text-gray-900">
                Elephants.
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400/40 rounded" />
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-md">
              AI-Based Elephant Detection and Real-Time Early Warning System For Sri Lankan Railway Tracks
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-400 hover:bg-blue-300 text-blue-100 font-semibold text-sm transition-colors shadow-lg shadow-blue-400/20"
              >
                <Eye className="w-4 h-4" />
                View Live Dashboard
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors"
              >
                How it works ↓
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-8">
              {[
                { value: "<5s", label: "Detection latency" },
                { value: "24/7", label: "Live monitoring" },
                { value: "99%+", label: "Alert accuracy" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-blue-500">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating image cards */}
          <div className="hidden lg:block relative h-[500px]">
            {/* Large card — top right, shifted up so bg elephant shows below */}
            <div className="absolute top-0 right-0 w-72 h-48 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 rotate-2">
              <Image src="/hero_1.jpg" alt="Elephant near railway" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-xs text-white/90 font-medium drop-shadow">Habarana Railway Crossing</div>
            </div>
            {/* Medium card — left, middle */}
            <div className="absolute top-44 left-0 w-56 h-40 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 -rotate-3">
              <Image src="/hero_2.jpg" alt="Elephant at dusk" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-xs text-white/90 font-medium drop-shadow">Gal Oya Junction</div>
            </div>
            {/* Bottom right card */}
            <div className="absolute bottom-4 right-8 w-64 h-44 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 rotate-1">
              <Image src="/hero_3.jpg" alt="Elephant in corridor" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-xs text-white/90 font-medium drop-shadow">Minneriya Corridor</div>
            </div>
            {/* Small accent bottom-left */}
            <div className="absolute bottom-20 left-16 w-44 h-32 rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5 -rotate-1">
              <Image src="/hero_4.jpg" alt="Elephant at sunrise" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-blue-500 font-semibold uppercase tracking-widest mb-4">How it works</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-16 max-w-lg">
            From detection to alert in under 5 seconds
          </h2>
          <div className="grid md:grid-cols-3 gap-px bg-gray-100 border shadow shadow-gray-200/50 border-blue-100/50 rounded-2xl overflow-hidden">
            {[
              { step: "01", icon: Zap, title: "Edge AI detects", body: "YOLO model running on a Raspberry Pi 4B identifies elephants in the camera frame in real time." },
              { step: "02", icon: Radio, title: "Cloud alert fires", body: "The Pi pushes a detection event to Firestore with image, confidence score, GPS coordinates, and timestamp." },
              { step: "03", icon: Train, title: "Rail ops notified", body: "Dashboard and mobile app receive a live alert. Train risk is assessed against the corridor schedule automatically." },
            ].map(({ step, icon: Icon, title, body }) => (
              <div key={step} className="bg-white p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold text-blue-300 font-mono">{step}</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-blue-500 font-semibold uppercase tracking-widest mb-4">Dashboard features</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-16 max-w-lg">
            Everything an operator needs, in one view
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Eye, title: "Live Alert Feed", body: "Detection events stream in real time. Each alert shows the capture image, confidence score, and location." },
              { icon: Radio, title: "Device Health", body: "Know instantly if a camera node goes offline. Every Pi reports its status continuously." },
              { icon: Train, title: "Train Risk Assessment", body: "For each detection, the system checks if a high-risk train is approaching within 60 minutes." },
              { icon: BarChart3, title: "Analytics", body: "Peak detection hours, location trends, confidence distributions — 30 days of data at a glance." },
              { icon: Shield, title: "Mark as Reviewed", body: "Acknowledge and close alerts. Status syncs across web and mobile apps in real time." },
              { icon: Zap, title: "Rail Zone Map", body: "All devices and active alerts plotted on an interactive Sri Lanka railway map." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 px-8 py-16 text-center">
            <div className="absolute inset-0 opacity-75 pointer-events-none">
              <Image src="/hero_5.jpg" alt="" fill className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/60 to-gray-50" />
            </div>
            <div className="relative z-10">
              <p className="text-xs text-blue-500 font-semibold uppercase tracking-widest mb-4">Live now</p>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">See the system in action</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                The dashboard is live and connected to real detection nodes in Sri Lanka's elephant corridor.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-400 hover:bg-blue-300 text-black font-semibold text-sm transition-colors shadow-lg shadow-blue-400/20"
              >
                <Eye className="w-4 h-4" />
                Open Live Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/elevision-logo.png" alt="Elevision" width={24} height={24} className="rounded-md opacity-60" />
            <span className="text-xs text-gray-400">Elevision — Railway Elephant Safety System</span>
          </div>
          <p className="text-xs text-gray-300">Built for Sri Lankan Railways · v1.0.0</p>
        </div>
      </footer>

    </main>
  );
}
