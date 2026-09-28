/**
 * attestation.ts - zkTLS Attestation Engine for Credence
 *
 * Simulates client-side TLSNotary proof generation:
 *   1. Ingests raw revenue data from Stripe, QuickBooks, or Banking Invoices (with full PII)
 *   2. Extracts underwriting metrics (trailing 90d revenue, dispute rate, invoice data)
 *   3. Redacts all sensitive PII (replaces company/bank identity with keccak256 hashes)
 *   4. Generates an EIP-712 UnderwritingAttestation struct
 *   5. Signs with the Notary Oracle private key
 *
 * In production: The TLSNotary client MPC protocol proves the authenticity of an
 * HTTPS session with the financial provider API, producing a zero-knowledge proof of the
 * TLS transcript. We simulate the proof generation and output the exact EIP-712
 * payload expected by CredoCreditManager.sol.
 */

import { ethers } from "ethers";
import type { RawBusinessData } from "./mockData";

// -- Types ---------------------------------------------------------------------

/** The on-chain struct submitted to CredoCreditManager */
export interface UnderwritingAttestation {
  businessIdHash: string;       // bytes32: keccak256 of entity ID (PII-redacted)
  trailing90dRevenue: bigint;   // uint256: USDC 6-decimal
  disputeRateBps: bigint;       // uint256: basis points
  invoiceFaceValue: bigint;     // uint256: USDC 6-decimal
  invoiceDueDate: bigint;       // uint64
  invoiceHash: bigint;          // bytes32 (as number for Solidity compatibility)
  invoiceHashHex: string;       // bytes32 hex for UI display
  timestamp: bigint;            // uint256
  signature: string;            // bytes: ECDSA signature
}

/** Human-readable credit decision returned to the frontend */
export interface CreditDecision {
  approved: boolean;
  rejectionReason?: string;
  attestation?: UnderwritingAttestation;
  // Derived terms (computed off-chain for display only)
  terms?: {
    invoiceFaceValueUsd: number;
    advanceAmountUsd: number;
    advanceRatePct: number;
    aprPct: number;
    estimatedInterestUsd: number;   // 30-day estimate
    netBorrowerSurplusUsd: number;  // Borrower keeps after repayment
  };
  // The redacted data packet (what gets attested on-chain)
  redactedPayload?: RedactedPayload;
  verificationSteps?: VerificationStep[];
}

export interface RedactedPayload {
  businessIdHash: string;       // Hashed: no PII
  trailing90dRevenue: number;   // Visible financial metric
  disputeRateBps: number;       // Visible financial metric
  invoiceFaceValue: number;     // Visible financial metric
  invoiceDueDateIso: string;    // Visible date
  invoiceHash: string;          // Hashed: no customer identity
  sourceType: string;           // Stripe, QuickBooks, or Banking Invoice
  decision: "APPROVED" | "REJECTED";
}

export interface VerificationStep {
  id: string;
  label: string;
  detail: string;
  status: "verified" | "redacted" | "computed" | "pending";
}

// -- Protocol Constants --------------------------------------------------------
export const MAX_DISPUTE_RATE_BPS = 100;     // 1.00% max dispute rate
export const MIN_REVENUE_COVERAGE = 2;       // 90d revenue must be >= 2x invoice face value
export const ADVANCE_RATE_BPS = 8000;        // 80.00% advance rate
export const BASE_APR_BPS = 800;             // 8.00% base APR

// EIP-712 Domain and Types
export const EIP712_DOMAIN = {
  name: "Credence",
  version: "1",
};

export const ATTESTATION_TYPES = {
  UnderwritingAttestation: [
    { name: "businessIdHash", type: "bytes32" },
    { name: "trailing90dRevenue", type: "uint256" },
    { name: "disputeRateBps", type: "uint256" },
    { name: "invoiceFaceValue", type: "uint256" },
    { name: "invoiceDueDate", type: "uint64" },
    { name: "invoiceHash", type: "bytes32" },
    { name: "timestamp", type: "uint256" },
  ],
};

// -- Underwriting Logic --------------------------------------------------------

/**
 * Computes the dispute rate in basis points (1 bp = 0.01%).
 * disputeRateBps = (disputes / grossVolume) * 10,000
 */
export function computeDisputeRateBps(data: RawBusinessData): number {
  if (data.trailing90dGrossVolume === 0) return 10_000;
  return Math.round((data.trailing90dDisputes / data.trailing90dGrossVolume) * 10_000);
}

