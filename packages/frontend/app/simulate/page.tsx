"use client";

import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Zap, CheckCircle2, RefreshCw } from "lucide-react";
import { LogoMonolith } from "@/components/logos/LogoComponents";

type SettlementState = "idle" | "triggering" | "animating" | "done";

interface StreamEvent {
  time: number;
  label: string;
  amount?: string;
  type: "info" | "vault" | "borrower" | "tempo";
}

const GROSS_INVOICE = 45_000;
const PRINCIPAL = 36_000;
const INTEREST = 249; // ~30-day est.
const TOTAL_OWED = PRINCIPAL + INTEREST;
const SURPLUS = GROSS_INVOICE - TOTAL_OWED;

export default function SimulatePage() {
  const [state, setState] = useState<SettlementState>("idle");
  const [progress, setProgress] = useState(0); // 0 to 100
  const [vaultBalance, setVaultBalance] = useState(TOTAL_OWED);
  const [borrowerBalance, setBorrowerBalance] = useState(0);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const streamRef = useRef<NodeJS.Timeout | null>(null);

  const addEvent = (event: StreamEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 8));
  };

  async function runSimulation() {
    setState("triggering");
    setProgress(0);
    setVaultBalance(TOTAL_OWED);
    setBorrowerBalance(0);
    setEvents([]);

    await new Promise((r) => setTimeout(r, 800));
    setState("animating");

    // Phase 1: MPP intercepts payment
    addEvent({
      time: Date.now(),
      label: "Tempo MPP: Invoice payment intercepted",
      amount: `$${GROSS_INVOICE.toLocaleString()} USDC`,
      type: "tempo",
    });

    await new Promise((r) => setTimeout(r, 600));

    addEvent({
      time: Date.now(),
      label: "MPPStreamingRepayer: Computing interest accrual…",
      amount: `$${INTEREST} USDC (8.4% APR · 30 days)`,
      type: "info",
    });

    // Animate progress bar over 2 seconds
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, 33));
      const pct = (i / steps) * 100;
      setProgress(pct);

      // Midpoint: vault gets paid
      if (i === Math.floor(steps * 0.6)) {
        addEvent({
          time: Date.now(),
          label: "Credence Vault: Repayment received",
          amount: `$${TOTAL_OWED.toLocaleString()} USDC (principal + interest)`,
          type: "vault",
        });
        setVaultBalance(0);
      }

      // End: surplus to borrower
      if (i === steps) {
        addEvent({
          time: Date.now(),
          label: "Borrower wallet: Surplus released",
          amount: `$${SURPLUS.toLocaleString()} USDC`,
          type: "borrower",
        });
        setBorrowerBalance(SURPLUS);
      }
    }

    await new Promise((r) => setTimeout(r, 400));
    addEvent({
      time: Date.now(),
      label: "Settlement complete · Debt balance: $0",
      type: "info",
    });

    setState("done");
  }

  function reset() {
    setState("idle");
    setProgress(0);
    setVaultBalance(TOTAL_OWED);
    setBorrowerBalance(0);
    setEvents([]);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Brand Kicker & Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-stone-200/90 shadow-[0_2px_14px_rgba(0,0,0,0.06)] backdrop-blur-md mb-4">
          <div className="w-5 h-5 rounded-md bg-[#0E0C0A] flex items-center justify-center p-0.5 border border-stone-800">
            <LogoMonolith size={12} variant="white" />
          </div>
          <span className="text-xs font-mono font-medium text-stone-800 tracking-wide">
            CREDENCE <span className="opacity-40">·</span> PROTOCOL TELEMETRY
          </span>
        </div>

        {/* Heading with explicit font color change per user request */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-[#A8792A] via-[#C99738] to-[#92651A]">
          MPP Repayment Simulator
        </h1>
        <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed font-light max-w-3xl">
          Watch Tempo&apos;s Machine Payments Protocol automatically split an incoming invoice payment
          between vault repayment and borrower surplus in real time.
        </p>
      </div>

      {/* Scenario Card */}
      <div className="p-6 sm:p-7 rounded-3xl glass-panel-gold border border-amber-200/80 shadow-md mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-amber-100 mb-4">
          <h2 className="text-sm font-bold text-stone-900 font-display">
            Scenario: Profile A Invoice Settlement
          </h2>
          <span className="text-[11px] font-mono text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 font-semibold">
            Net-30 Invoice Clearance
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
          {[
            { label: "Invoice Face Value", value: `$${GROSS_INVOICE.toLocaleString()}`, color: "text-stone-900" },
            { label: "Principal Owed", value: `$${PRINCIPAL.toLocaleString()}`, color: "text-amber-800" },
            { label: "Accrued Interest (30d)", value: `$${INTEREST}`, color: "text-amber-700" },
            { label: "Borrower Surplus", value: `$${SURPLUS.toLocaleString()}`, color: "text-emerald-700" },
          ].map((item) => (
            <div key={item.label} className="bg-white/90 border border-amber-100/90 rounded-2xl p-4 shadow-xs">
              <p className={`text-xl font-bold font-mono tracking-tight mb-1 ${item.color}`}>{item.value}</p>
              <p className="text-xs text-stone-500 font-sans">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl glass-panel-gold border border-amber-200/80 shadow-md">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-800 mb-6">
          Tempo MPP Settlement Flow
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Customer Node */}
          <div className="text-center">
            <div
              className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-500 shadow-xs ${
                state === "done"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-amber-200 bg-white"
              }`}
            >
              <span className="text-2xl">🏢</span>
              <span className="text-[10px] text-stone-500 font-mono mt-1 font-semibold">Customer</span>
            </div>
            <p className="text-xs text-stone-500 mt-2 font-medium">Invoice Payer</p>
            <p className="text-sm font-bold font-mono text-stone-900 mt-0.5">${GROSS_INVOICE.toLocaleString()}</p>
          </div>

          {/* Track 1 */}
          <div className="hidden sm:flex flex-1 flex-col items-center mx-2">
            <div
              className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                state === "animating" || state === "done"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500"
                  : "bg-amber-100"
              }`}
            />
            <p className="text-[10px] font-mono text-stone-500 mt-1 font-semibold">Tempo MPP</p>
          </div>

          {/* MPP Repayer Node */}
          <div className="text-center">
            <div
              className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-500 shadow-xs ${
                state === "animating" || state === "done"
                  ? "border-amber-400 bg-amber-50 animate-pulse"
                  : "border-amber-200 bg-white"
              }`}
            >
              <span className="text-2xl">⚡</span>
              <span className="text-[10px] text-stone-500 font-mono mt-1 font-semibold">MPP Router</span>
            </div>
            <p className="text-xs text-stone-500 mt-2 font-medium">Smart Router</p>
          </div>

          {/* Track 2 */}
          <div className="hidden sm:flex flex-1 flex-col items-center mx-2">
            <div
              className={`w-full h-1.5 rounded-full transition-all duration-1000 ${
                progress > 50
                  ? "bg-gradient-to-r from-amber-500 to-emerald-500"
                  : "bg-amber-100"
              }`}
            />
            <p className="text-[10px] font-mono text-stone-500 mt-1 font-semibold">auto-split</p>
          </div>

          {/* Destination Nodes */}
          <div className="flex sm:flex-col gap-3">
            <div className="text-center">
              <div
                className={`w-24 h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-500 shadow-xs ${
                  vaultBalance === 0 ? "border-emerald-500 bg-emerald-50" : "border-amber-200 bg-white"
                }`}
              >
                <span className="text-lg">🏛️</span>
                <span className="text-[10px] text-stone-500 font-mono mt-0.5 font-semibold">Senior Vault</span>
              </div>
              <p
                className={`text-xs font-bold font-mono mt-1 transition-all duration-500 ${
                  vaultBalance === 0 ? "text-emerald-700" : "text-amber-800"
                }`}
              >
                ${vaultBalance === 0 ? TOTAL_OWED.toLocaleString() : "0"} {vaultBalance === 0 ? "✓" : ""}
              </p>
            </div>

            <div className="text-center">
              <div
                className={`w-24 h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-500 shadow-xs ${
                  borrowerBalance > 0 ? "border-emerald-500 bg-emerald-50" : "border-amber-200 bg-white"
                }`}
              >
                <span className="text-lg">💼</span>
                <span className="text-[10px] text-stone-500 font-mono mt-0.5 font-semibold">Borrower</span>
              </div>
              <p
                className={`text-xs font-bold font-mono mt-1 transition-all duration-500 ${
                  borrowerBalance > 0 ? "text-emerald-700" : "text-stone-400"
                }`}
              >
                ${borrowerBalance.toLocaleString()} {borrowerBalance > 0 ? "✓" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {state !== "idle" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="flex justify-between text-xs font-mono text-stone-500 mb-2">
            <span>Streaming Settlement Progress</span>
            <span className="font-bold text-amber-900">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2.5 bg-amber-100/70 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-[#D4AF37] to-emerald-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* Event Stream Terminal */}
      {events.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 rounded-3xl bg-[#1C1814] border border-amber-900/40 text-xs font-mono text-amber-200/90 shadow-inner"
        >
          <div className="flex justify-between items-center pb-2.5 border-b border-amber-900/30 text-[11px] text-amber-500/80 mb-3 font-semibold">
            <span>LIVE SETTLEMENT STREAM</span>
            <span className="text-emerald-400">TEMPO_MPP_ACTIVE</span>
          </div>
          <div className="space-y-2">
            {events.map((event, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-xs leading-relaxed ${
                  event.type === "vault"
                    ? "text-amber-300"
                    : event.type === "borrower"
                    ? "text-emerald-400"
                    : event.type === "tempo"
                    ? "text-[#E5C158]"
                    : "text-stone-300"
                }`}
              >
                <span className="font-mono text-stone-500">{new Date(event.time).toLocaleTimeString()}</span>
                <span className="text-stone-600">›</span>
                <span>{event.label}</span>
                {event.amount && (
                  <span className="ml-auto font-bold font-mono">{event.amount}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA Action Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        {state === "idle" && (
          <button
            type="button"
            onClick={runSimulation}
            className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            ▶ Customer Pays $45,000 Invoice via Tempo Rails
          </button>
        )}

        {state === "triggering" && (
          <div className="px-6 py-3.5 bg-amber-100 text-amber-950 border border-amber-300 font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2.5">
            <RefreshCw className="w-3.5 h-3.5 text-amber-700 animate-spin" />
            <span>Initiating MPP settlement…</span>
          </div>
        )}

        {state === "animating" && (
          <div className="px-6 py-3.5 bg-amber-100 text-amber-950 border border-amber-300 font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2.5">
            <RefreshCw className="w-3.5 h-3.5 text-amber-700 animate-spin" />
            <span>Streaming settlement via Tempo MPP…</span>
          </div>
        )}

        {state === "done" && (
          <>
            <div className="px-6 py-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settlement Complete · Debt: $0</span>
            </div>
            <button
              type="button"
              onClick={reset}
              className="px-5 py-3.5 border border-stone-300 text-stone-700 hover:text-stone-950 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </>
        )}
      </div>

      <p className="text-xs text-stone-500 mt-4 flex items-center gap-1.5 font-sans">
        <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Settled via Tempo Machine Payments Protocol (MPP) · Zero gas tokens required</span>
      </p>
    </div>
  );
}
