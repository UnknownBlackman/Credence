"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Landmark,
  Clock,
  Percent,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { useBorrowerDashboard, type BorrowerLoan } from "@/lib/useFinancialDashboard";

interface BorrowerDashboardProps {
  accountAddress?: string;
  onNewDrawRequest?: () => void;
}

export function BorrowerDashboard({
  accountAddress,
  onNewDrawRequest,
}: BorrowerDashboardProps) {
  const {
    activeLoans,
    loans,
    totalWithdrawn,
    totalOutstandingPrincipal,
    totalInterestToRepay,
    totalDue,
    nextDueDate,
    repayLoan,
    currentTime,
  } = useBorrowerDashboard(accountAddress);

  const [repayingLoanId, setRepayingLoanId] = useState<string | null>(null);
  const [repaySuccessTx, setRepaySuccessTx] = useState<{ id: string; txHash: string } | null>(null);
  const [showLoanHistory, setShowLoanHistory] = useState(false);

  // Time formatting helper
  const formatDueDate = (timestamp: number | null) => {
    if (!timestamp) return "No active debt";
    const diffMs = timestamp - currentTime;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const dateStr = new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (diffDays < 0) {
      return `${Math.abs(diffDays)}d overdue (${dateStr})`;
    }
    if (diffDays === 0) {
      return `Due today (${dateStr})`;
    }
    return `In ${diffDays} days (${dateStr})`;
  };

  const handleRepay = async (loan: BorrowerLoan) => {
    setRepayingLoanId(loan.id);
    setRepaySuccessTx(null);

    // Simulate transaction execution on Tempo
    await new Promise((r) => setTimeout(r, 2000));
    const tx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    repayLoan(loan.id);
    setRepaySuccessTx({ id: loan.id, txHash: tx });
    setRepayingLoanId(null);
  };

  const hasHistory = loans.length > 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Banner & Metric Cards */}
      <div className="rounded-3xl glass-panel-gold border border-amber-200/90 p-7 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-300/80">
                Borrower Account Position
              </span>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                Live on Tempo
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display">
              Credit Facility Performance
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Summary of all drawn capital, accrued underwriting interest, and scheduled factoring settlements.
            </p>
          </div>

          {onNewDrawRequest && (
            <button
              type="button"
              onClick={onNewDrawRequest}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0 font-sans"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Draw Another Invoice</span>
            </button>
          )}
        </div>

        {/* 3 Core Required Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {/* 1. Total Withdrawn */}
          <div className="bg-white/95 rounded-2xl p-5 border border-amber-100/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium font-sans">Total Withdrawn</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold font-mono text-stone-900 tracking-tight">
                ${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                <span>Active Principal:</span>
                <span className="font-mono font-semibold text-stone-800">
                  ${totalOutstandingPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Interest to Repay */}
          <div className="bg-white/95 rounded-2xl p-5 border border-amber-100/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium font-sans">Interest to Repay</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold font-mono text-amber-900 tracking-tight">
                ${totalInterestToRepay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                <span>Total Balance Due:</span>
                <span className="font-mono font-bold text-stone-900">
                  ${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Expected Time to Repay */}
          <div className="bg-white/95 rounded-2xl p-5 border border-amber-100/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium font-sans">Expected Time to Repay</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold font-mono text-stone-900 tracking-tight">
                {formatDueDate(nextDueDate)}
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                <span>Active Facilities:</span>
                <span className="font-mono font-semibold text-stone-800">
                  {activeLoans.length} {activeLoans.length === 1 ? "line" : "lines"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Borrowing Facilities List */}
      <div className="rounded-3xl bg-white/95 border border-amber-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900 font-display">
              Active Drawn Facilities ({activeLoans.length})
            </h3>
          </div>
          {loans.length > activeLoans.length && (
            <button
              type="button"
              onClick={() => setShowLoanHistory(!showLoanHistory)}
              className="text-xs font-mono text-amber-800 hover:text-amber-950 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{showLoanHistory ? "Hide Settled" : "View Settled History"}</span>
              {showLoanHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {repaySuccessTx && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Principal repaid and settled successfully on Tempo.</span>
            </div>
            <a
              href={`https://explorer.moderato.tempo.xyz/tx/${repaySuccessTx.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-semibold underline text-amber-900 hover:text-amber-950 inline-flex items-center gap-1"
            >
              <span>Tx Receipt</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        )}

        {activeLoans.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200">
            <ShieldCheck className="w-8 h-8 text-amber-700/60 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">No Outstanding Debt</p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Your account has zero active borrowing lines. Select an invoice profile to verify with zkTLS and draw instant liquidity.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeLoans.map((loan) => {
              const elapsedDays = Math.max(1, (currentTime - loan.withdrawnAt) / (1000 * 60 * 60 * 24));
              const effectiveDays = Math.max(7, elapsedDays);
              const loanInterest = (loan.remainingPrincipal * (loan.aprPct / 100) * effectiveDays) / 365;
              const loanTotalDue = loan.remainingPrincipal + loanInterest;
              const isRepaying = repayingLoanId === loan.id;

              return (
                <div
                  key={loan.id}
                  className="p-5 rounded-2xl border border-amber-100 hover:border-amber-300 bg-stone-50/60 hover:bg-white transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {loan.source}
                      </span>
                      <span className="text-sm font-bold text-stone-900 font-display">
                        {loan.facilityLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs text-stone-500">
                      <div>
                        <span>Principal: </span>
                        <strong className="font-mono text-stone-800">
                          ${loan.remainingPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div>
                        <span>Accrued Interest: </span>
                        <strong className="font-mono text-amber-800">
                          +${loanInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div>
                        <span>Fixed APR: </span>
                        <strong className="font-mono text-stone-800">{loan.aprPct.toFixed(2)}%</strong>
                      </div>
                      <div>
                        <span>Due: </span>
                        <strong className="font-mono text-stone-800">{formatDueDate(loan.dueDate)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleRepay(loan)}
                      disabled={isRepaying}
                      className="px-4 py-2 text-xs font-semibold text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isRepaying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Repaying…</span>
                        </>
                      ) : (
                        <>
                          <span>Repay (${loanTotalDue.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Settled loans history accordion */}
        {showLoanHistory && (
          <div className="mt-6 pt-5 border-t border-amber-100/80 space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2 font-semibold">
              Settled Loans History
            </h4>
            {loans.filter((l) => l.status === "repaid").map((loan) => (
              <div
                key={loan.id}
                className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between text-stone-600"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-stone-800">{loan.facilityLabel}</span>
                  <span className="text-stone-400">·</span>
                  <span className="font-mono">${loan.withdrawnAmount.toLocaleString()} USDC</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 font-medium">Repaid in Full</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
