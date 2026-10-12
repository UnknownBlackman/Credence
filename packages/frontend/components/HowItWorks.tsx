"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Lock, Cpu, Coins, ArrowRight, Check } from 'lucide-react';

interface HowItWorksProps {
  onGetStarted: () => void;
}

const STEPS = [
  {
    number: '01',
    title: 'Connect Revenue',
    serifSubtitle: 'in your own browser',
    description:
      'Verify Stripe, QuickBooks, or bank cash flow locally via TLS 1.3. Credentials never leave your machine.',
    tag: 'LOCAL TLS 1.3 HANDSHAKE',
    icon: Lock,
    highlight: 'Zero API keys shared',
  },
  {
    number: '02',
    title: 'Confidential Underwriting',
    serifSubtitle: 'via zkTLS & Arcium MPC',
    description:
      'zkTLS strips client names and invoices. Arcium MPC computes debt capacity without exposing plaintext numbers.',
    tag: 'ZERO-KNOWLEDGE ENCLAVE',
    icon: Cpu,
    highlight: '0 bytes private data exposed',
  },
  {
    number: '03',
    title: 'Instant Drawdown',
    serifSubtitle: 'liquidity always present',
    description:
      'Credit lines connect directly to Aave, Morpho, Compound, or Tempo vaults for continuous, deep stablecoin liquidity.',
    tag: 'CONNECTED VAULT ROUTING',
    icon: Coins,
    highlight: 'Always-on capital availability',
  },
];

export const HowItWorks: React.FC<HowItWorksProps> = ({ onGetStarted }) => {
  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with varying font styles & sizes in gold & white */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-[11px] font-mono uppercase tracking-widest text-amber-900 font-semibold mb-3">
            <span>Three Simple Steps</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-display">
            How Corporate Credit Works{' '}
            <span className="font-accent italic font-normal text-amber-700">Without Doxxing.</span>
          </h2>

          <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed font-light">
            Zero audits. Zero paperwork. Verified off-chain cash flow unlocks instant credit.
          </p>
        </motion.div>

        {/* 3 Step Cards that animate into view and elevate on hover */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.25, ease: 'easeOut' },
                }}
                className="group relative rounded-3xl glass-panel-gold p-7 border border-amber-200/60 hover:border-amber-400 transition-all duration-300 flex flex-col justify-between cursor-default"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-bold font-mono text-amber-600/70 group-hover:text-amber-700 transition-colors">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-50 to-yellow-50 border border-amber-200/80 flex items-center justify-center text-amber-800 shadow-xs group-hover:scale-110 group-hover:shadow-md group-hover:shadow-amber-100 transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-800 block mb-1">
                    {step.tag}
                  </span>

                  <h3 className="text-xl font-bold text-stone-900 font-display leading-snug">
                    {step.title}{' '}
                    <span className="font-accent italic font-normal text-amber-800/90 block text-sm sm:text-base mt-0.5">
                      {step.serifSubtitle}
                    </span>
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Highlight Badge */}
                <div className="mt-6 pt-4 border-t border-amber-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-800">
                    <Check className="w-3.5 h-3.5 text-amber-600" />
                    {step.highlight}
                  </span>
                  <span className="text-stone-300 group-hover:text-amber-600 transition-colors font-semibold">
                    →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick CTA banner beneath steps */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-amber-900 bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/90 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-xs cursor-pointer"
          >
            <span>Join Priority Waitlist</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
          </button>
        </motion.div>

      </div>
    </section>
  );
};
