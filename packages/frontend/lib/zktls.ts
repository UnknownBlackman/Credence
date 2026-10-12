/**
 * zktls.ts - Frontend bridge to the Credence zkTLS Attestation Engine
 *
 * Wraps generateZkAttestation with the correct chain/contract config
 * and exports the mock profiles for the demo selector.
 */

import {
  generateZkAttestation,
  verifyAttestationSignature,
  PROFILE_A,
  PROFILE_B,
  PROFILE_C,
  ALL_PROFILES,
  type RawBusinessData,
} from "@credence/zktls-engine";
import { CONTRACT_ADDRESSES } from "./tempoConfig";

// The notary oracle private key used for the demo.
// In production this NEVER touches the frontend.
// The oracle is a separate secure service (TEE / cloud HSM).
// For demo purposes we use the designated notary test key.
const DEMO_NOTARY_PRIVATE_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

export const CHAIN_ID = 42431; // Tempo Moderato

export async function runZkAttestation(
  input: 0 | 1 | 2 | RawBusinessData,
  customLabel?: string
) {
  let rawData: RawBusinessData;
  let profileLabel = customLabel || "Custom Invoice Facility";
  let expectedOutcome: "APPROVED" | "REJECTED" = "APPROVED";

  if (typeof input === "number") {
    const profile = ALL_PROFILES[input];
    rawData = profile.data;
    profileLabel = profile.label;
    expectedOutcome = profile.expectedOutcome;
  } else {
    rawData = input;
    profileLabel = customLabel || `${rawData.companyName} (${rawData.invoice.id})`;
    const disputeBps =
      rawData.trailing90dGrossVolume > 0
        ? Math.round((rawData.trailing90dDisputes / rawData.trailing90dGrossVolume) * 10000)
        : 10000;
    const coverage =
      rawData.invoice.faceValueUsd > 0
        ? rawData.trailing90dGrossVolume / rawData.invoice.faceValueUsd
        : 0;
    expectedOutcome = disputeBps <= 100 && coverage >= 2 ? "APPROVED" : "REJECTED";
  }

  const contractAddress =
    CONTRACT_ADDRESSES.CredenceCreditManager || CONTRACT_ADDRESSES.CredoCreditManager;

  const result = await generateZkAttestation(
    rawData,
    DEMO_NOTARY_PRIVATE_KEY,
    contractAddress,
    CHAIN_ID
  );

  return {
    ...result,
    profileLabel,
    expectedOutcome,
  };
}

export { verifyAttestationSignature, PROFILE_A, PROFILE_B, PROFILE_C, ALL_PROFILES };
export type { RawBusinessData, CreditDecision, UnderwritingAttestation, VerificationStep } from "@credence/zktls-engine";
