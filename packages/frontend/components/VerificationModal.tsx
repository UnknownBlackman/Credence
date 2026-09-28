"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { X, Lock, RefreshCw, CheckCircle2, Copy, ArrowRight } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  initialRevenue?: number;
  initialSource?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  initialAmount = 1000000,
  initialRevenue = 250000,
  initialSource = 'stripe',
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [source, setSource] = useState(initialSource);
  const [companyName, setCompanyName] = useState('Acme Cloud Inc.');
  const [requestedAmount, setRequestedAmount] = useState(initialAmount);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialAmount) setRequestedAmount(initialAmount);
    if (initialSource) setSource(initialSource);
  }, [initialAmount, initialSource, isOpen]);

  useEffect(() => {
    if (step === 2) {
      setTerminalLogs([]);
      let endpoint = `api.${source}.com`;
      if (source === 'quickbooks') endpoint = 'quickbooks.api.intuit.com';
      if (source === 'banking') endpoint = 'openbanking.fintech-gateway.net';

      const logs = [
        `[1/5] Establishing local TLS 1.3 handshake with ${endpoint}...`,
        `[2/5] Authenticity verified with Certificate Authority signature (0x8fa3...c2)`,
        `[3/5] zkTLS selective disclosure redacting customer PII, invoices & bank accounts...`,
        `[4/5] Arcium MPC cluster evaluating 12-month net revenue commitment ($${(requestedAmount / 3.4).toFixed(0)} MRR)...`,
        `[5/5] Connected liquidity router pre-funding draw from Aave v3 & Morpho vaults...`,
        `[SUCCESS] Debt capacity verified: $${requestedAmount.toLocaleString()} USDC at 7.8% APR.`,
        `[CREDENCE] Facility activated on Tempo Smart Contract block #4,198,203.`,
      ];

      let i = 0;
      const timer = setInterval(() => {
        if (i < logs.length) {
          const nextLog = logs[i];
          setTerminalLogs((prev) => [...prev, nextLog]);
          i++;
        } else {
          clearInterval(timer);
          setTimeout(() => setStep(3), 700);
        }
      }, 550);

      return () => clearInterval(timer);
    }
  }, [step, source, requestedAmount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-900/40 backdrop-blur-md">
      
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl bg-white border border-amber-200/80 rounded-3xl shadow-2xl shadow-amber-950/20 overflow-hidden my-8"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900">
              Credence zkTLS Credit Request
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step progress pills */}
        <div className="grid grid-cols-3 border-b border-amber-100 text-center text-xs font-mono">
          <div className={`py-3 px-2 border-r border-amber-100 ${step === 1 ? 'bg-amber-50 text-amber-900 font-bold border-b-2 border-b-amber-500' : 'text-stone-400'}`}>
            01. Revenue Feed
          </div>
          <div className={`py-3 px-2 border-r border-amber-100 ${step === 2 ? 'bg-amber-50 text-amber-900 font-bold border-b-2 border-b-amber-500' : 'text-stone-400'}`}>
            02. zkTLS + MPC
          </div>
          <div className={`py-3 px-2 ${step === 3 ? 'bg-amber-50 text-amber-900 font-bold border-b-2 border-b-amber-500' : 'text-stone-400'}`}>
            03. Credit Facility
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          
          {/* STEP 1: Connect Source & Request Line */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-stone-900 font-display">
                  Connect Corporate Revenue Feed
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Choose your provider. Verified locally in your browser - zero credentials stored.
                </p>
              </div>

              {/* Feed Selection */}
              <div>
                <span className="text-xs font-mono uppercase font-semibold text-stone-700 block mb-2">
                  Accounting & Invoicing Source
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'stripe', name: 'Stripe Billing' },
                    { id: 'quickbooks', name: 'QuickBooks' },
                    { id: 'banking', name: 'Banking Invoices' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSource(s.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                        source === s.id
                          ? 'bg-amber-50 border-amber-400 text-amber-950 font-semibold shadow-xs ring-1 ring-amber-300'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <div>{s.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">TLS 1.3 Verified</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Company & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase font-semibold text-stone-700 block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase font-semibold text-stone-700 block mb-1">
                    Credit Facility (USDC)
                  </label>
                  <input
                    type="number"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    step={25000}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:border-amber-500 font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Knowledge Guarantee:</strong> Raw invoice line items, bank transactions, and customer records are mathematically redacted locally before proof submission.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Initiate zkTLS Verification</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            </div>
          )}

          {/* STEP 2: Interactive Terminal Proof Generation */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 font-display">
                    Attesting Session & Executing MPC...
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Proving authentic revenue without disclosing private ledgers.
                  </p>
                </div>
                <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
              </div>

              {/* Clean Dark Enclave Terminal with Gold Logs */}
              <div className="p-4 rounded-2xl bg-[#1C1814] border border-amber-900/40 font-mono text-xs text-amber-200/90 min-h-[220px] max-h-[250px] overflow-y-auto space-y-2 shadow-inner">
                <div className="text-[11px] text-amber-500/70 pb-2 border-b border-amber-900/30 flex justify-between">
                  <span>SESSION: LOCAL_CLIENT_TLS13</span>
                  <span className="text-emerald-400">ENCLAVE_ACTIVE</span>
                </div>
                {terminalLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>

              <div className="text-center text-[11px] font-mono text-stone-400">
                Arcium decentralized MPC consensus running across 3 independent nodes...
              </div>
            </div>
          )}

          {/* STEP 3: Approved & Minted on Tempo */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center mb-3 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 font-display">
                  Credit Facility Approved!
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Settled on Tempo Blockchain in 610ms. Zero corporate secrets disclosed.
                </p>
              </div>

              {/* Receipt terms in gold */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                  <span className="text-xs text-stone-500">Approved Credit Line</span>
                  <span className="text-2xl font-mono font-bold text-stone-900 tabular-nums">
                    ${requestedAmount.toLocaleString()} USDC
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Interest Rate</span>
                    <span className="font-mono text-stone-800 font-semibold">7.8% APR</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Crypto Collateral</span>
                    <span className="font-mono text-emerald-600 font-bold">$0.00 (Zero)</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Liquidity Vaults</span>
                    <span className="font-mono text-stone-800 text-[11px]">Aave v3 + Morpho</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Tempo Network</span>
                    <span className="font-mono text-stone-800">Finality &lt; 650ms</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Transaction Copied!' : 'Copy Tempo Facility Receipt'}</span>
                </button>

                <Link
                  href="/borrower"
                  className="py-3 px-5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Launch App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    onClose();
                  }}
                  className="px-5 py-3 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

      </motion.div>

    </div>
  );
};
