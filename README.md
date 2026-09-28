<p align="center">
  <img src="./logo/credence-logo-lockup-dark.svg" alt="Credence Logo" width="580" />
</p>

<p align="center">
  <strong>Zero-Knowledge Invoice Factoring & Undercollateralized Corporate Credit on Tempo</strong>
</p>

<p align="center">
  <a href="#the-problem-why-credence"><img src="https://img.shields.io/badge/Privacy-zkTLS%20Verified-00E599?style=flat-square" alt="zkTLS Verified" /></a>
  <a href="#smart-contract-test-suite"><img src="https://img.shields.io/badge/Foundry%20Tests-27%2F27%20Passing-brightgreen?style=flat-square" alt="Tests Passing" /></a>
  <a href="#tempo-blockchain-integration"><img src="https://img.shields.io/badge/Settlement-Tempo%20Blockchain-1A1F2C?style=flat-square" alt="Tempo Blockchain" /></a>
  <a href="#smart-contract-architecture"><img src="https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square" alt="Solidity 0.8.24" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License MIT" /></a>
</p>

---

## Executive Summary

**Credence** is a decentralized, privacy-preserving invoice financing and corporate credit protocol built natively on the **Tempo blockchain**.

By leveraging client-side zero-knowledge Transport Layer Security (**zkTLS**) and cryptographic multi-party notarization, Credence enables mid-market enterprises and digital businesses to prove off-chain revenue streams (from platforms such as Stripe, QuickBooks, and commercial bank accounts) directly to on-chain smart contracts.

Borrowers unlock instant, non-dilutive USDC credit lines from institutional senior liquidity vaults without revealing sensitive counterparty names, customer lists, profit margins, or banking credentials. When end customers repay their debts, payments are automatically captured and distributed through Tempo's **Machine Payments Protocol (MPP)**, streaming principal and interest directly back to lenders while transferring operational surplus to the borrower.

---

## The Problem: Why Credence?

