"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Calendar,
  Percent,
} from "lucide-react";
import type { RawBusinessData } from "@/lib/zktls";

export interface CustomInvoiceItem {
  id: string;
  label: string;
  source: string;
  description: string;
  revenue: string;
  disputeRate: string;
  invoiceAmount: string;
  expectedOutcome: "APPROVED" | "REJECTED";
  rawData: RawBusinessData;
  isCustom: true;
  createdAt: number;
}

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInvoice: (invoice: CustomInvoiceItem) => void;
}

const SOURCES = [
  "Stripe API",
  "QuickBooks Online",
  "Banking Invoice",
  "FreshBooks",
  "Xero Accounting",
];

export function AddInvoiceModal({
  isOpen,
  onClose,
  onAddInvoice,
}: AddInvoiceModalProps) {
  const [companyName, setCompanyName] = useState("Apex Cloud Systems Inc.");
  const [source, setSource] = useState("Stripe API");
  const [invoiceId, setInvoiceId] = useState(`INV-2026-10-${Math.floor(1000 + Math.random() * 9000)}`);
  const [customerName, setCustomerName] = useState("Nordic Enterprise Health");
  const [faceValue, setFaceValue] = useState(50000);
  const [volume90d, setVolume90d] = useState(175000);
  const [disputeRatePct, setDisputeRatePct] = useState(0.18);
  const [dueDate, setDueDate] = useState("2026-11-28");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Underwriting calculations
  const coverageRatio = faceValue > 0 ? volume90d / faceValue : 0;
  const isDisputeCompliant = disputeRatePct <= 1.0;
  const isCoverageCompliant = coverageRatio >= 2.0;
  const isEligible = isDisputeCompliant && isCoverageCompliant;
  const expectedOutcome: "APPROVED" | "REJECTED" = isEligible ? "APPROVED" : "REJECTED";
  const advanceAmount = Math.round(faceValue * 0.8);

  const handleLoadSample = (sampleType: "eligible" | "highRisk") => {
    if (sampleType === "eligible") {
      setCompanyName("Meridian HealthTech Ltd");
      setSource("Stripe API");
      setInvoiceId(`INV-2026-10-${Math.floor(1000 + Math.random() * 9000)}`);
      setCustomerName("Global Care Group");
      setFaceValue(65000);
      setVolume90d(220000);
      setDisputeRatePct(0.12);
      setDueDate("2026-12-15");
      setUploadedFileName("sample_meridian_invoice.json");
    } else {
      setCompanyName("FastDrop Commerce");
      setSource("Banking Invoice");
      setInvoiceId(`INV-2026-10-${Math.floor(1000 + Math.random() * 9000)}`);
      setCustomerName("Metro Retail Partners");
      setFaceValue(40000);
      setVolume90d(55000);
      setDisputeRatePct(2.45);
      setDueDate("2026-11-20");
      setUploadedFileName("sample_subprime_invoice.json");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsParsingFile(true);

    if (file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.companyName) setCompanyName(parsed.companyName);
          if (parsed.source) setSource(parsed.source);
          if (parsed.faceValue) setFaceValue(Number(parsed.faceValue));
          if (parsed.volume90d) setVolume90d(Number(parsed.volume90d));
          if (parsed.disputeRatePct !== undefined) setDisputeRatePct(Number(parsed.disputeRatePct));
          if (parsed.invoiceId) setInvoiceId(parsed.invoiceId);
          if (parsed.customerName) setCustomerName(parsed.customerName);
          if (parsed.dueDate) setDueDate(parsed.dueDate);
        } catch (err) {
          console.error("JSON parse error:", err);
        } finally {
          setIsParsingFile(false);
        }
      };
      reader.readAsText(file);
    } else {
      // Simulate intelligent document parsing for PDF / invoices
      setTimeout(() => {
        setInvoiceId(`INV-OCR-${Math.floor(1000 + Math.random() * 9000)}`);
        setIsParsingFile(false);
      }, 700);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const disputesVolumeUsd = Math.round((volume90d * disputeRatePct) / 100);

    const rawData: RawBusinessData = {
      companyName,
      companyRegistrationId: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      bankAccountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
      bankRoutingNumber: "021000021",
      sourceType: source as any,
      ownerEmail: `finance@${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      ownerTaxId: "XX-XXXXXXX",
      trailing90dGrossVolume: volume90d,
      trailing90dRefunds: Math.round(volume90d * 0.015),
      trailing90dDisputes: disputesVolumeUsd,
      trailing90dChargeCount: Math.max(50, Math.round(volume90d / 80)),
      invoice: {
        id: invoiceId,
        customerName,
        customerEmail: `billing@${customerName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        faceValueUsd: faceValue,
        dueDateIso: dueDate,
        description: `Receivables Facility: ${invoiceId}`,
        currency: "USD",
      },
    };

    const newInvoiceItem: CustomInvoiceItem = {
      id: invoiceId,
      label: `${companyName} (${invoiceId})`,
      source,
      description: `${companyName} · Verified receivables stream · ${source}`,
      revenue: `$${volume90d.toLocaleString()}`,
      disputeRate: `${disputeRatePct.toFixed(2)}%`,
      invoiceAmount: `$${faceValue.toLocaleString()}`,
      expectedOutcome,
      rawData,
      isCustom: true,
      createdAt: Date.now(),
    };

    onAddInvoice(newInvoiceItem);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white border border-amber-200/90 rounded-3xl shadow-2xl shadow-amber-950/25 overflow-hidden my-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-invoice-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-900 shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="add-invoice-title" className="text-base font-bold text-stone-900 font-display">
                    Add Invoice & Receivables Data
                  </h3>
                  <p className="text-xs text-stone-500">
                    Upload an invoice file or input cash flow metrics to evaluate with zkTLS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Top Quick Actions / Document Upload Zone */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50/70 to-stone-50/60 border border-amber-200/70">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-mono font-semibold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-700" />
                    <span>Upload Invoice Document (JSON, PDF, Text)</span>
                  </span>

                  {/* Sample Presets */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-stone-500">Load sample:</span>
                    <button
                      type="button"
                      onClick={() => handleLoadSample("eligible")}
                      className="px-2 py-0.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                    >
                      Eligible
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample("highRisk")}
                      className="px-2 py-0.5 text-[11px] font-medium text-red-800 bg-red-50 border border-red-200 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                    >
                      High Risk
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-xl bg-white/80 hover:bg-white text-center cursor-pointer transition-colors group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.pdf,.txt,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {isParsingFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-800 animate-pulse">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Parsing invoice payload & verifying cryptographic format...</span>
                    </div>
                  ) : uploadedFileName ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Loaded file: {uploadedFileName}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-800 group-hover:text-amber-900 transition-colors">
                        Click to select an invoice document or drag and drop
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Supports invoice JSON payloads, PDF statements, or structured billing exports
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>Company Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                    placeholder="e.g. Acme SaaS Inc."
                  />
                </div>

                {/* Data Source */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Data Source / Connection
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Invoice ID */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Invoice Reference ID
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceId}
                    onChange={(e) => setInvoiceId(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                    placeholder="e.g. INV-2026-10-8812"
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Customer / Debtor Entity
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                    placeholder="e.g. Globex Corp"
                  />
                </div>

                {/* Invoice Face Value */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                    <span>Invoice Face Value (USD)</span>
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    required
                    value={faceValue}
                    onChange={(e) => setFaceValue(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>

                {/* Trailing 90d Gross Volume */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                    <span>Trailing 90-Day Volume (USD)</span>
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    required
                    value={volume90d}
                    onChange={(e) => setVolume90d(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>

                {/* Dispute Rate */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-stone-400" />
                      <span>Historical Dispute Rate (%)</span>
                    </span>
                    <span className="text-[11px] text-stone-400">Max allowed: 1.00%</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    step={0.01}
                    required
                    value={disputeRatePct}
                    onChange={(e) => setDisputeRatePct(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Payment Due Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Live Underwriting Assessment Preview */}
              <div className="p-4 rounded-2xl border bg-stone-50/80 border-stone-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-semibold text-stone-900 font-display">
                      Underwriting Compliance Check
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                      isEligible
                        ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                        : "text-red-700 bg-red-50 border border-red-200"
                    }`}
                  >
                    {isEligible ? "ELIGIBLE" : "HIGH RISK"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200/70">
                    <span className="text-stone-500 block text-[11px]">90d Coverage Ratio</span>
                    <span className={`font-mono font-semibold ${isCoverageCompliant ? "text-emerald-700" : "text-red-600"}`}>
                      {coverageRatio.toFixed(2)}x (Min: 2.0x)
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-stone-200/70">
                    <span className="text-stone-500 block text-[11px]">Dispute Compliance</span>
                    <span className={`font-mono font-semibold ${isDisputeCompliant ? "text-emerald-700" : "text-red-600"}`}>
                      {disputeRatePct.toFixed(2)}% (Max: 1.00%)
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-stone-200/70">
                    <span className="text-stone-500 block text-[11px]">Est. 80% Advance</span>
                    <span className="font-mono font-bold text-amber-900">
                      ${advanceAmount.toLocaleString()} USDC
                    </span>
                  </div>
                </div>

                {!isEligible && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1.5 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {!isCoverageCompliant && "Volume must be at least 2.0x invoice face value. "}
                      {!isDisputeCompliant && "Dispute rate exceeds 1.00% ceiling."}
                    </span>
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.45)] transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  <span>Create Invoice Card</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
