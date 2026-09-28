"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lock,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LogoMonolith } from "@/components/logos/LogoComponents";
import type { CreditDecision, VerificationStep } from "@/lib/zktls";
import { useCredenceAccount } from "@/lib/useCredenceAccount";

// -- Types ----------------------------------------------------------------------
type Step = "select" | "verifying" | "approved" | "rejected" | "drawing" | "drawn";

type Profile = {
  label: string;
  source: string;
  description: string;
  revenue: string;
  disputeRate: string;
  invoiceAmount: string;
  expectedOutcome: "APPROVED" | "REJECTED";
};

const PROFILES: Profile[] = [
  {
    label: "Profile A: Prime SaaS",
    source: "Stripe API",
    description: "Acme SaaS Inc. · Enterprise software company · Stripe revenue stream",
    revenue: "$150,000",
    disputeRate: "0.05%",
    invoiceAmount: "$45,000",
    expectedOutcome: "APPROVED",
  },
  {
    label: "Profile B: Mid-Market Logistics",
    source: "QuickBooks Online",
    description: "FastFreight LLC · B2B logistics & freight · QuickBooks general ledger",
    revenue: "$80,000",
    disputeRate: "0.40%",
    invoiceAmount: "$25,000",
    expectedOutcome: "APPROVED",
  },
  {
    label: "Profile C: High-Risk",
    source: "Banking Invoice",
    description: "QuickDropShip Co. · Consumer retail · Verified bank statement & invoice",
    revenue: "$30,000",
    disputeRate: "2.80%",
    invoiceAmount: "$10,000",
    expectedOutcome: "REJECTED",
  },
];

