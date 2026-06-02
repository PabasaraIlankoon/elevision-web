"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      {/* Background Railway Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line x1="0" y1="50" x2="100" y2="50" stroke="#F59E0B" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#F59E0B" strokeWidth="0.5" strokeDasharray="2,2" />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-black" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">
            Elevision
          </h1>
          <p className="text-xs text-center text-muted-foreground mb-6 uppercase tracking-widest">
            Authorized Personnel Only
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-foreground mb-2">
                Username / Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@elevision.local"
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-colors"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-2.5 transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-xs text-center text-muted-foreground mt-6">
            Protected by military-grade encryption
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-4 rounded-lg border border-border bg-card/50">
          <p className="text-xs font-mono text-muted-foreground">
            <span className="block">Demo: operator / password</span>
          </p>
        </div>
      </div>
    </div>
  );
}
