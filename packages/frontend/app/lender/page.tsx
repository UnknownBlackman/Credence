"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Landmark, ShieldCheck, Zap, ArrowRight, RefreshCw, CheckCircle2, Lock } from "lucide-react";
import { LogoMonolith } from "@/components/logos/LogoComponents";
import { useCredenceAccount } from "@/lib/useCredenceAccount";
import { LenderDashboard } from "@/components/LenderDashboard";
import { useLenderDashboard } from "@/lib/useFinancialDashboard";

export default function LenderPage() {
  const { address, isConnected, isDemo, openConnectModal } = useCredenceAccount();
  const {
    currentLentPrincipal,
    currentShares,
    estimatedInterestAccrued,
    totalValueWithInterest,
    recordDeposit,
  } = useLenderDashboard(address);

  const [depositAmount, setDepositAmount] = useState(10000);
  const [isDepositing, setIsDepositing] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [viewDashboard, setViewDashboard] = useState(false);

  // Mock vault stats (in production read from on-chain via wagmi useReadContract)
  const vaultStats = {
    tvl: 500_000 + currentLentPrincipal,
    availableLiquidity: 464_000 + currentLentPrincipal,
    deployedCapital: 36_000,
    currentApyPct: 8.4,
    dscr: 2.1,
    historicalDefaultRate: "0.00%",
    activeLoans: 1,
    lenderCount: currentLentPrincipal > 0 ? 13 : 12,
  };

  const userShares = currentShares;
  const userUSDCValue = totalValueWithInterest;

  async function handleDeposit() {
    if (!isConnected) {
      openConnectModal();
      return;
    }
    setIsDepositing(true);
    await new Promise((r) => setTimeout(r, 2500));
    const fakeTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    recordDeposit(depositAmount, fakeTx);
    setTxHash(fakeTx);
    setIsDepositing(false);
    setViewDashboard(true);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Brand Kicker & Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-stone-200/90 shadow-[0_2px_14px_rgba(0,0,0,0.06)] backdrop-blur-md mb-4">
            <div className="w-5 h-5 rounded-md bg-[#0E0C0A] flex items-center justify-center p-0.5 border border-stone-800">
              <LogoMonolith size={12} variant="white" />
            </div>
            <span className="text-xs font-mono font-medium text-stone-800 tracking-wide">
              CREDENCE <span className="opacity-40">·</span> LIQUIDITY VAULT
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-display">
            Lender Vault{" "}
            <span className="font-accent italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#A8792A] via-[#C99738] to-[#92651A]">
              Real-World Yield
            </span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed font-light max-w-3xl">
            Deposit USDC to earn real-world yield backed by verified off-chain cash flows. Repayments stream automatically via Tempo Machine Payments Protocol.
          </p>
        </div>

        {/* Tab switch between Deposit Pool & Position Dashboard */}
        <div className="inline-flex items-center p-1.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl shadow-xs self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewDashboard(false)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer font-sans ${
              !viewDashboard
                ? "bg-white text-stone-900 shadow-xs border border-amber-200/60 font-bold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Vault Deposit
          </button>
          <button
            type="button"
            onClick={() => setViewDashboard(true)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer font-sans ${
              viewDashboard
                ? "bg-white text-stone-900 shadow-xs border border-amber-200/60 font-bold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Lender Dashboard
          </button>
        </div>
      </div>

      {viewDashboard ? (
        <LenderDashboard
          accountAddress={address}
          onDepositRequested={() => setViewDashboard(false)}
        />
      ) : (
        <>
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          {
            label: "Total Value Locked",
            value: `$${vaultStats.tvl.toLocaleString()}`,
            sub: "USDC Liquidity Pool",
            accent: "text-stone-900",
            icon: Landmark,
          },
          {
            label: "Available Liquidity",
            value: `$${vaultStats.availableLiquidity.toLocaleString()}`,
            sub: "USDC Ready to Deploy",
            accent: "text-emerald-700",
            icon: Zap,
          },
          {
            label: "Deployed Capital",
            value: `$${vaultStats.deployedCapital.toLocaleString()}`,
            sub: "USDC in Active Credit Lines",
            accent: "text-amber-800",
            icon: ShieldCheck,
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-3xl glass-panel-gold border border-amber-200/70 hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-medium">
                  {stat.label}
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-800">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className={`text-3xl font-extrabold font-mono tracking-tight ${stat.accent}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-stone-500 mt-1 font-sans">{stat.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main 2-Column Split: Vault Health Metrics & Deposit Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vault Health Metrics */}
        <div className="lg:col-span-6 rounded-3xl glass-panel-gold p-7 border border-amber-200/80 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-amber-100 mb-5">
            <h2 className="text-base font-bold text-stone-900 font-display">
              Vault Health & Performance
            </h2>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Live & Audited
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2.5 border-b border-amber-100/60">
              <div>
                <p className="text-sm font-semibold text-stone-900">Current APY</p>
                <p className="text-xs text-stone-500">Annualised yield on deposited USDC</p>
              </div>
              <span className="text-xl font-extrabold font-mono text-emerald-700">
                {vaultStats.currentApyPct}%
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-amber-100/60">
              <div>
                <p className="text-sm font-semibold text-stone-900">Weighted Avg. DSCR</p>
                <p className="text-xs text-stone-500">Debt Service Coverage Ratio</p>
              </div>
              <span className="text-xl font-extrabold font-mono text-stone-900">
                {vaultStats.dscr}×
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-amber-100/60">
              <div>
                <p className="text-sm font-semibold text-stone-900">Historical Default Rate</p>
                <p className="text-xs text-stone-500">All-time factoring portfolio</p>
              </div>
              <span className="text-xl font-extrabold font-mono text-emerald-700">
                {vaultStats.historicalDefaultRate}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-amber-100/60">
              <div>
                <p className="text-sm font-semibold text-stone-900">Active Facilities</p>
                <p className="text-xs text-stone-500">Outstanding credit lines</p>
              </div>
              <span className="text-xl font-extrabold font-mono text-stone-900">
                {vaultStats.activeLoans}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-semibold text-stone-900">Liquidity Providers</p>
                <p className="text-xs text-stone-500">Unique depositors</p>
              </div>
              <span className="text-xl font-extrabold font-mono text-stone-900">
                {vaultStats.lenderCount}
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Zero-Knowledge Protected Risk Model</p>
              <p className="text-stone-600 mt-1 leading-relaxed">
                All underwriting metrics are cryptographically verified via zkTLS. Allocators see macro risk metrics while individual corporate banking records remain completely confidential.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Deposit USDC & Flow Guide */}
        <div className="lg:col-span-6 space-y-6">
          {/* Deposit Card */}
          <div className="rounded-3xl glass-panel-gold p-7 border border-amber-200/80 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-bold text-stone-900 font-display">
                Deposit USDC into Senior Vault
              </h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 border border-amber-200/80 text-[11px] font-mono">
                <span className={`w-2 h-2 rounded-full ${isDemo ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                <span className="text-stone-500">Depositor:</span>
                <span className="font-bold text-stone-900">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "0x71C8...9B28"}
                </span>
              </div>
            </div>

            {/* Position details */}
            <div className="mb-5 p-4 rounded-2xl bg-white/90 border border-amber-100/90 shadow-xs">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-stone-500">Your crdnUSDC Shares:</span>
                <span className="text-stone-900 font-mono font-semibold">{userShares}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-500">Underlying USDC Value:</span>
                <span className="text-stone-900 font-mono font-bold">${userUSDCValue.toLocaleString()} USDC</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-mono">$</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  min={100}
                  className="w-full bg-white border border-amber-200 rounded-xl pl-8 pr-3 py-3 text-sm text-stone-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {isConnected ? (
                <button
                  type="button"
                  onClick={handleDeposit}
                  disabled={isDepositing || depositAmount < 100}
                  className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDepositing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Depositing…</span>
                    </>
                  ) : (
                    <>
                      <span>Deposit USDC</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Connect Wallet to Deposit</span>
                </button>
              )}
            </div>

            <p className="text-xs text-stone-500 flex items-center gap-1.5 font-sans">
              <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Zero Gas Tokens Required: Tempo settles fees directly in USDC</span>
            </p>

            {txHash && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-xs"
              >
                <p className="text-sm font-bold text-emerald-900 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Deposit Confirmed
                </p>
                <p className="text-xs text-stone-600">
                  Tempo Tx:{" "}
                  <a
                    href={`https://explorer.moderato.tempo.xyz/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-800 underline font-mono hover:text-amber-900 font-medium"
                  >
                    {txHash.slice(0, 20)}…
                  </a>
                </p>
              </motion.div>
            )}
          </div>

          {/* How Yield Works Card */}
          <div className="p-6 rounded-3xl bg-white/90 border border-amber-100 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-stone-900 font-display">
              How Senior Factoring Yield Operates
            </h3>
            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>You deposit USDC to receive crdnUSDC ERC-4626 shares representing pool equity.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>Borrowers draw against zkTLS-verified receivables from Stripe, QuickBooks, or banking invoices.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>When invoices settle, Tempo Machine Payments Protocol auto-streams principal and interest back.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  4
                </span>
                <span>Your crdnUSDC shares appreciate continuously as factoring yield accrues; redeem any time.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
