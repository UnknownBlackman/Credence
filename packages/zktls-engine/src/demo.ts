/**
 * demo.ts - CLI demo of the zkTLS attestation engine
 * Run: npx ts-node src/demo.ts
 */
import { generateZkAttestation } from "./attestation";
import { ALL_PROFILES } from "./mockData";

// Designated notary test key (safe for local testing only)
const DEMO_NOTARY_PRIVATE_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const DEMO_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000001";
const DEMO_CHAIN_ID = 31337;

async function runDemo() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  Credence zkTLS Attestation Engine - Demo            ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  for (const profile of ALL_PROFILES) {
    console.log(`\n┌─ ${profile.label} ${"─".repeat(Math.max(0, 44 - profile.label.length))}┐`);
    console.log(`│  Expected: ${profile.expectedOutcome}`);
    console.log("└──────────────────────────────────────────────────────┘");

    const result = await generateZkAttestation(
      profile.data,
      DEMO_NOTARY_PRIVATE_KEY,
      DEMO_CONTRACT_ADDRESS,
      DEMO_CHAIN_ID
    );

    // Verification steps
    if (result.verificationSteps) {
      console.log("\n  Verification Pipeline:");
      for (const step of result.verificationSteps) {
        const icon =
          step.status === "verified" ? "✓" :
          step.status === "redacted" ? "⊘" : "≈";
        console.log(`  [${icon}] ${step.label}`);
        console.log(`      └─ ${step.detail}`);
      }
    }

    if (result.approved && result.terms) {
      console.log("\n  ✅ CREDIT APPROVED");
      console.log(`     Invoice Face Value:  $${result.terms.invoiceFaceValueUsd.toLocaleString()}`);
      console.log(`     Advance Amount:      $${result.terms.advanceAmountUsd.toLocaleString()} USDC`);
      console.log(`     Advance Rate:        ${result.terms.advanceRatePct}%`);
      console.log(`     APR:                 ${result.terms.aprPct.toFixed(2)}%`);
      console.log(`     Est. Interest (30d): $${result.terms.estimatedInterestUsd}`);
      console.log(`     Borrower Surplus:    $${result.terms.netBorrowerSurplusUsd}`);
      console.log(`\n  Attestation Digest:`);
      console.log(`     Signature: ${result.attestation!.signature.slice(0, 20)}...`);
      console.log(`     Invoice Hash: ${result.attestation!.invoiceHashHex.slice(0, 20)}...`);
    } else {
      console.log("\n  ❌ CREDIT REJECTED");
      console.log(`     Reason: ${result.rejectionReason}`);
    }
  }

  console.log("\n\n══════════════════════════════════════════════════════");
  console.log("  Demo complete. Attestations ready for on-chain submission.");
  console.log("══════════════════════════════════════════════════════\n");
}

runDemo().catch(console.error);