/**
 * Computes APR in basis points:
 * aprBps = BASE_APR_BPS (800) + (disputeRateBps / 10)
 * e.g., 5 bps dispute rate -> 800 + 0 = 800 bps (8.00%)
 *      40 bps dispute rate -> 800 + 4 = 804 bps (8.04%)
 */
export function computeAprBps(disputeRateBps: number): number {
  return BASE_APR_BPS + Math.floor(disputeRateBps / 10);
}

/**
 * Hashes sensitive PII using keccak256.
 */
export function redactPII(value: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(value));
}

/**
 * Builds the canonical invoice hash from non-sensitive fields + salt.
 */
export function buildInvoiceHash(
  invoice: RawBusinessData["invoice"],
  salt: string
): string {
  const packed = ethers.solidityPacked(
    ["string", "uint256", "string", "string"],
    [invoice.id, invoice.faceValueUsd, invoice.dueDateIso, salt]
  );
  return ethers.keccak256(packed);
}

/** Converts USD amount to 6-decimal USDC bigint */
export function toUSDC(amountUsd: number): bigint {
  return BigInt(Math.round(amountUsd * 1_000_000));
}

// -- Main Attestation Generator -----------------------------------------------

/**
 * Simulates a client-side zkTLS attestation session against Stripe, QuickBooks, or Banking Invoices.
 *
 * @param rawData Full business data (includes PII: never sent on-chain)
 * @param signerPrivateKey Notary oracle private key (simulated MPC signer)
 * @param contractAddress CredoCreditManager address (verifyingContract in EIP-712)
 * @param chainId Tempo chain ID (42431 for Moderato)
 */
export async function generateZkAttestation(
  rawData: RawBusinessData,
  signerPrivateKey: string,
  contractAddress: string,
  chainId: number = 42431
): Promise<CreditDecision> {

  const source = rawData.sourceType || "Stripe";
  let connectionTarget = "api.stripe.com";
  let revDetail = "Gross volume extracted from Stripe balance transactions API (90-day window)";

  if (source === "QuickBooks") {
    connectionTarget = "quickbooks.api.intuit.com";
    revDetail = "Gross volume extracted from QuickBooks Online invoices and receivables ledger (90-day window)";
  } else if (source === "Banking Invoice") {
    connectionTarget = "openbanking.fintech-gateway.net";
    revDetail = "Gross volume verified from business bank statements and invoices (90-day window)";
  }

  // -- Step 1: TLS Session handshake (simulated) -----------------------------
  const verificationSteps: VerificationStep[] = [
    {
      id: "tls_handshake",
      label: "TLS Session Handshake Verified",
      detail: `Verified HTTPS connection to ${connectionTarget} - TLS 1.3, AES-256-GCM`,
      status: "verified",
    },
    {
      id: "pii_redaction",
      label: "Sensitive PII & Customer Records Redacted",
      detail: `Company name, customer identity, tax IDs, and bank accounts removed from payload`,
      status: "redacted",
    },
  ];

  // -- Step 2: Compute financial metrics ------------------------------------
  const disputeRateBps = computeDisputeRateBps(rawData);
  const trailing90dRevenue = rawData.trailing90dGrossVolume;
  const invoiceFaceValue = rawData.invoice.faceValueUsd;

  verificationSteps.push({
    id: "revenue_verified",
    label: `90-Day Trailing Revenue Asserted ($${trailing90dRevenue.toLocaleString()} USDC)`,
    detail: revDetail,
    status: "computed",
  });

  verificationSteps.push({
    id: "dispute_verified",
    label: `Dispute Rate Verified (${(disputeRateBps / 100).toFixed(2)}%)`,
    detail: `Computed from $${rawData.trailing90dDisputes} disputed over $${trailing90dRevenue} gross volume`,
    status: "computed",
  });

  // -- Step 3: Eligibility checks --------------------------------------------
  if (disputeRateBps > MAX_DISPUTE_RATE_BPS) {
    return {
      approved: false,
      rejectionReason: `Dispute rate ${(disputeRateBps / 100).toFixed(2)}% exceeds maximum 1.00% threshold`,
      verificationSteps,
      redactedPayload: buildRedactedPayload(rawData, disputeRateBps, "REJECTED"),
    };
  }

  if (trailing90dRevenue < invoiceFaceValue * MIN_REVENUE_COVERAGE) {
    return {
      approved: false,
      rejectionReason: `Trailing 90-day revenue ($${trailing90dRevenue.toLocaleString()}) must be at least 2x invoice face value ($${invoiceFaceValue.toLocaleString()})`,
      verificationSteps,
      redactedPayload: buildRedactedPayload(rawData, disputeRateBps, "REJECTED"),
    };
  }

  // -- Step 4: Build the attestation struct ---------------------------------
  const wallet = new ethers.Wallet(signerPrivateKey);
  const salt = `credence_${Date.now()}_${Math.random()}`;

  const businessIdHash = redactPII(rawData.companyRegistrationId);
  const invoiceHashHex = buildInvoiceHash(rawData.invoice, salt);
  const invoiceDueDate = BigInt(
    Math.floor(new Date(rawData.invoice.dueDateIso).getTime() / 1000)
  );
  const timestamp = BigInt(Math.floor(Date.now() / 1000));

  const attestationValues = {
    businessIdHash,
    trailing90dRevenue: toUSDC(trailing90dRevenue),
    disputeRateBps: BigInt(disputeRateBps),
    invoiceFaceValue: toUSDC(invoiceFaceValue),
    invoiceDueDate,
    invoiceHash: invoiceHashHex as `0x${string}`,
    timestamp,
  };

  // -- Step 5: EIP-712 signing -----------------------------------------------
  const domain = {
    ...EIP712_DOMAIN,
    chainId,
    verifyingContract: contractAddress as `0x${string}`,
  };

  const signature = await wallet.signTypedData(domain, ATTESTATION_TYPES, attestationValues);

  // -- Step 6: Compute credit terms for display ------------------------------
  const advanceAmountUsd = (invoiceFaceValue * ADVANCE_RATE_BPS) / 10_000;
  const aprBps = computeAprBps(disputeRateBps);
  const aprPct = aprBps / 100;
  // 30-day interest estimate
  const estimatedInterestUsd =
    (advanceAmountUsd * aprPct * 30) / (365 * 100);
  const netBorrowerSurplusUsd =
    invoiceFaceValue - advanceAmountUsd - estimatedInterestUsd;

  verificationSteps.push({
    id: "terms_computed",
    label: `Credit Line Approved: $${advanceAmountUsd.toLocaleString()} USDC at ${aprPct.toFixed(2)}% APR`,
    detail: `Advance Rate: 80% * $${invoiceFaceValue.toLocaleString()} = $${advanceAmountUsd.toLocaleString()}`,
    status: "computed",
  });

  const attestation: UnderwritingAttestation = {
    ...attestationValues,
    invoiceHashHex,
    signature,
    invoiceHash: BigInt(invoiceHashHex),
  };

  return {
    approved: true,
    attestation,
    terms: {
      invoiceFaceValueUsd: invoiceFaceValue,
      advanceAmountUsd,
      advanceRatePct: ADVANCE_RATE_BPS / 100,
      aprPct,
      estimatedInterestUsd: Math.round(estimatedInterestUsd * 100) / 100,
      netBorrowerSurplusUsd: Math.round(netBorrowerSurplusUsd * 100) / 100,
    },
    redactedPayload: buildRedactedPayload(rawData, disputeRateBps, "APPROVED"),
    verificationSteps,
  };
}

