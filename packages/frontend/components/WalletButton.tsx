"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useConnect } from "wagmi";
import {
  X,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { LogoMonolith } from "@/components/logos/LogoComponents";
import { tempoModerato } from "@/lib/tempoConfig";
import { useCredenceAccount } from "@/lib/useCredenceAccount";

export function WalletButton() {
  const {
    address,
    isConnected,
    isDemo,
    isWrongNetwork,
    mounted,
    connectDemo,
    disconnect,
    switchToTempo,
    addTempoNetwork,
    isSwitchingChain,
    hasInjectedProvider,
    isMetaMaskInstalled,
  } = useCredenceAccount();

  const { connectors, connectAsync } = useConnect();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectProvider = async (providerId: "metaMask" | "walletConnect" | "injected") => {
    setErrorMessage(null);
    setConnectingId(providerId);

    try {
      if (providerId === "metaMask" && !hasInjectedProvider) {
        setErrorMessage(
          "MetaMask was not detected in your browser. You can install it, connect via WalletConnect, or use Quick Demo Connect."
        );
        setConnectingId(null);
        return;
      }

      const connector = connectors.find((c) => {
        if (providerId === "metaMask") {
          return (
            c.id === "metaMask" ||
            c.name.toLowerCase().includes("metamask") ||
            c.id === "injected"
          );
        }
        if (providerId === "walletConnect") return c.id === "walletConnect";
        return c.id === "injected" || c.id === "metaMask";
      });

      if (connector) {
        await connectAsync({ connector });
        setModalOpen(false);
      } else {
        // Fallback: direct window.ethereum request
        if (typeof window !== "undefined" && (window as any).ethereum) {
          await (window as any).ethereum.request({ method: "eth_requestAccounts" });
          const injectedConn = connectors.find((c) => c.id === "injected");
          if (injectedConn) {
            await connectAsync({ connector: injectedConn });
          }
          setModalOpen(false);
        } else {
          setErrorMessage("No compatible Web3 provider found. Please use Quick Demo Connect.");
        }
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      if (err?.code === 4001 || err?.message?.includes("User rejected") || err?.name === "UserRejectedRequestError") {
        setErrorMessage("Connection request was cancelled in your wallet. Please try again.");
      } else if (err?.message?.includes("already pending")) {
        setErrorMessage("A connection request is already pending in your wallet extension. Please open it to approve.");
      } else {
        setErrorMessage(err?.message || "Failed to connect. Please try again or use Quick Demo Connect.");
      }
    } finally {
      setConnectingId(null);
    }
  };

  const handleDemoConnect = () => {
    setErrorMessage(null);
    connectDemo();
    setModalOpen(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setDetailsOpen(false);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className="px-4 py-2 text-xs font-semibold text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] rounded-xl opacity-80"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <>
      {/* 1. Main Navbar Trigger Button */}
      {isConnected && address ? (
        <div className="relative inline-flex items-center gap-2">
          {isWrongNetwork && (
            <button
              type="button"
              onClick={() => switchToTempo()}
              disabled={isSwitchingChain}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>{isSwitchingChain ? "Switching..." : "Switch to Tempo"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 border border-amber-200/90 hover:border-amber-400 text-stone-900 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isDemo ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
              }`}
            />
            <span className="font-mono text-xs font-semibold text-stone-800">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            {isDemo && (
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Demo
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-transform duration-200" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setModalOpen(true);
          }}
          className="group relative inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] hover:from-[#ECD075] hover:to-[#D4AF37] rounded-xl shadow-[0_4px_16px_rgba(212,175,55,0.28)] hover:shadow-[0_8px_24px_rgba(212,175,55,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer font-sans"
        >
          <span>Connect Wallet</span>
        </button>
      )}

      {/* 2. Connect Wallet Selection Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white border border-amber-200/80 rounded-3xl shadow-2xl shadow-amber-950/20 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#0E0C0A] flex items-center justify-center p-0.5 border border-stone-800">
                    <LogoMonolith size={14} variant="white" />
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900">
                    Connect to Credence
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Options */}
              <div className="p-6 space-y-3">
                <p className="text-xs text-stone-500 mb-3 font-sans">
                  Select a wallet to interact with Credence credit facilities and senior liquidity vaults on Tempo.
                </p>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span>{errorMessage}</span>
                      {!hasInjectedProvider && (
                        <div className="mt-1.5">
                          <a
                            href="https://metamask.io/download/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold underline text-amber-900 hover:text-amber-950"
                          >
                            Install MetaMask Extension →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Option 1: MetaMask */}
                <button
                  type="button"
                  onClick={() => handleConnectProvider("metaMask")}
                  disabled={!!connectingId}
                  className="w-full p-4 rounded-2xl border border-amber-100/90 hover:border-amber-400 bg-white hover:bg-amber-50/40 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between group cursor-pointer text-left disabled:opacity-60"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0">
                      {/* MetaMask Fox SVG */}
                      <svg width="22" height="22" viewBox="0 0 318.6 318.6">
                        <path fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" d="M274.1 35.5l-99.5 73.9L194 65.4l80.1-29.9z" />
                        <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M44.4 35.5l80.1 29.9 19.5 44-99.6-73.9z" />
                        <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M238.3 206.8l-28.5 43.1 56.4 15.5 16.3-55.5-44.2-3.1z" />
                        <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M35.6 209.9l16.3 55.5 56.4-15.5-28.5-43.1-44.2 3.1z" />
                        <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M103.7 138.1l-15.8 23.9 56.3 2.5-2-60.5-38.5 34.1z" />
                        <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M214.9 138.1l38.5-34.1-2 60.5 56.3-2.5-15.8-23.9z" />
                        <path fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" d="M106.8 247.4l33.8-16.5-29.2-22.8-4.6 39.3z" />
                        <path fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" d="M211.8 247.4l4.6-39.3-29.2 22.8 33.8 16.5z" />
                        <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="M138.8 193.5l-28.2-8.3 19.9-9.1 8.3 17.4z" />
                        <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="M179.8 193.5l8.3-17.4 19.9 9.1-28.2 8.3z" />
                        <path fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" d="M106.8 247.4l4.8-40.6-44.2-3.1 39.4 43.7z" />
                        <path fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" d="M207 206.8l4.8 40.6 39.4-43.7-44.2 3.1z" />
                        <path fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" d="M230.7 162l-56.3 2.5 5.2 29 28.2-8.3 22.9-23.2z" />
                        <path fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" d="M87.9 162l22.9 23.2 28.2 8.3 5.2-29-56.3-2.5z" />
                        <path fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" d="M87.9 162l7 33.4-13.6-13.7-4.6 3.1 11.2-22.8z" />
                        <path fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" d="M223.7 181.7l-13.6 13.7 7-33.4 11.2 22.8-4.6-3.1z" />
                        <path fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" d="M144.6 164.5l-5.2 29 6.4 33.2 1.4-43.9-2.6-18.3z" />
                        <path fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" d="M174 164.5l-2.6 18.3 1.4 43.9 6.4-33.2-5.2-29z" />
                        <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M179.8 193.5l-6.4 33.2 38.4 20.7 4.6-39.3-36.6-14.6z" />
                        <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M102.2 208.1l4.6 39.3 38.4-20.7-6.4-33.2-36.6 14.6z" />
                        <path fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" d="M181.2 258.4l-21.9-6.4-21.9 6.4 2.5 19.3 19.4-5.6 19.4 5.6 2.5-19.3z" />
                        <path fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" d="M159.3 226.7l-12.1-5.9 8.6-4.2 3.5 10.1z" />
                        <path fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" d="M159.3 226.7l3.5-10.1 8.6 4.2-12.1 5.9z" />
                        <path fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" d="M74.3 204.8l13.6 13.7-16.3-55.5 2.7 41.8z" />
                        <path fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" d="M244.3 204.8l2.7-41.8-16.3 55.5 13.6-13.7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-stone-900 group-hover:text-amber-800 transition-colors font-display flex items-center gap-2">
                        <span>MetaMask</span>
                        {isMetaMaskInstalled && (
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Detected
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 font-sans">
                        Browser extension or mobile wallet
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {connectingId === "metaMask" ? (
                      <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold group-hover:translate-x-1 transition-transform">
                        Connect →
                      </span>
                    )}
                  </div>
                </button>

                {/* Option 2: WalletConnect */}
                <button
                  type="button"
                  onClick={() => handleConnectProvider("walletConnect")}
                  disabled={!!connectingId}
                  className="w-full p-4 rounded-2xl border border-amber-100/90 hover:border-amber-400 bg-white hover:bg-amber-50/40 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between group cursor-pointer text-left disabled:opacity-60"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0">
                      {/* WalletConnect SVG */}
                      <svg width="22" height="22" viewBox="0 0 300 185" fill="#3B99FC">
                        <path d="M59.6 35.8c49.9-48.8 130.8-48.8 180.8 0l6 5.8c2.5 2.4 2.5 6.4 0 8.8l-20.6 20.1c-1.2 1.2-3.3 1.2-4.5 0l-8.4-8.2c-35.6-34.8-93.5-34.8-129.1 0l-9 8.8c-1.2 1.2-3.3 1.2-4.5 0L49.7 51c-2.5-2.4-2.5-6.4 0-8.8l9.9-6.4zm234.9 52.8l20.6 20.1c2.5 2.4 2.5 6.4 0 8.8l-92.8 90.7c-2.5 2.4-6.5 2.4-9 0L149.9 146c-1.2-1.2-3.3-1.2-4.5 0l-63.4 62.1c-2.5 2.4-6.5 2.4-9 0L-19.8 117.5c-2.5-2.4-2.5-6.4 0-8.8l20.6-20.1c2.5-2.4 6.5-2.4 9 0l63.4 62.1c1.2 1.2 3.3 1.2 4.5 0l63.4-62.1c2.5-2.4 6.5-2.4 9 0l63.4 62.1c1.2 1.2 3.3 1.2 4.5 0l63.4-62.1c2.5-2.4 6.5-2.4 9 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-stone-900 group-hover:text-amber-800 transition-colors font-display">
                        WalletConnect
                      </div>
                      <div className="text-[11px] text-stone-500 font-sans">
                        Scan with Rainbow, Trust, Zerion, or mobile
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {connectingId === "walletConnect" ? (
                      <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold group-hover:translate-x-1 transition-transform">
                        Connect →
                      </span>
                    )}
                  </div>
                </button>

                {/* Option 3: Tempo / Injected EVM Wallet */}
                <button
                  type="button"
                  onClick={() => handleConnectProvider("injected")}
                  disabled={!!connectingId}
                  className="w-full p-4 rounded-2xl border border-amber-100/90 hover:border-amber-400 bg-white hover:bg-amber-50/40 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between group cursor-pointer text-left disabled:opacity-60"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-stone-900 group-hover:text-amber-800 transition-colors font-display flex items-center gap-2">
                        <span>Tempo / Injected EVM</span>
                        {hasInjectedProvider && (
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Available
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 font-sans">
                        Rabby, Coinbase Wallet, Brave, or EVM wallet
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {connectingId === "injected" ? (
                      <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold group-hover:translate-x-1 transition-transform">
                        Connect →
                      </span>
                    )}
                  </div>
                </button>

                {/* Option 4: Quick Demo Simulation */}
                <button
                  type="button"
                  onClick={handleDemoConnect}
                  className="w-full p-3.5 rounded-2xl border border-dashed border-amber-300/80 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 transition-all duration-200 flex items-center justify-between group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-800" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900">
                        Quick Demo Connect
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        Instant session test without browser extensions
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-amber-800 font-semibold">
                    Instant
                  </span>
                </button>
              </div>

              {/* Network Helper */}
              <div className="px-6 py-3.5 bg-stone-50 border-t border-amber-100/80 flex items-center justify-between text-xs text-stone-600 font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Tempo Chain ID: <strong>42431</strong></span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await addTempoNetwork();
                    } catch (err: any) {
                      setErrorMessage(err?.message || "Failed to add Tempo network to wallet.");
                    }
                  }}
                  className="text-amber-800 hover:text-amber-900 font-semibold underline text-xs cursor-pointer"
                >
                  Add Tempo Network
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Wallet Account Details Modal */}
      <AnimatePresence>
        {detailsOpen && address && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white border border-amber-200/80 rounded-3xl shadow-2xl shadow-amber-950/20 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/60">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDemo ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900">
                    Connected Account
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono uppercase text-stone-500">
                      Wallet Address
                    </span>
                    {isDemo && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                        Demo Account
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-stone-900 break-all">
                      {address}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-2 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-stone-700 hover:text-stone-900 transition-colors shrink-0 cursor-pointer"
                      title="Copy Address"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-stone-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-amber-100/60">
                    <span className="text-stone-500">Active Network:</span>
                    <span className="font-mono font-bold text-stone-900">
                      {isWrongNetwork ? "Unsupported Network" : "Tempo Moderato (42431)"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-amber-100/60">
                    <span className="text-stone-500">Native Gas Currency:</span>
                    <span className="font-mono font-bold text-emerald-700">USDC (Zero gas token)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-stone-500">Block Explorer:</span>
                    <a
                      href={`https://explorer.moderato.tempo.xyz/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-800 hover:text-amber-900 font-semibold font-mono flex items-center gap-1"
                    >
                      <span>View on Tempo Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {isWrongNetwork && (
                  <button
                    type="button"
                    onClick={() => switchToTempo()}
                    disabled={isSwitchingChain}
                    className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#C5A059] rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-70"
                  >
                    {isSwitchingChain ? "Switching Network..." : "Switch to Tempo Moderato Network"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full py-3 text-xs font-semibold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100/80 border border-red-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect Wallet</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