Traditional corporate lending and decentralized finance both suffer from structural bottlenecks that lock working capital away from growing enterprises:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   THE CORPORATE CREDIT DILEMMA                                   │
├──────────────────────────────────┬────────────────────────────────┬──────────────────────────────┤
│ 1. Working Capital Squeeze       │ 2. The Corporate Privacy Trap  │ 3. DeFi Overcollateralization│
├──────────────────────────────────┼────────────────────────────────┼──────────────────────────────┤
│ B2B companies deliver work today │ Traditional factoring requires │ DeFi protocols require 150%+ │
│ but wait 30 to 90 days for net   │ disclosing audited financials, │ liquid crypto collateral,    │
│ invoice payment, starving daily  │ customer lists, and contracts. │ useless for cash-flow rich   │
│ operations and hiring.           │ Businesses risk trade secrets. │ real-world enterprises.      │
└──────────────────────────────────┴────────────────────────────────┴──────────────────────────────┘
```

1. **The Working Capital Squeeze**: B2B enterprises and SaaS companies routinely operate under Net-30, Net-60, or Net-90 invoice terms. While balance sheets reflect strong future accounts receivable, immediate operational liquidity is constrained.
2. **The Corporate Privacy Trap**: Traditional invoice factoring institutions demand full financial audits, bank statements, client rosters, and contract copies. Uploading unencrypted enterprise records to public blockchains is an unacceptable breach of corporate confidentiality and regulatory compliance.
3. **The DeFi Overcollateralization Trap**: Mainstream decentralized lending platforms require 125% to 150%+ overcollateralization in volatile crypto assets. This model excludes standard cash-flow businesses that possess verified accounts receivable rather than large crypto treasuries.

---

## The Solution: Credence Protocol

Credence bridges off-chain enterprise accounting systems to on-chain institutional capital without compromising corporate secrecy:

* **Zero-Knowledge Data Ingestion**: Client-side zkTLS notarizes web sessions between the borrower and their payment processor or banking portal. All Personally Identifiable Information (PII), customer identities, and non-essential fields are cryptographically redacted inside the prover enclave.
* **Undercollateralized Cash-Flow Credit**: Credit lines are evaluated against mathematical proofs of 90-day revenue volume, dispute ratios, and invoice maturity dates rather than locked crypto tokens.
* **Pluggable Senior Liquidity**: Passive liquidity providers deposit stablecoins into ERC-4626 yield-bearing vaults (`CredoVault`) or plug external institutional credit lines via standardized interfaces (`ILiquiditySource`).
* **Automated Streaming Repayment (Tempo MPP)**: Invoices are routed through Tempo's native Machine Payments Protocol (`MPPStreamingRepayer`), splitting incoming funds in real time: principal plus interest are routed to the vault, a protocol fee is collected on earned interest, and remaining surplus flows immediately to the borrower.
* **Zero Gas Friction**: Built for Tempo's native fee abstraction where transactions execute directly with stablecoins, eliminating native gas token overhead for corporate operators.

---

## System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CREDENCE SYSTEM TOPOLOGY                                       │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘

   [ ENTERPRISE OFF-CHAIN SOURCES ]
   ( Stripe / QuickBooks / Bank Ledgers )
                 │
                 ▼
   [ CLIENT-SIDE zkTLS PROVER ]  ──>  Extracts 90-day revenue & dispute rates
   ( TLSNotary Engine )          ──>  Redacts customer names, banking keys & PII
                 │
                 ▼  EIP-712 Structured Digest & Signature
   ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
   │                                    TEMPO BLOCKCHAIN RUNTIME                                    │
   ├────────────────────────────────────────────────────────────────────────────────────────────────┤
   │                                                                                                │
   │  [ CredoCreditManager.sol ]                                                                    │
   │  ├── Verifies EIP-712 signature from authorized Notary Oracle                                  │
   │  ├── Enforces Underwriting Bounds (Dispute Rate <= 1.00%, Revenue >= 2x Invoice)               │
   │  ├── Calculates Dynamic Advance (up to 80%) and Risk-Adjusted APR                              │
   │  └── Approves On-Chain Credit Facility                                                         │
   │            │                                                                                   │
   │            ▼                                                                                   │
   │  [ CredoVault.sol ]  (ERC-4626 / ILiquiditySource)                                             │
   │  ├── Pools Institutional Senior Capital (USDC)                                                 │
   │  └── Executes Instant Credit Drawdown to Borrower Operational Address                         │
   │            │                                                                                   │
   │            ▼                                                                                   │
   │  [ Enterprise Borrower Wallet ]  <──  Receives USDC Capital (0 Native Gas Token Required)      │
   │                                                                                                │
   │                                                                                                │
   │  ======================== INVOICE MATURITY & SETTLEMENT FLOW ================================  │
   │                                                                                                │
   │  [ Commercial Customer Payment ]                                                               │
   │            │                                                                                   │
   │            ▼                                                                                   │
   │  [ MPPStreamingRepayer.sol ]  <── Tempo Machine Payments Protocol (MPP) Router                 │
   │       │                                                                                        │
   │       ├── 1. Principal + Net Interest  ──> [ CredoVault.sol ] (Compounded Lender Yield)        │
   │       ├── 2. Protocol Fee (50 bps)     ──> [ Protocol Treasury ] (Calculated on Interest)     │
   │       └── 3. Invoice Surplus Balance   ──> [ Borrower Wallet ] (Immediate Settlement)          │
   │                                                                                                │
   └────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## How It Works: Step-by-Step

### 1. Off-Chain Verification & Selective Redaction
The borrower connects their accounting source (e.g., Stripe) in the Credence application. The client-side zkTLS engine opens an authenticated TLS session with the provider. The notarization service verifies the authenticity of the data exchange while the borrower selectively redacts sensitive fields:
* **Redacted**: Customer names, line-item descriptions, tax IDs, banking routing details.
* **Retained**: 90-day aggregate revenue, dispute/refund rate, target invoice amount, invoice identifier hash.

### 2. Cryptographic Attestation Generation
The engine packages the verified parameters into an EIP-712 structured payload:
```solidity
struct RevenueAttestation {
    bytes32 businessIdHash;
    uint256 revenue90Days;
    uint256 disputeRateBps;
    bytes32 invoiceHash;
    uint256 invoiceAmount;
    uint256 timestamp;
}
```
The notary signs the hash of this struct, creating a verifiable attestation valid for a 1-hour window.

### 3. On-Chain Underwriting Assessment
The borrower submits the attestation and signature to `CredoCreditManager.sol`. The contract verifies:
1. **Signature Validity**: Confirms the digest originates from an authorized notary oracle.
2. **Dispute Threshold**: Rejects any profile with a dispute rate exceeding 100 bps (1.00%).
3. **Revenue Coverage**: Ensures verified 90-day revenue is at least 2.0x the requested invoice value.
4. **Freshness & Uniqueness**: Verifies the attestation timestamp is within 3600 seconds and the invoice hash has never been financed previously.

Upon validation, the contract assigns a risk-adjusted credit limit (up to 80% advance rate) and an APR based on the borrower's risk profile.

### 4. Liquidity Drawdown
The borrower calls `drawdownCredit()` on `CredoCreditManager.sol`. The manager invokes the underlying `CredoVault.sol`, transferring USDC directly to the borrower's wallet. Borrowers can draw their full facility or execute partial drawdowns as operational needs dictate.

### 5. Automated MPP Settlement & Fee Split
When the end debtor settles the invoice via Tempo's Machine Payments Protocol, `MPPStreamingRepayer.sol` executes atomic multi-party distribution:
* **Principal Recovery**: The original borrowed amount is returned to `CredoVault`.
* **Interest Accrual**: Accrued interest is computed using precise per-second linear accrual ($I = P \times r \times t / 365\text{ days}$).
* **Protocol Fee**: A 50 bps (0.50%) protocol fee is calculated strictly on the interest portion and transferred to the protocol fee recipient.
* **Net Lender Yield**: Remaining interest ($99.50\%$) is deposited into the vault, increasing share value for LP depositors.
* **Surplus Routing**: The remaining invoice balance (Invoice Total minus Principal minus Total Interest) is transferred directly to the borrower.

---

## Smart Contract Architecture

The smart contract suite is written in Solidity `0.8.24` and managed with Foundry:

| Contract | Role | Key Functions |
|---|---|---|
| [`CredoCreditManager.sol`](./packages/contracts/src/CredoCreditManager.sol) | Underwriting Engine | `verifyAndApproveCredit()`, `drawdownCredit()`, `getCreditFacility()` |
| [`CredoVault.sol`](./packages/contracts/src/CredoVault.sol) | Senior Liquidity Vault | `deposit()`, `withdraw()`, `drawdown()`, `receiveRepayment()`, `totalAssets()` |
| [`MPPStreamingRepayer.sol`](./packages/contracts/src/MPPStreamingRepayer.sol) | Settlement Router | `processSettlement()`, `processPartialRepayment()`, `setFeeRecipient()` |
| [`ILiquiditySource.sol`](./packages/contracts/src/ILiquiditySource.sol) | Liquidity Abstraction | `drawdown()`, `receiveRepayment()`, `availableLiquidity()` |
| [`MockUSDC.sol`](./packages/contracts/src/MockUSDC.sol) | Testnet Currency | 6-decimal ERC-20 with built-in 24-hour rate-limited faucet |

---

## Monorepo Structure

```
credence/
├── logo/                                 # Official Brand Identity & Vector Assets
│   ├── credence-logo.svg                 # Primary Logo Icon
│   ├── credence-logo-lockup-dark.svg     # Dark Theme Horizontal Lockup
│   ├── credence-logo-lockup-cream.svg    # Cream Theme Horizontal Lockup
│   ├── credence-logo-twitter.svg         # Square Profile Avatar (Dark)
│   └── credence-logo-twitter-cream.svg   # Square Profile Avatar (Cream)
│
├── packages/
│   ├── contracts/                        # Foundry Smart Contract Suite
│   │   ├── src/
│   │   │   ├── CredoCreditManager.sol    # zkTLS Underwriting & EIP-712 Verification
│   │   │   ├── CredoVault.sol            # ERC-4626 Yield-Bearing Senior Liquidity Pool
│   │   │   ├── MPPStreamingRepayer.sol   # Tempo Machine Payments Settlement Router
│   │   │   ├── ILiquiditySource.sol      # Pluggable Liquidity Interface
│   │   │   └── MockUSDC.sol              # 6-decimal Stablecoin with Faucet
│   │   ├── test/
│   │   │   └── Credence.t.sol            # 27 Unit and Integration Test Scenarios
│   │   ├── script/
│   │   │   └── Deploy.s.sol              # Deterministic Deployment Scripts
│   │   └── foundry.toml                  # Foundry Build & Solc Configuration
│   │
│   ├── zktls-engine/                     # TypeScript zkTLS Attestation Library
│   │   └── src/
│   │       ├── attestation.ts            # EIP-712 Payload Construction & Signing
│   │       ├── mockData.ts               # Enterprise Financial Data Profiles (A, B, C)
│   │       ├── demo.ts                   # Interactive CLI Attestation Flow
│   │       └── index.ts                  # Public Module Exports
│   │
│   └── frontend/                         # Next.js 15 Web Application
│       ├── app/
│       │   ├── page.tsx                  # Landing Page & Brand Overview
│       │   ├── borrower/page.tsx         # zkTLS Verification Pipeline & Credit Drawdown
│       │   ├── lender/page.tsx           # Senior Vault Deposits, APY & Health Metrics
│       │   └── simulate/page.tsx         # Interactive Real-Time MPP Settlement Visualizer
│       ├── components/
│       │   ├── Navigation.tsx            # Universal Header Navigation
│       │   ├── Footer.tsx                # Protocol Footer & System Links
│       │   ├── WaitlistModal.tsx         # Enterprise Waitlist Email Capture
│       │   ├── WalletConnectModal.tsx    # Multi-Wallet Connection Modal
│       │   └── Providers.tsx             # Wagmi & TanStack Query Providers
│       └── lib/
│           ├── tempoConfig.ts            # Tempo Moderato Chain Definitions & Contract ABIs
│           └── zktls.ts                  # Client-Side Notarization Bridge
└── README.md
```

---

## Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) v18.0.0 or higher
* [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `cast`, `anvil`)
* [Git](https://git-scm.com/)

### 1. Smart Contracts (Foundry)

```bash
# Navigate to the contracts package
cd packages/contracts