function buildRedactedPayload(
  raw: RawBusinessData,
  disputeRateBps: number,
  decision: "APPROVED" | "REJECTED"
): RedactedPayload {
  return {
    businessIdHash: redactPII(raw.companyRegistrationId),
    trailing90dRevenue: raw.trailing90dGrossVolume,
    disputeRateBps,
    invoiceFaceValue: raw.invoice.faceValueUsd,
    invoiceDueDateIso: raw.invoice.dueDateIso,
    invoiceHash: redactPII(raw.invoice.id),
    sourceType: raw.sourceType || "Stripe",
    decision,
  };
}

/** Verifies that an attestation signature matches the expected notary oracle address */
export function verifyAttestationSignature(
  attestation: UnderwritingAttestation,
  expectedSigner: string,
  contractAddress: string,
  chainId: number = 42431
): boolean {
  const domain = {
    ...EIP712_DOMAIN,
    chainId,
    verifyingContract: contractAddress as `0x${string}`,
  };

  const values = {
    businessIdHash: attestation.businessIdHash,
    trailing90dRevenue: attestation.trailing90dRevenue,
    disputeRateBps: attestation.disputeRateBps,
    invoiceFaceValue: attestation.invoiceFaceValue,
    invoiceDueDate: attestation.invoiceDueDate,
    invoiceHash: attestation.invoiceHashHex as `0x${string}`,
    timestamp: attestation.timestamp,
  };

  const recovered = ethers.verifyTypedData(
    domain,
    ATTESTATION_TYPES,
    values,
    attestation.signature
  );

  return recovered.toLowerCase() === expectedSigner.toLowerCase();
}
