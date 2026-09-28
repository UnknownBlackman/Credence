"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Landmark, ArrowUpRight, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';

interface VaultSource {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  availableLiquidity: string;
  settlementTime: string;
  routeShare: number; // percentage in the routing demo
}

const VAULT_SOURCES: VaultSource[] = [
  {
    id: 'aave',
    name: 'Aave v3 Infrastructure',
    category: 'Decentralized Money Market',
    badge: 'Multi-Billion Deep',
    description: 'Premier decentralized liquidity reserve for instant multi-million stablecoin draws.',
    availableLiquidity: '$240M+ USDC',
    settlementTime: 'Sub-second',
    routeShare: 40,
  },
  {
    id: 'morpho',
    name: 'Morpho Blue Vaults',
    category: 'Risk-Isolated Vaults',
    badge: 'Ultra Capital-Efficient',
    description: 'Minimalist lending primitives with isolated risk curation and optimized rates.',
    availableLiquidity: '$110M+ USDC',
    settlementTime: 'Instant',
    routeShare: 25,
  },
  {
    id: 'compound',
    name: 'Compound v3 Markets',
    category: 'Algorithmic Protocol',
    badge: 'Battle-Tested',
    description: 'Algorithmic money markets ensuring continuous capital availability and clearing.',
    availableLiquidity: '$85M+ USDC',
    settlementTime: 'Instant',
    routeShare: 15,
  },
  {
    id: 'erc4626',
    name: 'Institutional ERC-4626 Pools',
    category: 'Private Credit Syndicates',
    badge: 'Enterprise Yield',
    description: 'Standardized tokenized vaults backed by institutional allocators for verified cash flows.',
    availableLiquidity: '$150M+ USDC',
    settlementTime: 'On Demand',
    routeShare: 15,
  },
  {
    id: 'tempo-native',
    name: 'Tempo-Native Lending',
    category: 'Orderbook Protocol',
    badge: '< 650ms Finality',
    description: 'High-speed credit facilities matching institutional capital directly on Tempo.',
    availableLiquidity: '$65M+ USDC',
    settlementTime: '610ms',
    routeShare: 5,
  },
];

interface ConnectedVaultsProps {
  onGetStarted: () => void;
}

