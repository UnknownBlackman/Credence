import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { LayoutShell } from "./layout-shell";

export const metadata: Metadata = {
  title: "Credence: Undercollateralized Corporate Credit Lines",
  description:
    "Credence connects verified businesses to deep external liquidity vaults (Aave, Morpho, Compound, ERC-4626) for instant, undercollateralized credit on Tempo with zero corporate secrets leaked.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-amber-300/30 selection:text-amber-950 overflow-x-hidden min-h-screen">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