# Compile smart contracts
forge build

# Execute the complete test suite (27 tests)
forge test

# Run tests with detailed trace logs
forge test -vvv

# Launch local development chain and deploy
anvil
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast
```

### 2. zkTLS Engine (CLI Demo)

```bash
# Navigate to the zkTLS package
cd packages/zktls-engine

# Install dependencies
npm install

# Run the interactive 3-profile underwriting demo
npm run demo
```

**Example CLI Output:**
```
[✓] TLS Session Handshake Verified
[⊘] Sensitive PII & Customer Records Redacted
[≈] 90-Day Revenue Asserted ($150,000)
[≈] Dispute Rate Verified (0.05%)

✅ CREDIT APPROVED
   Facility Limit: $36,000 USDC @ 8.00% APR
   Invoice Backing: $45,000 (Advance Rate: 80.00%)
```

### 3. Frontend Application (Next.js)

```bash
# Navigate to the frontend package
cd packages/frontend

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
* **`/`**: Protocol overview, architecture pillars, and enterprise waitlist.
* **`/borrower`**: Interactive zkTLS revenue proving pipeline and credit drawdown.
* **`/lender`**: Senior liquidity pool deposit interface, APY calculator, and TVL telemetry.
* **`/simulate`**: Real-time animated Tempo MPP payment stream simulator.

