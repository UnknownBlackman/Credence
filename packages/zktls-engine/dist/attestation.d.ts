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
import type { RawBusinessData } from "./mockData";
/** The on-chain struct submitted to CredoCreditManager */
export interface UnderwritingAttestation {
    businessIdHash: string;
    trailing90dRevenue: bigint;
    disputeRateBps: bigint;
    invoiceFaceValue: bigint;
    invoiceDueDate: bigint;
    invoiceHash: bigint;
    invoiceHashHex: string;
    timestamp: bigint;
    signature: string;
}
/** Human-readable credit decision returned to the frontend */
export interface CreditDecision {
    approved: boolean;
    rejectionReason?: string;
    attestation?: UnderwritingAttestation;
    terms?: {
        invoiceFaceValueUsd: number;
        advanceAmountUsd: number;
        advanceRatePct: number;
        aprPct: number;
        estimatedInterestUsd: number;
        netBorrowerSurplusUsd: number;
    };
    redactedPayload?: RedactedPayload;
    verificationSteps?: VerificationStep[];
}
export interface RedactedPayload {
    businessIdHash: string;
    trailing90dRevenue: number;
    disputeRateBps: number;
    invoiceFaceValue: number;
    invoiceDueDateIso: string;
    invoiceHash: string;
    sourceType: string;
    decision: "APPROVED" | "REJECTED";
}
export interface VerificationStep {
    id: string;
    label: string;
    detail: string;
    status: "verified" | "redacted" | "computed" | "pending";
}
export declare const MAX_DISPUTE_RATE_BPS = 100;
export declare const MIN_REVENUE_COVERAGE = 2;
export declare const ADVANCE_RATE_BPS = 8000;
export declare const BASE_APR_BPS = 800;
export declare const EIP712_DOMAIN: {
    name: string;
    version: string;
};
export declare const ATTESTATION_TYPES: {
    UnderwritingAttestation: {
        name: string;
        type: string;
    }[];
};
/**
 * Computes the dispute rate in basis points (1 bp = 0.01%).
 * disputeRateBps = (disputes / grossVolume) * 10,000
 */
export declare function computeDisputeRateBps(data: RawBusinessData): number;
/**
 * Computes APR in basis points:
 * aprBps = BASE_APR_BPS (800) + (disputeRateBps / 10)
 * e.g., 5 bps dispute rate -> 800 + 0 = 800 bps (8.00%)
 *      40 bps dispute rate -> 800 + 4 = 804 bps (8.04%)
 */
export declare function computeAprBps(disputeRateBps: number): number;
/**
 * Hashes sensitive PII using keccak256.
 */
export declare function redactPII(value: string): string;
/**
 * Builds the canonical invoice hash from non-sensitive fields + salt.
 */
export declare function buildInvoiceHash(invoice: RawBusinessData["invoice"], salt: string): string;
/** Converts USD amount to 6-decimal USDC bigint */
export declare function toUSDC(amountUsd: number): bigint;
/**
 * Simulates a client-side zkTLS attestation session against Stripe, QuickBooks, or Banking Invoices.
 *
 * @param rawData Full business data (includes PII: never sent on-chain)
 * @param signerPrivateKey Notary oracle private key (simulated MPC signer)
 * @param contractAddress CredoCreditManager address (verifyingContract in EIP-712)
 * @param chainId Tempo chain ID (42431 for Moderato)
 */
export declare function generateZkAttestation(rawData: RawBusinessData, signerPrivateKey: string, contractAddress: string, chainId?: number): Promise<CreditDecision>;
/** Verifies that an attestation signature matches the expected notary oracle address */
export declare function verifyAttestationSignature(attestation: UnderwritingAttestation, expectedSigner: string, contractAddress: string, chainId?: number): boolean;
//# sourceMappingURL=attestation.d.ts.map