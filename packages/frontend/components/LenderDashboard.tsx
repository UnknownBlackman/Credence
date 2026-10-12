"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Landmark,
  TrendingUp,
  Percent,
  DollarSign,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Coins,
  ShieldCheck,
  Zap,
  X,
} from "lucide-react";
import { useLenderDashboard } from "@/lib/useFinancialDashboard";

interface LenderDashboardProps {
  accountAddress?: string;
  onDepositRequested?: () => void;
}

export function LenderDashboard({
  accountAddress,
  onDepositRequested,
}: LenderDashboardProps) {
  const {
    currentLentPrincipal,
    totalDeposited,
    totalWithdrawn,
    currentShares,
    estimatedInterestAccrued,
    totalValueWithInterest,
    apyPct,
    deposits,
    withdrawals,
    recordWithdrawal,
  } = useLenderDashboard(accountAddress);

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const handleOpenWithdraw = () => {
    setWithdrawAmount(currentLentPrincipal);
    setTxSuccess(null);
    setWithdrawModalOpen(true);
  };

  const handleExecuteWithdraw = async () => {
    if (withdrawAmount <= 0 || withdrawAmount > currentLentPrincipal) return;
    setIsWithdrawing(true);
    setTxSuccess(null);

    // Simulate blockchain settlement on Tempo
    await new Promise((r) => setTimeout(r, 2000));
    const tx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    recordWithdrawal(withdrawAmount, tx);
    setTxSuccess(tx);
    setIsWithdrawing(false);
  };

  return (
    <div className="space-y-6">
      {/* Lender Dashboard Top Container */}
      <div className="rounded-3xl glass-panel-gold border border-amber-200/90 p-7 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-300/80">
                Senior Liquidity Position
              </span>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                ERC-4626 Tokenized
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display">
              Senior Liquidity Dashboard
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Live status of your capital deployed into Credence real-world receivables factoring vaults on Tempo.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {currentLentPrincipal > 0 && (
              <button
                type="button"
                onClick={handleOpenWithdraw}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-800 hover:text-stone-950 bg-white border border-amber-300/90 hover:bg-amber-50/60 rounded-xl shadow-xs transition-all duration-200 cursor-pointer shrink-0 font-sans"
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-amber-800" />
                <span>Withdraw Liquidity</span>
              </button>
            )}

            {onDepositRequested && (
              <button
                type="button"
                onClick={onDepositRequested}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0 font-sans"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Deposit More USDC</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Core Required Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {/* 1. Total Lent (Current Active Principal) */}
          <div className="bg-white/95 rounded-2xl p-5 border border-amber-100/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium font-sans">Total Lent (Active Balance)</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold font-mono text-stone-900 tracking-tight">
                ${currentLentPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                <span>crdnUSDC Shares:</span>
                <span className="font-mono font-semibold text-stone-800">
                  {currentShares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Estimated Interest Accrued */}
          <div className="bg-white/95 rounded-2xl p-5 border border-amber-100/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium font-sans">Estimated Interest Accrued</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold font-mono text-emerald-700 tracking-tight">
                +${estimatedInterestAccrued.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                <span>Net Portfolio Value:</span>
                <span className="font-mono font-bold text-stone-900">
                  ${totalValueWithInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Vault APY */}
          <div className="bg-white/95 rounded-2xl p-5 border border-amber-100/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium font-sans">Current Vault APY</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold font-mono text-amber-900 tracking-tight">
                {apyPct.toFixed(1)}%
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                <span>Yield Source:</span>
                <span className="font-mono font-semibold text-stone-800">Invoice Factoring Spreads</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Position Activity & Withdrawal Modal */}
      <AnimatePresence>
        {withdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white border border-amber-200/80 rounded-3xl shadow-2xl p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-amber-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 font-display">
                    Withdraw USDC Liquidity
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {txSuccess ? (
                <div className="space-y-4 py-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950">
                    <p className="text-sm font-bold flex items-center gap-2 text-emerald-900 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Withdrawal Settled
                    </p>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Successfully burned crdnUSDC shares and returned USDC to your connected Tempo wallet.
                    </p>
                    <p className="text-xs font-mono mt-2 text-amber-800">
                      Tx: {txSuccess.slice(0, 24)}…
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(false)}
                    className="w-full py-2.5 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                      <span>Amount to Withdraw:</span>
                      <span>
                        Available: <strong>${currentLentPrincipal.toLocaleString()} USDC</strong>
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm">$</span>
                      <input
                        type="number"
                        min={1}
                        max={currentLentPrincipal}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="w-full bg-white border border-amber-200 rounded-xl pl-8 pr-16 py-3 text-sm text-stone-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(currentLentPrincipal)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-amber-800 hover:text-amber-950 px-2 py-1 bg-amber-50 border border-amber-200 rounded-md cursor-pointer"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-stone-600 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Underlying USDC Received:</span>
                      <span className="font-mono font-semibold text-stone-900">${withdrawAmount.toLocaleString()} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>crdnUSDC Shares Burned:</span>
                      <span className="font-mono font-semibold text-stone-900">{withdrawAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gas Fee on Tempo:</span>
                      <span className="font-mono font-semibold text-emerald-700">0.00 USDC (Native)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawModalOpen(false)}
                      className="flex-1 py-3 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteWithdraw}
                      disabled={isWithdrawing || withdrawAmount <= 0 || withdrawAmount > currentLentPrincipal}
                      className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isWithdrawing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Withdrawing…</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Withdrawal</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
