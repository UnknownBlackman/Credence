/**
 * index.ts - Public API for the zkTLS Attestation Engine
 */
export { generateZkAttestation, verifyAttestationSignature } from "./attestation";
export type {
  UnderwritingAttestation,
  CreditDecision,
  RedactedPayload,
  VerificationStep,
} from "./attestation";
export { PROFILE_A, PROFILE_B, PROFILE_C, ALL_PROFILES } from "./mockData";
export type { RawBusinessData } from "./mockData";