---

## Tempo Blockchain Integration

| Parameter | Specification |
|---|---|
| **Network Name** | Tempo Moderato Testnet |
| **Chain ID** | `42431` (`0xa5bf`) |
| **RPC Endpoint** | `https://rpc.moderato.tempo.xyz` |
| **Block Explorer** | `https://explorer.moderato.tempo.xyz` |
| **Settlement Rails** | Tempo Machine Payments Protocol (MPP) |
| **Gas Architecture** | Native Fee Abstraction (Settled directly in USDC) |

---

## Security Model & Risk Parameters

* **Oracle Attestation Freshness**: Attestations enforce a strict 1-hour TTL (`block.timestamp <= attestation.timestamp + 3600`) to prevent replaying stale revenue data.
* **Double Financing Prevention**: Each invoice identifier hash is stored in a permanent mapping upon credit approval; subsequent attempts to finance the same invoice revert immediately.
* **Dispute Rate Guardrails**: Facilities require historical chargeback and dispute rates under 100 bps (1.00%). Profiles exceeding this limit are unconditionally rejected.
* **Access Isolation**: Liquidity drawdown functions on `CredoVault` and repayment callbacks are restricted to authorized protocol contract addresses via strict access modifiers.
* **Treasury Safeguards**: Fee recipient configuration requires multi-sig protocol ownership and rejects zero-address configurations.

---

## License

This project is licensed under the [MIT License](./LICENSE).
