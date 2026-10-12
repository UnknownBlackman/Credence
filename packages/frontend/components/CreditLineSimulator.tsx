"use client";

import React, { useState, useId } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface SimulatorProps {
  onApplyWithParameters: (amount: number, revenue: number, source: string) => void;
}

export const CreditLineSimulator: React.FC<SimulatorProps> = ({ onApplyWithParameters }) => {
  const [revenue, setRevenue] = useState<number>(250000);
  const [growth, setGrowth] = useState<number>(40);
  const [source, setSource] = useState<string>('stripe');

  const revId = useId();
  const growthId = useId();

  // Multiplier formula
  const growthFactor = 1 + (growth / 100) * 0.35;
  const creditFacility = Math.round((revenue * 3.2 * growthFactor) / 5000) * 5000;
  const apr = (8.4 - (growth > 50 ? 1.0 : 0.4)).toFixed(1);

  return (
    <section id="simulator" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-[11px] font-mono uppercase tracking-widest text-amber-900 font-semibold mb-3">
            <span>Instant Credit Simulator</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-display">
            Estimate Your Credit Facility{' '}
            <span className="font-accent italic font-normal text-amber-700">in Real Time.</span>
          </h2>

          <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed font-light">
            Zero equity dilution. Zero locked crypto. Unlock instant liquidity backed by verified cash flow.
          </p>
        </motion.div>

        {/* Interactive Simulator Box with scroll-in animation & hover response */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4, transition: { duration: 0.25 } }}
          className="glass-panel-gold rounded-3xl p-6 sm:p-10 border border-amber-200/70 shadow-[0_20px_50px_-12px_rgba(212,175,55,0.18)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Sliders */}
            <div className="lg:col-span-7 space-y-6">
              {/* Revenue Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor={revId} className="text-xs font-mono font-semibold uppercase text-stone-700">
                    Monthly Revenue (MRR)
                  </label>
                  <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                    ${revenue.toLocaleString()}
                    <span className="text-xs font-normal text-stone-500"> /mo</span>
                  </span>
                </div>
                <input
                  id={revId}
                  type="range"
                  min={30000}
                  max={1500000}
                  step={10000}
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                  className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                />
                <div className="flex justify-between text-[11px] font-mono text-stone-500 mt-1">
                  <span>$30,000</span>
                  <span>$750,000</span>
                  <span>$1,500,000+</span>
                </div>
              </div>

              {/* Growth Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor={growthId} className="text-xs font-mono font-semibold uppercase text-stone-700">
                    YoY Growth Rate
                  </label>
                  <span className="text-xl font-bold font-mono text-amber-700 tabular-nums">
                    +{growth}%
                  </span>
                </div>
                <input
                  id={growthId}
                  type="range"
                  min={0}
                  max={120}
                  step={5}
                  value={growth}
                  onChange={(e) => setGrowth(Number(e.target.value))}
                  className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                />
                <div className="flex justify-between text-[11px] font-mono text-stone-500 mt-1">
                  <span>0% (Steady)</span>
                  <span>+60%</span>
                  <span>+120% (High Scale)</span>
                </div>
              </div>

              {/* Source selector */}
              <div>
                <span className="text-xs font-mono font-semibold uppercase text-stone-700 block mb-2">
                  Select Primary Revenue Feed
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'stripe', label: 'Stripe Billing' },
                    { id: 'quickbooks', label: 'QuickBooks' },
                    { id: 'banking', label: 'Banking Invoices' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSource(s.id)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer ${
                        source === s.id
                          ? 'bg-amber-50 border-amber-400 text-amber-900 font-semibold shadow-xs ring-1 ring-amber-300/50'
                          : 'bg-white/70 border-stone-200 text-stone-600 hover:bg-white hover:text-stone-900'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Output Card in warm gold */}
            <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-amber-50/90 via-white to-amber-50/40 p-6 sm:p-7 border border-amber-200/80 shadow-inner flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-amber-100 mb-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-900 font-semibold">
                    Approved Facility Terms
                  </span>
                  <span className="text-[10px] font-mono text-stone-600 bg-white px-2 py-0.5 rounded border border-amber-200/70">
                    Tempo Testnet
                  </span>
                </div>

                <div className="mb-5">
                  <span className="text-xs text-stone-500 block mb-1">Estimated Credit Facility</span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-stone-900 tracking-tight tabular-nums">
                    ${creditFacility.toLocaleString()}{' '}
                    <span className="text-sm font-sans font-medium text-amber-700">USDC</span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500 mt-1 block">
                    Zero collateral lockup required
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-1 pb-4">
                  <div className="flex justify-between py-1.5 border-b border-amber-100/60">
                    <span className="text-stone-600">Target Borrow APR</span>
                    <span className="font-mono font-bold text-stone-900">{apr}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-amber-100/60">
                    <span className="text-stone-600">Liquidity Backing</span>
                    <span className="font-mono text-stone-900 font-semibold text-right">Aave, Morpho, ERC-4626</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-amber-100/60">
                    <span className="text-stone-600">Privacy Guarantee</span>
                    <span className="font-mono text-amber-800 font-semibold">zkTLS Zero-Knowledge</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-stone-600">Settlement Speed</span>
                    <span className="font-mono text-stone-900 font-medium">&lt; 650ms on Tempo</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onApplyWithParameters(creditFacility, revenue, source)}
                className="w-full py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Join Waitlist</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
