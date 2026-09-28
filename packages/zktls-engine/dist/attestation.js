"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATTESTATION_TYPES = exports.EIP712_DOMAIN = exports.BASE_APR_BPS = exports.ADVANCE_RATE_BPS = exports.MIN_REVENUE_COVERAGE = exports.MAX_DISPUTE_RATE_BPS = void 0;
exports.computeDisputeRateBps = computeDisputeRateBps;
exports.computeAprBps = computeAprBps;
exports.redactPII = redactPII;
exports.buildInvoiceHash = buildInvoiceHash;
exports.toUSDC = toUSDC;
exports.generateZkAttestation = generateZkAttestation;
exports.verifyAttestationSignature = verifyAttestationSignature;
const ethers_1 = require("ethers");
// -- Protocol Constants --------------------------------------------------------
exports.MAX_DISPUTE_RATE_BPS = 100; // 1.00% max dispute rate
exports.MIN_REVENUE_COVERAGE = 2; // 90d revenue must be >= 2x invoice face value
exports.ADVANCE_RATE_BPS = 8000; // 80.00% advance rate
exports.BASE_APR_BPS = 800; // 8.00% base APR
// EIP-712 Domain and Types
exports.EIP712_DOMAIN = {
    name: "Credence",
    version: "1",
};
exports.ATTESTATION_TYPES = {
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
function computeDisputeRateBps(data) {
    if (data.trailing90dGrossVolume === 0)
        return 10000;
    return Math.round((data.trailing90dDisputes / data.trailing90dGrossVolume) * 10000);
}
/**
 * Computes APR in basis points:
 * aprBps = BASE_APR_BPS (800) + (disputeRateBps / 10)
 * e.g., 5 bps dispute rate -> 800 + 0 = 800 bps (8.00%)
 *      40 bps dispute rate -> 800 + 4 = 804 bps (8.04%)
 */
function computeAprBps(disputeRateBps) {
    return exports.BASE_APR_BPS + Math.floor(disputeRateBps / 10);
}
/**
 * Hashes sensitive PII using keccak256.
 */
function redactPII(value) {
    return ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(value));
}
/**
 * Builds the canonical invoice hash from non-sensitive fields + salt.
 */
