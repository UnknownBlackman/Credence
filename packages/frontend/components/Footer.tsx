"use client";

import React from 'react';
import Link from 'next/link';
import { LogoMonolith } from './logos/LogoComponents';

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-amber-200/50 bg-white/70 backdrop-blur-md py-12 text-stone-500 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand Mark & Description */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0E0C0A] flex items-center justify-center shadow-xs border border-stone-800 p-1 shrink-0">
              <LogoMonolith size={18} variant="white" />
            </div>
            <span className="font-display font-bold text-stone-900 text-base">
              Credence
            </span>
            <span className="text-stone-300">|</span>
            <span>Privacy-Preserving Corporate Credit Connected to External Vaults</span>
          </div>

          {/* Navigation Links & Copyright */}
          <div className="flex flex-wrap items-center gap-6 text-stone-500 font-mono text-[11px]">
            <a href="#how-it-works" className="hover:text-stone-900 transition-colors">
              How It Works
            </a>
            <a href="#liquidity-vaults" className="hover:text-stone-900 transition-colors">
              Vaults
            </a>
            <a href="#simulator" className="hover:text-stone-900 transition-colors">
              Simulator
            </a>
            <a href="#guarantees" className="hover:text-stone-900 transition-colors">
              Privacy
            </a>
            <span className="text-stone-300 hidden sm:inline">|</span>
            <Link href="/borrower" className="hover:text-amber-800 transition-colors font-medium">
              Borrow
            </Link>
            <Link href="/lender" className="hover:text-amber-800 transition-colors font-medium">
              Lend
            </Link>
            <Link href="/simulate" className="hover:text-amber-800 transition-colors font-medium">
              Simulate
            </Link>
            <span className="text-stone-300 hidden sm:inline">|</span>
            <span className="text-stone-400">Tempo Ecosystem &copy; {new Date().getFullYear()}</span>
          </div>

        </div>
      </div>
    </footer>
  );
};
