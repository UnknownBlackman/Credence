"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { tempoModerato } from "./tempoConfig";

const DEMO_STORAGE_KEY = "credence_demo_account";
const DEFAULT_DEMO_ADDRESS = "0x71C8492A9B82014eF0a45920C81F3849102B9B28";

export function useCredenceAccount() {
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const [demoAddress, setDemoAddress] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Sync demo address from localStorage and custom events
  useEffect(() => {
    setMounted(true);
    const syncStorage = () => {
      try {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        setDemoAddress(stored || null);
      } catch {
        setDemoAddress(null);
      }
    };

    syncStorage();

    window.addEventListener("credence_wallet_updated", syncStorage);
    window.addEventListener("storage", syncStorage);

    return () => {
      window.removeEventListener("credence_wallet_updated", syncStorage);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  const isDemo = !isWagmiConnected && !!demoAddress;
  const isConnected = isWagmiConnected || !!demoAddress;
  const activeAddress = wagmiAddress || demoAddress || undefined;
  const isTempo = isDemo || (isWagmiConnected && chainId === tempoModerato.id);
  const isWrongNetwork = isWagmiConnected && chainId !== tempoModerato.id;

  const connectDemo = useCallback((customAddress?: string) => {
    const target = customAddress || DEFAULT_DEMO_ADDRESS;
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, target);
      setDemoAddress(target);
      window.dispatchEvent(new Event("credence_wallet_updated"));
    } catch (err) {
      console.error("Failed to save demo account:", err);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (isWagmiConnected) {
      wagmiDisconnect();
    }
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      setDemoAddress(null);
      window.dispatchEvent(new Event("credence_wallet_updated"));
    } catch (err) {
      console.error("Failed to clear demo account:", err);
    }
  }, [isWagmiConnected, wagmiDisconnect]);

  const addTempoNetwork = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("No EVM provider detected");
    }
    await (window as any).ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${tempoModerato.id.toString(16)}`,
          chainName: "Tempo Moderato Testnet",
          nativeCurrency: {
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6,
          },
          rpcUrls: ["https://rpc.moderato.tempo.xyz"],
          blockExplorerUrls: ["https://explorer.moderato.tempo.xyz"],
        },
      ],
    });
  }, []);

  const switchToTempo = useCallback(async () => {
    if (switchChain) {
      try {
        await switchChain({ chainId: tempoModerato.id });
        return;
      } catch (err: any) {
        // If error code is 4902 (chain not added), try addTempoNetwork
        if (err?.code === 4902 || err?.message?.includes("Unrecognized chain")) {
          await addTempoNetwork();
          return;
        }
        throw err;
      }
    }
    await addTempoNetwork();
  }, [switchChain, addTempoNetwork]);

  const openConnectModal = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("credence_open_connect_modal"));
    }
  }, []);

  const hasInjectedProvider =
    typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";

  const isMetaMaskInstalled =
    typeof window !== "undefined" &&
    typeof (window as any).ethereum !== "undefined" &&
    !!(window as any).ethereum?.isMetaMask;

  return {
    address: activeAddress,
    isConnected,
    isDemo,
    isWagmiConnected,
    chainId,
    isTempo,
    isWrongNetwork,
    mounted,
    connectDemo,
    disconnect,
    switchToTempo,
    addTempoNetwork,
    isSwitchingChain,
    hasInjectedProvider,
    isMetaMaskInstalled,
    openConnectModal,
  };
}
