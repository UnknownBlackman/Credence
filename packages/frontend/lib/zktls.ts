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
} from "@credence/zktls-engine";
import { CONTRACT_ADDRESSES } from "./tempoConfig";

// The notary oracle private key used for the demo.
// In production this NEVER touches the frontend.
// The oracle is a separate secure service (TEE / cloud HSM).
// For demo purposes we use the designated notary test key.
const DEMO_NOTARY_PRIVATE_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

export const CHAIN_ID = 42431; // Tempo Moderato

export async function runZkAttestation(profileIndex: 0 | 1 | 2) {
  const profile = ALL_PROFILES[profileIndex];
  const contractAddress = CONTRACT_ADDRESSES.CredenceCreditManager || CONTRACT_ADDRESSES.CredoCreditManager;

  const result = await generateZkAttestation(
    profile.data,
    DEMO_NOTARY_PRIVATE_KEY,
    contractAddress,
    CHAIN_ID
  );

  return {
    ...result,
    profileLabel: profile.label,
    expectedOutcome: profile.expectedOutcome,
  };
}

export { verifyAttestationSignature, PROFILE_A, PROFILE_B, PROFILE_C, ALL_PROFILES };
export type { RawBusinessData, CreditDecision, UnderwritingAttestation, VerificationStep } from "@credence/zktls-engine";
