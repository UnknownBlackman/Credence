/**
 * providers.tsx - Wagmi & React Query provider setup for Credence
 */
"use client";

import React, { useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, sepolia } from "viem/chains";
import { tempoModerato } from "@/lib/tempoConfig";

export const config = createConfig({
  chains: [tempoModerato, mainnet, sepolia],
  ssr: true,
  connectors: [
    injected(),
    walletConnect({
      projectId: "3fcc6bba2d1de962223a504383a54d5b",
      showQrModal: true,
    }),
  ],
  transports: {
    [tempoModerato.id]: http("https://rpc.moderato.tempo.xyz"),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
