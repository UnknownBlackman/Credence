/**
 * tempoConfig.ts - Tempo Moderato Testnet chain definition for wagmi/viem
 *
 * Key Tempo features:
 * - Chain ID: 42431
 * - No native gas token: fees paid directly in USDC
 * - EVM-compatible (use standard ethers/viem tooling)
 * - Tempo Zones: private EVM subnets for enterprise confidentiality
 */

import { defineChain } from "viem";

export const tempoModerato = defineChain({
  id: 42431,
  name: "Tempo Moderato Testnet",
  nativeCurrency: {
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.moderato.tempo.xyz"],
    },
    public: {
      http: ["https://rpc.moderato.tempo.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Tempo Explorer",
      url: "https://explorer.moderato.tempo.xyz",
    },
  },
  testnet: true,
});

// -- Contract ABIs (minimal - for wagmi hooks) ---------------------------------

export const MOCK_USDC_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "faucet",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export const CREDENCE_VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
  },
  {
    name: "totalAssets",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "availableLiquidity",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "currentApyBps",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalInterestEarned",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
export const CREDO_VAULT_ABI = CREDENCE_VAULT_ABI;

export const CREDENCE_CREDIT_MANAGER_ABI = [
  {
    name: "verifyAndApproveCredit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "attestation",
        type: "tuple",
        components: [
          { name: "businessIdHash", type: "bytes32" },
          { name: "trailing90dRevenue", type: "uint256" },
          { name: "disputeRateBps", type: "uint256" },
          { name: "invoiceFaceValue", type: "uint256" },
          { name: "invoiceDueDate", type: "uint64" },
          { name: "invoiceHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "signature", type: "bytes" },
        ],
      },
    ],
    outputs: [],
  },
  {
    name: "drawdown",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "creditLines",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "borrower", type: "address" }],
    outputs: [
      { name: "approvedLimit", type: "uint256" },
      { name: "drawnAmount", type: "uint256" },
      { name: "aprBps", type: "uint256" },
      { name: "invoiceHash", type: "bytes32" },
      { name: "invoiceDueDate", type: "uint64" },
      { name: "approvedAt", type: "uint64" },
      { name: "active", type: "bool" },
    ],
  },
  {
    name: "remainingCredit",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "borrower", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "CreditApproved",
    type: "event",
    inputs: [
      { name: "borrower", type: "address", indexed: true },
      { name: "approvedLimit", type: "uint256", indexed: false },
      { name: "aprBps", type: "uint256", indexed: false },
      { name: "invoiceHash", type: "bytes32", indexed: true },
    ],
  },
  {
    name: "FundsDrawn",
    type: "event",
    inputs: [
      { name: "borrower", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "remainingCredit", type: "uint256", indexed: false },
    ],
  },
] as const;

export const MPP_REPAYER_ABI = [
  {
    name: "settleInvoicePayment",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "invoiceHash", type: "bytes32" },
      { name: "grossAmount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "previewSettlement",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "borrower", type: "address" },
      { name: "grossAmount", type: "uint256" },
    ],
    outputs: [
      { name: "toVault", type: "uint256" },
      { name: "toBorrower", type: "uint256" },
      { name: "interest", type: "uint256" },
      { name: "protocolFee", type: "uint256" },
    ],
  },
  {
    name: "InvoiceSettled",
    type: "event",
    inputs: [
      { name: "invoiceHash", type: "bytes32", indexed: true },
      { name: "borrower", type: "address", indexed: true },
      { name: "grossAmount", type: "uint256", indexed: false },
      { name: "principalRepaid", type: "uint256", indexed: false },
      { name: "interestPaid", type: "uint256", indexed: false },
      { name: "surplusToOperations", type: "uint256", indexed: false },
    ],
  },
  {
    name: "ProtocolFeeCollected",
    type: "event",
    inputs: [
      { name: "invoiceHash", type: "bytes32", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "feeAmount", type: "uint256", indexed: false },
    ],
  },
] as const;

export const CREDO_CREDIT_MANAGER_ABI = CREDENCE_CREDIT_MANAGER_ABI;

// -- Placeholder addresses: overridden by deployedAddresses.json after deploy --
export const CONTRACT_ADDRESSES = {
  MockUSDC: "0x0000000000000000000000000000000000000001" as `0x${string}`,
  CredenceVault: "0x0000000000000000000000000000000000000002" as `0x${string}`,
  CredoVault: "0x0000000000000000000000000000000000000002" as `0x${string}`,
  CredenceCreditManager: "0x0000000000000000000000000000000000000003" as `0x${string}`,
  CredoCreditManager: "0x0000000000000000000000000000000000000003" as `0x${string}`,
  MPPStreamingRepayer: "0x0000000000000000000000000000000000000004" as `0x${string}`,
};

export const NOTARY_ORACLE_ADDRESS =
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
