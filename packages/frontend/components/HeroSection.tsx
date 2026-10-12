"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Lock, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { LogoMonolith } from './logos/LogoComponents';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExploreHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onExploreHowItWorks }) => {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Title with varied typography, Playfair Display accent in rich gold */}
        <div className="text-center max-w-5xl mx-auto mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-stone-900 leading-[1.08] font-display"
          >
            Undercollateralized Credit.{' '}
            <span className="block mt-1 font-accent italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#A8792A] via-[#C99738] to-[#92651A]">
              Zero Corporate Secrets Leaked.
            </span>
          </motion.h1>

          {/* Concise, high-signal explanation highlighting connected vaults */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-base sm:text-lg text-stone-600 leading-relaxed font-light max-w-3xl mx-auto"
          >
            Credence verifies corporate revenue via zkTLS, connecting you directly to deep external vaults (Aave, Morpho, Compound, Tempo), ensuring liquidity is always ready when you draw.
          </motion.p>
        </div>

        {/* Primary Invitation Actions */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <button
            onClick={onGetStarted}
            className="group w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-[0_6px_22px_rgba(212,175,55,0.3)] hover:shadow-[0_10px_30px_rgba(212,175,55,0.45)] transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Join Waitlist</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <a
            href="#simulator"
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-medium text-stone-700 hover:text-amber-900 bg-white/85 hover:bg-white border border-amber-200/70 hover:border-amber-400 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.18)] transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Simulate Credit Line</span>
            <ChevronRight className="w-4 h-4 text-amber-500" />
          </a>

          <Link
            href="/borrower"
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-medium text-amber-950 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <span>Launch App</span>
            <ChevronRight className="w-4 h-4 text-amber-600" />
          </Link>
        </motion.div>

        {/* Interactive Floating Proof Card: Demonstrates Product Reality in 1 View */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6, transition: { duration: 0.25 } }}
          className="max-w-4xl mx-auto rounded-3xl glass-panel-gold p-6 sm:p-8 border border-amber-200/60 shadow-[0_20px_50px_-10px_rgba(212,175,55,0.18)] relative overflow-hidden group cursor-default"
        >
          {/* Decorative warm gold glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-300/20 via-yellow-200/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-amber-100 gap-3">
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-700">
                Verified Enterprise Session
              </div>
              <div className="text-base font-bold text-stone-900 font-display flex items-center gap-2 mt-0.5">
                <span>Acme Cloud Technologies</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  zkTLS Verified
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-mono text-stone-500 block">Calculated Credit Limit</span>
              <span className="text-2xl font-bold font-mono text-stone-900 tracking-tight tabular-nums">
                $1,250,000 <span className="text-xs font-normal text-amber-700 font-sans">USDC</span>
              </span>
            </div>
          </div>

          {/* 3 Quick Visual Proofs inside card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 pb-2">
            <div className="p-3.5 rounded-xl bg-white/80 border border-amber-100 shadow-xs hover:border-amber-300 hover:bg-white transition-all duration-200">
              <span className="text-[11px] text-stone-500 block mb-1">Off-Chain Revenue Feed</span>
              <div className="font-semibold text-xs text-stone-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Stripe + Mercury Bank
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 border border-amber-100 shadow-xs hover:border-amber-300 hover:bg-white transition-all duration-200">
              <span className="text-[11px] text-stone-500 block mb-1">Confidential Enclave</span>
              <div className="font-semibold text-xs text-stone-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Arcium MPC Consensus
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 border border-amber-100 shadow-xs hover:border-amber-300 hover:bg-white transition-all duration-200">
              <span className="text-[11px] text-stone-500 block mb-1">Tempo Finality</span>
              <div className="font-semibold text-xs text-stone-800 flex items-center gap-1.5 font-mono">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                &lt; 650ms Execution
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5 text-stone-700">
              <Lock className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Connected to Aave, Morpho &amp; Tempo · <strong>Guaranteed liquidity</strong></span>
            </span>
            <span className="font-mono text-amber-800 font-semibold tracking-wide shrink-0">0 BYTES STORED</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