export const ConnectedVaults: React.FC<ConnectedVaultsProps> = ({ onGetStarted }) => {
  const [activeVaultId, setActiveVaultId] = useState<string>('aave');
  const [testAmount, setTestAmount] = useState<number>(1000000);

  const activeVault = VAULT_SOURCES.find((v) => v.id === activeVaultId) || VAULT_SOURCES[0];

  return (
    <section id="liquidity-vaults" className="py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-[11px] font-mono uppercase tracking-widest text-amber-900 font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected External Infrastructure</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-display">
            External Liquidity Vaults.{' '}
            <span className="font-accent italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#A8792A] via-[#C99738] to-[#92651A]">
              Always Present for Borrowers.
            </span>
          </h2>

          <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed font-light">
            Connect verified cash flow directly to premier liquidity vaults, eliminating lender delays with guaranteed, instant liquidity.
          </p>
        </motion.div>

        {/* 5 Connected Infrastructure Vault Badges / Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {VAULT_SOURCES.map((vault, idx) => {
            const isSelected = activeVaultId === vault.id;
            return (
              <motion.button
                key={vault.id}
                type="button"
                onClick={() => setActiveVaultId(vault.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-amber-400 shadow-[0_8px_24px_rgba(212,175,55,0.2)] ring-2 ring-amber-300/60'
                    : 'bg-white/70 hover:bg-white border-amber-100 hover:border-amber-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                      {vault.badge}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-500' : 'bg-emerald-400'}`} />
                  </div>
                  <div className="font-bold text-sm text-stone-900 font-display">
                    {vault.name}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {vault.category}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-amber-100/70 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-stone-400">Available:</span>
                  <span className="font-bold text-stone-800">{vault.availableLiquidity}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Interactive Liquidity Guarantee Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4, transition: { duration: 0.25 } }}
          className="glass-panel-gold rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-[0_20px_50px_-12px_rgba(212,175,55,0.18)] relative overflow-hidden"
        >
          {/* Subtle gold decorative glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-300/15 via-yellow-200/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left: How Routing Works for Borrowers */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase font-semibold text-amber-800">
                    Live Syndication & Liquidity Routing
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100% Pre-Funded
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-stone-900 font-display">
                  No Counterparty Delays. Pure Capital Velocity.
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-light mt-1.5 leading-relaxed">
                  Once verified, Credence automatically routes draws from the optimal vault for lowest APR and instant Tempo settlement.
                </p>
              </div>

              {/* Visual Routing Breakdown */}
              <div className="p-4 rounded-2xl bg-white/90 border border-amber-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-600 font-medium">Simulated Drawdown:</span>
                  <div className="flex gap-2">
                    {[500000, 1000000, 2500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTestAmount(amt)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                          testAmount === amt
                            ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                            : 'bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200'
                        }`}
                      >
                        ${amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multivault Allocation Bar */}
                <div>
                  <div className="flex h-3 w-full rounded-full overflow-hidden bg-amber-100/60 p-0.5 gap-0.5">
                    <div className="h-full bg-amber-500 rounded-l-full transition-all duration-300" style={{ width: '40%' }} title="Aave v3 (40%)" />
                    <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: '25%' }} title="Morpho Blue (25%)" />
                    <div className="h-full bg-amber-300 transition-all duration-300" style={{ width: '15%' }} title="Compound v3 (15%)" />
                    <div className="h-full bg-[#A8792A] transition-all duration-300" style={{ width: '15%' }} title="Institutional ERC-4626 (15%)" />
                    <div className="h-full bg-amber-600 rounded-r-full transition-all duration-300" style={{ width: '5%' }} title="Tempo Native (5%)" />
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-stone-500 mt-2 gap-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Aave (${(testAmount * 0.4).toLocaleString()})</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Morpho (${(testAmount * 0.25).toLocaleString()})</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-300" /> Compound (${(testAmount * 0.15).toLocaleString()})</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#A8792A]" /> ERC-4626 (${(testAmount * 0.15).toLocaleString()})</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600" /> Tempo (${(testAmount * 0.05).toLocaleString()})</span>
                  </div>
                </div>
              </div>

              {/* Key Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/70 border border-amber-100 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="text-stone-700"><strong>Guaranteed Depth:</strong> Multi-vault pooled reserves.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-amber-100 flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="text-stone-700"><strong>Tempo Finality:</strong> Sub-second execution and draws.</span>
                </div>
              </div>
            </div>

            {/* Right: Focused Vault Card */}
            <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-white via-amber-50/50 to-amber-50/20 p-6 border border-amber-200/90 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-amber-100 mb-4">
                  <span className="text-[11px] font-mono uppercase font-bold text-amber-900 tracking-wider">
                    Infrastructure Highlight
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    CONNECTED & LIVE
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-amber-900 font-bold font-mono shadow-xs">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-stone-900 font-display">
                      {activeVault.name}
                    </h4>
                    <span className="text-xs text-stone-500 font-mono">
                      {activeVault.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {activeVault.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-amber-100 text-xs">
                  <div className="flex justify-between py-1 border-b border-amber-100/50">
                    <span className="text-stone-500">Live Pool Depth:</span>
                    <span className="font-mono font-bold text-stone-900">{activeVault.availableLiquidity}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100/50">
                    <span className="text-stone-500">Drawdown Latency:</span>
                    <span className="font-mono text-amber-800 font-semibold">{activeVault.settlementTime}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">Borrower Protection:</span>
                    <span className="font-mono text-stone-900 font-medium">zkTLS Encrypted Invariant</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-100">
                <Link
                  href="/borrower"
                  className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.28)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Draw From Connected Vaults</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-950" />
                </Link>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
