"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { LogoMonolith } from './logos/LogoComponents';

interface NavbarProps {
  onGetStarted: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-amber-200/50 shadow-[0_4px_24px_-4px_rgba(212,175,55,0.12)] py-3'
          : 'bg-transparent border-b border-amber-100/40 py-4 sm:py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand identity: Official Monolith logo mark (White on Dark Obsidian) + Typography */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-stone-900 focus:outline-none"
            aria-label="Credence Home"
          >
            {/* The Dedicated Logo Vector Mark on Dark Backdrop */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0E0C0A] shadow-[0_2px_12px_rgba(0,0,0,0.35)] border border-stone-800 group-hover:border-stone-700 transition-all duration-200 group-hover:scale-105 p-1.5 shrink-0">
              <LogoMonolith size={24} variant="white" />
            </div>

            <span className="font-display font-bold tracking-tight text-xl sm:text-2xl text-stone-900 group-hover:text-amber-800 transition-colors">
              Credence
            </span>
          </Link>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-stone-600">
          <a
            href="#how-it-works"
            className="hover:text-amber-800 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#liquidity-vaults"
            className="hover:text-amber-800 transition-colors"
          >
            Connected Vaults
          </a>
          <a
            href="#simulator"
            className="hover:text-amber-800 transition-colors"
          >
            Credit Simulator
          </a>
          <a
            href="#guarantees"
            className="hover:text-amber-800 transition-colors"
          >
            zkTLS Privacy
          </a>
        </nav>

        {/* Right Side Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/borrower"
            className="group relative inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold text-stone-900 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Launch App</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-stone-900" />
          </Link>
        </div>
      </div>
    </header>
  );
};
