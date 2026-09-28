"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building,
  Coins,
  Loader2,
} from "lucide-react";
import { LogoMonolith } from "@/components/logos/LogoComponents";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  initialRevenue?: number;
  initialSource?: string;
}

type UserRole = "borrower" | "lender" | "partner";

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  initialAmount = 1000000,
  initialRevenue = 250000,
  initialSource = "stripe",
}) => {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState<UserRole>("borrower");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError("Please enter a valid work or corporate email address.");
      return;
    }

    setLoading(true);

    // Simulate instant network submission
    await new Promise((r) => setTimeout(r, 900));

    try {
      const waitlistEntry = {
        email: email.trim(),
        companyName: companyName.trim(),
        role,
        requestedFacility: initialAmount,
        monthlyRevenue: initialRevenue,
        revenueSource: initialSource,
        timestamp: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem("credence_waitlist") || "[]");
      existing.push(waitlistEntry);
      localStorage.setItem("credence_waitlist", JSON.stringify(existing));
    } catch {
      // localStorage fallback
    }

    setLoading(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setEmail("");
    setCompanyName("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white border border-amber-200/90 rounded-3xl shadow-2xl shadow-amber-950/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0E0C0A] flex items-center justify-center p-1 border border-stone-800">
                  <LogoMonolith size={16} variant="white" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900">
                  Credence Early Access
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {!submitted ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold font-display text-stone-900 tracking-tight">
                      Join the Priority Waitlist
                    </h3>
                    <p className="text-xs text-stone-600 mt-1.5 leading-relaxed font-light">
                      Get early access to undercollateralized corporate credit facilities and privacy-preserving zkTLS revenue verification on Tempo.
                    </p>
                  </div>

                  {/* Estimated parameters pill if came from simulator */}
                  {initialAmount > 0 && (
                    <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="text-stone-600 font-sans">
                          Estimated Facility Target:
                        </span>
                      </div>
                      <span className="font-mono font-bold text-stone-900">
                        ${initialAmount.toLocaleString()} USDC
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-semibold text-stone-500 mb-2">
                        I am applying as
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "borrower", label: "Borrower", icon: Building },
                          { id: "lender", label: "Liquidity Allocator", icon: Coins },
                          { id: "partner", label: "Partner / Infra", icon: ShieldCheck },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isSelected = role === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setRole(item.id as UserRole)}
                              className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                                isSelected
                                  ? "bg-amber-50/90 border-amber-400 text-stone-900 shadow-xs ring-1 ring-amber-300"
                                  : "bg-white border-amber-100 hover:border-amber-300 text-stone-600"
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 mb-1.5 ${
                                  isSelected ? "text-amber-800" : "text-stone-400"
                                }`}
                              />
                              <span className="text-[11px] font-medium leading-tight">
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Work Email */}
                    <div>
                      <label
                        htmlFor="waitlist-email"
                        className="block text-[11px] font-mono uppercase font-semibold text-stone-500 mb-1.5"
                      >
                        Corporate / Work Email <span className="text-amber-700">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="waitlist-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@company.com"
                          className="w-full bg-white border border-amber-200/90 rounded-xl pl-10 pr-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-sans shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Company / Fund Name */}
                    <div>
                      <label
                        htmlFor="waitlist-company"
                        className="block text-[11px] font-mono uppercase font-semibold text-stone-500 mb-1.5"
                      >
                        Company / Fund Name <span className="text-stone-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="waitlist-company"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Technologies Inc."
                        className="w-full bg-white border border-amber-200/90 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-sans shadow-xs"
                      />
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                        {error}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Securing Priority Spot...</span>
                        </>
                      ) : (
                        <>
                          <span>Join Priority Waitlist</span>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-[11px] text-stone-500 text-center mt-4">
                    Strict privacy guaranteed. 0 bytes of sensitive corporate credentials stored.
                  </p>
                </div>
              ) : (
                /* Success State */
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full inline-block mb-2">
                    Priority Confirmation
                  </span>

                  <h3 className="text-2xl font-bold font-display text-stone-900">
                    You are on the Waitlist!
                  </h3>

                  <p className="text-xs text-stone-600 mt-2 max-w-sm mx-auto leading-relaxed">
                    We have reserved your allocation priority. We will notify you at <strong className="text-stone-900">{email}</strong> as soon as the next cohort opens.
                  </p>

                  <div className="mt-7 pt-6 border-t border-amber-100 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/borrower"
                      onClick={onClose}
                      className="flex-1 py-3 px-4 text-xs font-semibold text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>Try Interactive Sandbox</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
                    </Link>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="py-3 px-5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
