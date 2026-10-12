"use client";

import React from 'react';
import { motion } from 'motion/react';
import { XCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface PrivacyGuaranteesProps {
  onGetStarted: () => void;
}

export const PrivacyGuarantees: React.FC<PrivacyGuaranteesProps> = ({ onGetStarted }) => {
  return (
    <section id="guarantees" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-[11px] font-mono uppercase tracking-widest text-amber-900 font-semibold mb-3">
            <span>Confidentiality Comparison</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-display">
            Your Corporate Financial Secrets{' '}
            <span className="font-accent italic font-normal text-amber-700">Never Leave Your Machine.</span>
          </h2>

          <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed font-light">
            Legacy commercial lending vs. Credence cryptographic privacy.
          </p>
        </motion.div>

        {/* Side by side comparison cards with hover animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Card 1: Traditional Lenders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="rounded-3xl p-7 bg-white/80 border border-red-100 shadow-[0_10px_30px_-10px_rgba(239,68,68,0.1)] flex flex-col justify-between cursor-default"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-red-100/60 mb-5">
                <span className="text-xs font-mono uppercase font-bold text-red-600 tracking-wider">
                  Legacy Commercial Lenders
                </span>
                <span className="text-[11px] font-mono text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200/60 font-medium">
                  High Risk of Exposure
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 font-display mb-4">
                Unencrypted Balance Sheets &amp; Customer Lists
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-stone-600">
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Plaintext CSVs and accounting records emailed to third-party analysts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Trade secrets, client pricing, and margins stored on centralized databases.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>DeFi alternatives demand 150%+ locked crypto collateral.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-red-50 text-[11px] font-mono text-red-600 font-medium">
              Risk: Data exposure, customer leaks, and predatory debt terms.
            </div>
          </motion.div>

          {/* Card 2: Credence in Gold */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="rounded-3xl p-7 bg-white/95 border border-amber-300 shadow-[0_16px_40px_-10px_rgba(212,175,55,0.22)] ring-2 ring-amber-400/25 flex flex-col justify-between relative overflow-hidden cursor-default"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-4 border-b border-amber-100 mb-5">
                <span className="text-xs font-mono uppercase font-bold text-amber-800 tracking-wider">
                  Credence Protocol
                </span>
                <span className="text-[11px] font-mono text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-semibold">
                  Zero-Knowledge Proof
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 font-display mb-4">
                Cryptographic Proof &amp; Vault Liquidity
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>zkTLS session attestation</strong> proves revenue straight from the TLS source.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Connected vaults</strong> (Aave, Morpho, Compound) ensure instant liquidity.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>100% Undercollateralized</strong>: Backed by verified revenue, never locked crypto.</span>
                </li>
              </ul>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-amber-100 flex items-center justify-between text-[11px] font-mono text-amber-900 font-semibold">
              <span>0 BYTES STORED</span>
              <span>ALWAYS-ON VAULT LIQUIDITY</span>
            </div>
          </motion.div>

        </div>

        {/* Call to Action Banner in rich gold & champagne */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-3xl bg-gradient-to-r from-[#B38728] via-[#C99738] to-[#92651A] p-8 sm:p-10 text-white shadow-xl shadow-amber-900/15 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
              Ready to secure your corporate credit line?
            </h3>
            <p className="mt-1.5 text-amber-100 text-xs sm:text-sm font-light max-w-xl">
              Takes under 60 seconds to attest Stripe or QuickBooks revenue in your browser.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={onGetStarted}
              className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-950 bg-white hover:bg-amber-50 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-100 flex items-center gap-2 cursor-pointer"
            >
              <span>Join Waitlist</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
