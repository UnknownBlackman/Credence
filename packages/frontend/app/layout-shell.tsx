"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMonolith } from "@/components/logos/LogoComponents";
import { WalletButton } from "@/components/WalletButton";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-stone-900 font-sans antialiased">
      <header className="border-b border-amber-200/50 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_24px_-4px_rgba(212,175,55,0.12)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none" aria-label="Credence Home">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#0E0C0A] shadow-[0_2px_12px_rgba(0,0,0,0.35)] border border-stone-800 group-hover:border-stone-700 transition-all duration-200 group-hover:scale-105 p-1 shrink-0">
              <LogoMonolith size={20} variant="white" />
            </div>
            <span className="font-display font-bold tracking-tight text-xl text-stone-900 group-hover:text-amber-800 transition-colors">
              Credence
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-xs font-medium transition-colors ${
                pathname === "/"
                  ? "text-amber-900 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80"
                  : "text-stone-600 hover:text-amber-800"
              }`}
            >
              Home
            </Link>
            <Link
              href="/borrower"
              className={`text-xs font-medium transition-colors ${
                pathname === "/borrower"
                  ? "text-amber-900 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80"
                  : "text-stone-600 hover:text-amber-800"
              }`}
            >
              Borrow
            </Link>
            <Link
              href="/lender"
              className={`text-xs font-medium transition-colors ${
                pathname === "/lender"
                  ? "text-amber-900 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80"
                  : "text-stone-600 hover:text-amber-800"
              }`}
            >
              Lend
            </Link>
            <Link
              href="/simulate"
              className={`text-xs font-medium transition-colors ${
                pathname === "/simulate"
                  ? "text-amber-900 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80"
                  : "text-stone-600 hover:text-amber-800"
              }`}
            >
              Simulate
            </Link>
            <WalletButton />
          </nav>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="border-t border-amber-200/50 bg-white/70 backdrop-blur-md mt-24 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-sans">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0E0C0A] flex items-center justify-center p-0.5 border border-stone-800 shrink-0">
              <LogoMonolith size={14} variant="white" />
            </div>
            <span className="font-semibold text-stone-900 font-display">Credence</span>
            <span className="text-stone-300">|</span>
            <span>Privacy-Preserving Corporate Credit Protocol</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>Settled via</span>
            <span className="text-amber-800 font-semibold">Tempo MPP</span>
            <span>, gas paid in</span>
            <span className="text-emerald-700 font-semibold">USDC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