function buildInvoiceHash(invoice, salt) {
    const packed = ethers_1.ethers.solidityPacked(["string", "uint256", "string", "string"], [invoice.id, invoice.faceValueUsd, invoice.dueDateIso, salt]);
    return ethers_1.ethers.keccak256(packed);
}
/** Converts USD amount to 6-decimal USDC bigint */
function toUSDC(amountUsd) {
    return BigInt(Math.round(amountUsd * 1000000));
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
async function generateZkAttestation(rawData, signerPrivateKey, contractAddress, chainId = 42431) {
    const source = rawData.sourceType || "Stripe";
    let connectionTarget = "api.stripe.com";
    let revDetail = "Gross volume extracted from Stripe balance transactions API (90-day window)";
    if (source === "QuickBooks") {
        connectionTarget = "quickbooks.api.intuit.com";
        revDetail = "Gross volume extracted from QuickBooks Online invoices and receivables ledger (90-day window)";
    }
    else if (source === "Banking Invoice") {
        connectionTarget = "openbanking.fintech-gateway.net";
        revDetail = "Gross volume verified from business bank statements and invoices (90-day window)";
    }
    // -- Step 1: TLS Session handshake (simulated) -----------------------------
    const verificationSteps = [
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
    if (disputeRateBps > exports.MAX_DISPUTE_RATE_BPS) {
        return {
            approved: false,
            rejectionReason: `Dispute rate ${(disputeRateBps / 100).toFixed(2)}% exceeds maximum 1.00% threshold`,
            verificationSteps,
            redactedPayload: buildRedactedPayload(rawData, disputeRateBps, "REJECTED"),
        };
    }
    if (trailing90dRevenue < invoiceFaceValue * exports.MIN_REVENUE_COVERAGE) {
        return {
            approved: false,
            rejectionReason: `Trailing 90-day revenue ($${trailing90dRevenue.toLocaleString()}) must be at least 2x invoice face value ($${invoiceFaceValue.toLocaleString()})`,
            verificationSteps,
            redactedPayload: buildRedactedPayload(rawData, disputeRateBps, "REJECTED"),
        };
    }
    // -- Step 4: Build the attestation struct ---------------------------------
    const wallet = new ethers_1.ethers.Wallet(signerPrivateKey);
    const salt = `credence_${Date.now()}_${Math.random()}`;
    const businessIdHash = redactPII(rawData.companyRegistrationId);
    const invoiceHashHex = buildInvoiceHash(rawData.invoice, salt);
    const invoiceDueDate = BigInt(Math.floor(new Date(rawData.invoice.dueDateIso).getTime() / 1000));
    const timestamp = BigInt(Math.floor(Date.now() / 1000));
    const attestationValues = {
        businessIdHash,
        trailing90dRevenue: toUSDC(trailing90dRevenue),
        disputeRateBps: BigInt(disputeRateBps),
        invoiceFaceValue: toUSDC(invoiceFaceValue),
        invoiceDueDate,
        invoiceHash: invoiceHashHex,
        timestamp,
    };
    // -- Step 5: EIP-712 signing -----------------------------------------------
    const domain = {
        ...exports.EIP712_DOMAIN,
        chainId,
        verifyingContract: contractAddress,
    };
    const signature = await wallet.signTypedData(domain, exports.ATTESTATION_TYPES, attestationValues);
    // -- Step 6: Compute credit terms for display ------------------------------
    const advanceAmountUsd = (invoiceFaceValue * exports.ADVANCE_RATE_BPS) / 10000;
    const aprBps = computeAprBps(disputeRateBps);
    const aprPct = aprBps / 100;
    // 30-day interest estimate
    const estimatedInterestUsd = (advanceAmountUsd * aprPct * 30) / (365 * 100);
    const netBorrowerSurplusUsd = invoiceFaceValue - advanceAmountUsd - estimatedInterestUsd;
    verificationSteps.push({
        id: "terms_computed",
        label: `Credit Line Approved: $${advanceAmountUsd.toLocaleString()} USDC at ${aprPct.toFixed(2)}% APR`,
        detail: `Advance Rate: 80% * $${invoiceFaceValue.toLocaleString()} = $${advanceAmountUsd.toLocaleString()}`,
        status: "computed",
    });
    const attestation = {
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
            advanceRatePct: exports.ADVANCE_RATE_BPS / 100,
            aprPct,
            estimatedInterestUsd: Math.round(estimatedInterestUsd * 100) / 100,
            netBorrowerSurplusUsd: Math.round(netBorrowerSurplusUsd * 100) / 100,
        },
        redactedPayload: buildRedactedPayload(rawData, disputeRateBps, "APPROVED"),
        verificationSteps,
    };
}
function buildRedactedPayload(raw, disputeRateBps, decision) {
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
function verifyAttestationSignature(attestation, expectedSigner, contractAddress, chainId = 42431) {
    const domain = {
        ...exports.EIP712_DOMAIN,
        chainId,
        verifyingContract: contractAddress,
    };
    const values = {
        businessIdHash: attestation.businessIdHash,
        trailing90dRevenue: attestation.trailing90dRevenue,
        disputeRateBps: attestation.disputeRateBps,
        invoiceFaceValue: attestation.invoiceFaceValue,
        invoiceDueDate: attestation.invoiceDueDate,
        invoiceHash: attestation.invoiceHashHex,
        timestamp: attestation.timestamp,
    };
    const recovered = ethers_1.ethers.verifyTypedData(domain, exports.ATTESTATION_TYPES, values, attestation.signature);
    return recovered.toLowerCase() === expectedSigner.toLowerCase();
}
//# sourceMappingURL=attestation.js.map