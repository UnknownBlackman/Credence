"use strict";
/**
 * mockData.ts - Realistic business profiles for the Credence zkTLS demo
 *
 * Three profiles illustrate the full underwriting spectrum:
 *   A: Prime SaaS (Stripe)           -> Approved at best rate
 *   B: Mid-Market (QuickBooks)       -> Approved at standard rate
 *   C: High-Risk (Banking Invoice)   -> Rejected (dispute rate too high)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_PROFILES = exports.PROFILE_C = exports.PROFILE_B = exports.PROFILE_A = void 0;
// -- Profile A: Prime SaaS Company (Stripe Verified) ---------------------------
exports.PROFILE_A = {
    companyName: "Acme SaaS Inc.",
    companyRegistrationId: "DE-98234-LLC",
    bankAccountNumber: "****4821",
    bankRoutingNumber: "021000021",
    stripeAccountId: "acct_1Qx8AbCdEfGhIjKl",
    sourceType: "Stripe",
    ownerEmail: "cfo@acmesaas.com",
    ownerTaxId: "XX-XXXXXXX",
    trailing90dGrossVolume: 150000,
    trailing90dRefunds: 1200,
    trailing90dDisputes: 75, // 0.05% dispute rate
    trailing90dChargeCount: 3200,
    invoice: {
        id: "INV-2026-09-0042",
        customerName: "Globex Corporation", // Redacted
        customerEmail: "ap@globex.com", // Redacted
        faceValueUsd: 45000,
        dueDateIso: "2026-10-30",
        description: "Enterprise SaaS License: Q4 2026",
        currency: "USD",
    },
};
// -- Profile B: Mid-Market Logistics Company (QuickBooks Verified) -------------
exports.PROFILE_B = {
    companyName: "FastFreight LLC",
    companyRegistrationId: "TX-44128-LLC",
    bankAccountNumber: "****7734",
    bankRoutingNumber: "113000023",
    accountingAccountId: "qb_realm_9130348210",
    sourceType: "QuickBooks",
    ownerEmail: "finance@fastfreight.co",
    ownerTaxId: "XX-XXXXXXX",
    trailing90dGrossVolume: 80000,
    trailing90dRefunds: 2100,
    trailing90dDisputes: 320, // 0.40% dispute rate
    trailing90dChargeCount: 890,
    invoice: {
        id: "INV-2026-09-FF-0017",
        customerName: "RetailMart Holdings", // Redacted
        customerEmail: "accounts@retailmart.com", // Redacted
        faceValueUsd: 25000,
        dueDateIso: "2026-11-15",
        description: "Freight & Logistics Services: October 2026",
        currency: "USD",
    },
};
// -- Profile C: High-Risk / Subprime (Banking Invoice Verified) ----------------
exports.PROFILE_C = {
    companyName: "QuickDropShip Co.",
    companyRegistrationId: "FL-88002-INC",
    bankAccountNumber: "****1193",
    bankRoutingNumber: "063102152",
    bankEntityId: "chase_commercial_node_448",
    sourceType: "Banking Invoice",
    ownerEmail: "owner@quickdropship.biz",
    ownerTaxId: "XX-XXXXXXX",
    trailing90dGrossVolume: 30000,
    trailing90dRefunds: 4800,
    trailing90dDisputes: 840, // 2.8% dispute rate: REJECTED
    trailing90dChargeCount: 450,
    invoice: {
        id: "INV-2026-09-QD-004",
        customerName: "BulkBuyers Inc.", // Redacted
        customerEmail: "billing@bulkbuyers.io", // Redacted
        faceValueUsd: 10000,
        dueDateIso: "2026-10-31",
        description: "Product Resale: October Batch",
        currency: "USD",
    },
};
exports.ALL_PROFILES = [
    { label: "Profile A - Prime SaaS (Stripe)", data: exports.PROFILE_A, expectedOutcome: "APPROVED" },
    { label: "Profile B - Mid-Market Logistics (QuickBooks)", data: exports.PROFILE_B, expectedOutcome: "APPROVED" },
    { label: "Profile C - High-Risk (Banking Invoice)", data: exports.PROFILE_C, expectedOutcome: "REJECTED" },
];
//# sourceMappingURL=mockData.js.map