/**
 * mockData.ts - Realistic business profiles for the Credence zkTLS demo
 *
 * Three profiles illustrate the full underwriting spectrum:
 *   A: Prime SaaS (Stripe)           -> Approved at best rate
 *   B: Mid-Market (QuickBooks)       -> Approved at standard rate
 *   C: High-Risk (Banking Invoice)   -> Rejected (dispute rate too high)
 */

export interface RawBusinessData {
  // Business identity (will be hashed / redacted before going on-chain)
  companyName: string;
  companyRegistrationId: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  stripeAccountId?: string;
  accountingAccountId?: string;
  bankEntityId?: string;
  sourceType?: "Stripe" | "QuickBooks" | "Banking Invoice";
  ownerEmail: string;
  ownerTaxId: string;

  // Verified financials (extracted via zkTLS from Stripe, QuickBooks, or Banking Invoices)
  trailing90dGrossVolume: number;   // USD
  trailing90dRefunds: number;       // USD
  trailing90dDisputes: number;      // USD - used to compute dispute rate
  trailing90dChargeCount: number;   // Total transactions

  // Invoice being factored
  invoice: {
    id: string;
    customerName: string;     // Will be redacted
    customerEmail: string;    // Will be redacted
    faceValueUsd: number;
    dueDateIso: string;       // ISO date string
    description: string;
    currency: string;
  };
}

// -- Profile A: Prime SaaS Company (Stripe Verified) ---------------------------
export const PROFILE_A: RawBusinessData = {
  companyName: "Acme SaaS Inc.",
  companyRegistrationId: "DE-98234-LLC",
  bankAccountNumber: "****4821",
  bankRoutingNumber: "021000021",
  stripeAccountId: "acct_1Qx8AbCdEfGhIjKl",
  sourceType: "Stripe",
  ownerEmail: "cfo@acmesaas.com",
  ownerTaxId: "XX-XXXXXXX",

  trailing90dGrossVolume: 150_000,
  trailing90dRefunds: 1_200,
  trailing90dDisputes: 75,           // 0.05% dispute rate
  trailing90dChargeCount: 3_200,

  invoice: {
    id: "INV-2026-09-0042",
    customerName: "Globex Corporation",     // Redacted
    customerEmail: "ap@globex.com",          // Redacted
    faceValueUsd: 45_000,
    dueDateIso: "2026-10-30",
    description: "Enterprise SaaS License: Q4 2026",
    currency: "USD",
  },
};

// -- Profile B: Mid-Market Logistics Company (QuickBooks Verified) -------------
export const PROFILE_B: RawBusinessData = {
  companyName: "FastFreight LLC",
  companyRegistrationId: "TX-44128-LLC",
  bankAccountNumber: "****7734",
  bankRoutingNumber: "113000023",
  accountingAccountId: "qb_realm_9130348210",
  sourceType: "QuickBooks",
  ownerEmail: "finance@fastfreight.co",
  ownerTaxId: "XX-XXXXXXX",

  trailing90dGrossVolume: 80_000,
  trailing90dRefunds: 2_100,
  trailing90dDisputes: 320,          // 0.40% dispute rate
  trailing90dChargeCount: 890,

  invoice: {
    id: "INV-2026-09-FF-0017",
    customerName: "RetailMart Holdings",    // Redacted
    customerEmail: "accounts@retailmart.com", // Redacted
    faceValueUsd: 25_000,
    dueDateIso: "2026-11-15",
    description: "Freight & Logistics Services: October 2026",
    currency: "USD",
  },
};

// -- Profile C: High-Risk / Subprime (Banking Invoice Verified) ----------------
export const PROFILE_C: RawBusinessData = {
  companyName: "QuickDropShip Co.",
  companyRegistrationId: "FL-88002-INC",
  bankAccountNumber: "****1193",
  bankRoutingNumber: "063102152",
  bankEntityId: "chase_commercial_node_448",
  sourceType: "Banking Invoice",
  ownerEmail: "owner@quickdropship.biz",
  ownerTaxId: "XX-XXXXXXX",

  trailing90dGrossVolume: 30_000,
  trailing90dRefunds: 4_800,
  trailing90dDisputes: 840,          // 2.8% dispute rate: REJECTED
  trailing90dChargeCount: 450,

  invoice: {
    id: "INV-2026-09-QD-004",
    customerName: "BulkBuyers Inc.",        // Redacted
    customerEmail: "billing@bulkbuyers.io", // Redacted
    faceValueUsd: 10_000,
    dueDateIso: "2026-10-31",
    description: "Product Resale: October Batch",
    currency: "USD",
  },
};

export const ALL_PROFILES = [
  { label: "Profile A - Prime SaaS (Stripe)", data: PROFILE_A, expectedOutcome: "APPROVED" as const },
  { label: "Profile B - Mid-Market Logistics (QuickBooks)", data: PROFILE_B, expectedOutcome: "APPROVED" as const },
  { label: "Profile C - High-Risk (Banking Invoice)", data: PROFILE_C, expectedOutcome: "REJECTED" as const },
];