// -- Verification Step Animation -----------------------------------------------
function VerificationPipeline({
  steps,
  currentStep,
}: {
  steps: VerificationStep[];
  currentStep: number;
}) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <motion.div
            key={step.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className={`flex items-start gap-3.5 p-4 rounded-2xl transition-all duration-300 ${
              isDone
                ? "bg-emerald-50/90 border border-emerald-200 shadow-xs"
                : isActive
                ? "bg-amber-50/90 border border-amber-300 shadow-sm ring-1 ring-amber-300/60 animate-pulse"
                : "bg-white/60 border border-stone-200/80 opacity-50"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                isDone
                  ? "bg-emerald-600 text-white"
                  : isActive
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "bg-stone-200 text-stone-500"
              }`}
            >
              {isDone ? "✓" : isActive ? "…" : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold tracking-tight ${
                  isDone
                    ? "text-emerald-950"
                    : isActive
                    ? "text-amber-950 font-bold"
                    : "text-stone-500"
                }`}
              >
                {step.label}
              </p>
              {(isDone || isActive) && (
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{step.detail}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// -- Term Sheet ----------------------------------------------------------------
function TermSheet({
  decision,
  onDraw,
  isDrawing,
  txHash,
}: {
  decision: CreditDecision;
  onDraw: (amount: number) => void;
  isDrawing: boolean;
  txHash?: string;
}) {
  const [drawAmount, setDrawAmount] = useState(
    decision.terms?.advanceAmountUsd ?? 0
  );
  const [showProof, setShowProof] = useState(false);
  const { address, isDemo } = useCredenceAccount();
  const terms = decision.terms!;
  const attestation = decision.attestation;
  const source = decision.redactedPayload?.sourceType || "Stripe";

  return (
    <div className="space-y-6">
      {/* Approved Facility Card */}
      <div className="p-7 rounded-3xl glass-panel-gold border border-amber-200/80 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-amber-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-display">
                Credit Facility Approved
              </h3>
              <p className="text-xs text-stone-500">
                Zero-knowledge proof verified on Tempo blockchain
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full">
            {terms.advanceRatePct}% Advance Rate
          </span>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-5 pb-2">
          {[
            { label: "Approved Limit", value: `$${terms.advanceAmountUsd.toLocaleString()} USDC`, highlight: true },
            { label: "Advance Rate", value: `${terms.advanceRatePct}%` },
            { label: "Annual Rate (APR)", value: `${terms.aprPct.toFixed(2)}%` },
            { label: "Invoice Face Value", value: `$${terms.invoiceFaceValueUsd.toLocaleString()}` },
            { label: "Est. 30-Day Interest", value: `$${terms.estimatedInterestUsd}` },
            { label: "Est. Borrower Surplus", value: `$${terms.netBorrowerSurplusUsd.toLocaleString()}`, highlight: true },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/90 border border-amber-100 rounded-2xl p-4 shadow-xs"
            >
              <p className="text-xs text-stone-500 mb-1">{item.label}</p>
              <p
                className={`text-base font-bold font-mono tracking-tight ${
                  item.highlight ? "text-amber-900" : "text-stone-900"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* zkTLS Cryptographic Proof Inspector */}
        <div className="mt-5 pt-4 border-t border-amber-100">
          <button
            type="button"
            onClick={() => setShowProof(!showProof)}
            className="flex items-center justify-between w-full text-xs font-mono text-amber-800 hover:text-amber-900 transition-colors cursor-pointer"
          >
            <span className="font-semibold flex items-center gap-1.5">
              {showProof ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showProof ? "Hide Cryptographic Attestation" : "View zkTLS Proof Payload (PII Redacted)"}
            </span>
            <span className="text-stone-400">Source: {source} · EIP-712</span>
          </button>

          {showProof && attestation && (
            <div className="mt-3.5 p-4 rounded-2xl bg-[#1C1814] border border-amber-900/40 font-mono text-xs text-amber-200/90 space-y-2.5 shadow-inner">
              <div className="flex justify-between items-center pb-2 border-b border-amber-900/30 text-[11px] text-amber-500/80">
                <span>TLSNOTARY PROOF ENVELOPE</span>
                <span className="text-emerald-400">SIGNATURE_VALID</span>
              </div>
              <div>
                <span className="text-stone-400">Verified Revenue Source: </span>
                <span className="text-amber-300 font-semibold">{source}</span>
              </div>
              <div>
                <span className="text-stone-400">Business Entity Hash: </span>
                <span className="text-emerald-400 break-all">{attestation.businessIdHash}</span>
              </div>
              <div>
                <span className="text-stone-400">Invoice Hash: </span>
                <span className="text-amber-300 break-all">{attestation.invoiceHashHex}</span>
              </div>
              <div>
                <span className="text-stone-400">Verified Revenue: </span>
                <span className="text-white font-semibold">
                  ${decision.redactedPayload?.trailing90dRevenue.toLocaleString()} USDC
                </span>
              </div>
              <div>
                <span className="text-stone-400">Customer Records / Tax IDs: </span>
                <span className="text-amber-400 font-semibold">[REDACTED IN TLSNOTARY SESSION]</span>
              </div>
              <div>
                <span className="text-stone-400">Notary Signature: </span>
                <span className="text-stone-400 break-all">{attestation.signature}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Draw Funds Card */}
      <div className="p-7 rounded-3xl glass-panel-gold border border-amber-200/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
          <h4 className="text-base font-bold text-stone-900 font-display">
            Draw Funds into Borrower Wallet
          </h4>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 border border-amber-200/80 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${isDemo ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
            <span className="text-stone-500">Destination:</span>
            <span className="font-bold text-stone-900">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "0x71C8...9B28"}
            </span>
          </div>
        </div>
        <p className="text-xs text-stone-600 mb-5 leading-relaxed">
          Instant liquidity drawn directly from connected infrastructure vaults (Aave, Morpho, ERC-4626) on Tempo.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-mono">$</span>
            <input
              type="number"
              value={drawAmount}
              onChange={(e) => setDrawAmount(Number(e.target.value))}
              max={terms.advanceAmountUsd}
              min={1}
              className="w-full bg-white border border-amber-200/90 rounded-xl pl-8 pr-3 py-3 text-sm text-stone-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <button
            type="button"
            onClick={() => onDraw(drawAmount)}
            disabled={isDrawing || drawAmount <= 0 || drawAmount > terms.advanceAmountUsd}
            className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDrawing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting to Tempo…</span>
              </>
            ) : (
              <>
                <span>Draw USDC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-stone-500 mt-4 flex items-center gap-1.5 font-sans">
          <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Zero Gas Tokens Required: Transaction fees settled natively in USDC on Tempo</span>
        </p>
      </div>

      {/* Transaction Success Alert */}
      {txHash && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-xs"
        >
          <p className="text-sm font-bold text-emerald-900 mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Funds Drawn Successfully
          </p>
          <p className="text-xs text-stone-600">
            Tempo Tx:{" "}
            <a
              href={`https://explorer.moderato.tempo.xyz/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 underline font-mono hover:text-amber-900 font-medium"
            >
              {txHash.slice(0, 24)}…
            </a>
          </p>
        </motion.div>
      )}
    </div>
  );
}

// -- Main Page ------------------------------------------------------------------
export default function BorrowerPage() {
  const [step, setStep] = useState<Step>("select");
  const [, setSelectedProfile] = useState<number | null>(null);
  const [verificationStep, setVerificationStep] = useState(0);
  const [pipelineSteps, setPipelineSteps] = useState<VerificationStep[]>([]);
  const [decision, setDecision] = useState<CreditDecision | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();

  async function runVerification(profileIdx: number) {
    setSelectedProfile(profileIdx);
    setStep("verifying");
    setVerificationStep(0);
    setDecision(null);

    const profile = PROFILES[profileIdx];
    let sourceEndpoint = "api.stripe.com";
    if (profile.source.includes("QuickBooks")) {
      sourceEndpoint = "quickbooks.api.intuit.com";
    } else if (profile.source.includes("Banking")) {
      sourceEndpoint = "openbanking.fintech-gateway.net";
    }

    // Initial placeholder steps while zkTLS engine computes
    const initialSteps: VerificationStep[] = [
      {
        id: "tls_handshake",
        label: "Initiating TLS Session Handshake…",
        detail: `Connecting to ${sourceEndpoint} over TLS 1.3`,
        status: "verified",
      },
      {
        id: "pii_redaction",
        label: "Redacting Sensitive Customer & Banking Records…",
        detail: "Removing PII before cryptographic hashing",
        status: "redacted",
      },
    ];
    setPipelineSteps(initialSteps);

    // Call the zkTLS engine bridge
    const { runZkAttestation } = await import("@/lib/zktls");
    const result = await runZkAttestation(profileIdx as 0 | 1 | 2);

    const fullSteps = result.verificationSteps ?? initialSteps;
    setPipelineSteps(fullSteps);

    // Animate through the real verified steps
    for (let i = 0; i <= fullSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 650));
      setVerificationStep(i);
    }

    setDecision(result);
    setStep(result.approved ? "approved" : "rejected");
  }

  async function handleDraw(amount: number) {
    setIsDrawing(true);
    // Simulate transaction execution on Tempo
    await new Promise((r) => setTimeout(r, 2000));
    const fakeTxHash =
      "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setTxHash(fakeTxHash);
    setIsDrawing(false);
    setStep("drawn");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Brand Kicker & Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-stone-200/90 shadow-[0_2px_14px_rgba(0,0,0,0.06)] backdrop-blur-md mb-4">
          <div className="w-5 h-5 rounded-md bg-[#0E0C0A] flex items-center justify-center p-0.5 border border-stone-800">
            <LogoMonolith size={12} variant="white" />
          </div>
          <span className="text-xs font-mono font-medium text-stone-800 tracking-wide">
            CREDENCE <span className="opacity-40">·</span> BORROWER PORTAL
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-display">
          Borrower Facility{" "}
          <span className="font-accent italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#A8792A] via-[#C99738] to-[#92651A]">
            zkTLS Underwriting
          </span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed font-light max-w-2xl">
          Verify your cash flow from Stripe, QuickBooks, or banking invoices with zero-knowledge attestations and unlock instant USDC financing on Tempo.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
        {[
          { id: "select", label: "Select Profile" },
          { id: "verifying", label: "ZK Verification" },
          { id: "approved", label: "Credit Terms" },
          { id: "drawn", label: "Funds Drawn" },
        ].map((s, i) => {
          const stepOrder = ["select", "verifying", "approved", "drawn"];
          const currentIdx = stepOrder.indexOf(step);
          const isDone = stepOrder.indexOf(s.id) < currentIdx;
          const isActive = s.id === step || (step === "drawing" && s.id === "approved");
          return (
            <div key={s.id} className="flex items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? "bg-emerald-600 text-white shadow-xs"
                      : isActive
                      ? "bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] text-stone-950 font-bold shadow-[0_2px_12px_rgba(212,175,55,0.35)]"
                      : "bg-white border border-stone-200 text-stone-400"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <span
                  className={`text-xs ${
                    isActive
                      ? "text-stone-900 font-bold"
                      : isDone
                      ? "text-stone-700 font-medium"
                      : "text-stone-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < 3 && <div className="w-10 h-px bg-amber-200/70 mx-3" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Profile Selection */}
      {step === "select" && (
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold mb-4">
            Select a verified revenue profile (Stripe, QuickBooks, or Banking Invoices) to test the zkTLS attestation pipeline:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROFILES.map((profile, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={() => runVerification(i)}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`p-6 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  profile.expectedOutcome === "REJECTED"
                    ? "bg-white/80 border-red-200 hover:border-red-300 hover:shadow-lg hover:shadow-red-900/5"
                    : "glass-panel-gold border-amber-200/70 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-900/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-xs font-mono font-medium text-amber-900 px-2.5 py-0.5 bg-amber-50 border border-amber-200/80 rounded-md">
                      {profile.source}
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                        profile.expectedOutcome === "APPROVED"
                          ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                          : "text-red-700 bg-red-50 border border-red-200"
                      }`}
                    >
                      {profile.expectedOutcome === "APPROVED" ? "ELIGIBLE" : "HIGH RISK"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 font-display mb-1">
                    {profile.label}
                  </h3>
                  <p className="text-xs text-stone-500 mb-5 leading-relaxed font-light">
                    {profile.description}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-amber-100/80">
                    {[
                      { label: "90d Volume", value: profile.revenue },
                      { label: "Dispute Rate", value: profile.disputeRate },
                      { label: "Invoice Value", value: profile.invoiceAmount },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-xs">
                        <span className="text-stone-500">{item.label}</span>
                        <span className="text-stone-900 font-mono font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-amber-100/70 flex items-center justify-between text-xs font-semibold text-amber-800 group">
                  <span>Verify with zkTLS</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Verification Pipeline Animation */}
      {step === "verifying" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto rounded-3xl glass-panel-gold p-7 border border-amber-200/80 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6 p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl">
            <RefreshCw className="w-5 h-5 text-amber-700 animate-spin" />
            <div>
              <h2 className="text-sm font-bold text-amber-950 font-display">
                Running zkTLS TLSNotary Proof Verification…
              </h2>
              <p className="text-xs text-stone-600">
                Evaluating authentic revenue without disclosing private ledgers.
              </p>
            </div>
          </div>
          <VerificationPipeline steps={pipelineSteps} currentStep={verificationStep} />
        </motion.div>
      )}

      {/* Step 3a: Approved */}
      {(step === "approved" || step === "drawing" || step === "drawn") && decision?.approved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <TermSheet
            decision={decision}
            onDraw={handleDraw}
            isDrawing={isDrawing}
            txHash={txHash}
          />
        </motion.div>
      )}

      {/* Step 3b: Rejected */}
      {step === "rejected" && !decision?.approved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          <div className="p-7 rounded-3xl bg-white border border-red-200 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <XCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-display">Credit Facility Declined</h3>
            </div>
            <p className="text-sm text-stone-700 mb-4 leading-relaxed">{decision?.rejectionReason}</p>
            <p className="text-xs text-stone-500 leading-relaxed">
              No on-chain transaction was submitted to Tempo. Your financial metrics were verified client-side via zkTLS and rejected prior to state commitment.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStep("select")}
            className="mt-5 px-5 py-2.5 text-xs font-semibold text-stone-800 hover:text-stone-950 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 shadow-xs transition-all cursor-pointer"
          >
            ← Select Another Profile
          </button>
        </motion.div>
      )}

      {/* Back button */}
      {step !== "select" && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setStep("select");
              setDecision(null);
              setTxHash(undefined);
            }}
            className="text-xs font-medium text-stone-500 hover:text-amber-800 transition-colors cursor-pointer"
          >
            ← Back to profile selection
          </button>
        </div>
      )}
    </div>
  );
}
