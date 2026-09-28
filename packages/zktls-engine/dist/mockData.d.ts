/**
 * mockData.ts - Realistic business profiles for the Credence zkTLS demo
 *
 * Three profiles illustrate the full underwriting spectrum:
 *   A: Prime SaaS (Stripe)           -> Approved at best rate
 *   B: Mid-Market (QuickBooks)       -> Approved at standard rate
 *   C: High-Risk (Banking Invoice)   -> Rejected (dispute rate too high)
 */
export interface RawBusinessData {
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
    trailing90dGrossVolume: number;
    trailing90dRefunds: number;
    trailing90dDisputes: number;
    trailing90dChargeCount: number;
    invoice: {
        id: string;
        customerName: string;
        customerEmail: string;
        faceValueUsd: number;
        dueDateIso: string;
        description: string;
        currency: string;
    };
}
export declare const PROFILE_A: RawBusinessData;
export declare const PROFILE_B: RawBusinessData;
export declare const PROFILE_C: RawBusinessData;
export declare const ALL_PROFILES: ({
    label: string;
    data: RawBusinessData;
    expectedOutcome: "APPROVED";
} | {
    label: string;
    data: RawBusinessData;
    expectedOutcome: "REJECTED";
})[];
//# sourceMappingURL=mockData.d.ts.map