import "dotenv/config";

// Kernel
export const SKATE_RPC = process.env.SKATE_RPC as string;

export const PRIVATE_KEY = `0x${process.env.PRIVATE_KEY}` as `0x${string}`;

// AVS
export const L1_RPC = process.env.L1_RPC as string;
export const L1_EXPLORER = process.env.L1_EXPLORER as string;
export const AVS_GOVERNANCE_ADDRESS = process.env.AVS_GOVERNANCE_ADDRESS as `0x${string}`;

export const L2_RPC = process.env.L2_RPC as string;
export const L2_EXPLORER = process.env.L2_EXPLORER as string;
export const ATTESTATION_CENTER_ADDRESS = process.env.ATTESTATION_CENTER_ADDRESS as `0x${string}`;
export const ATTESTATION_CENTER_GENESIS_BLOCK = Number(
  process.env.ATTESTATION_CENTER_GENESIS_BLOCK,
);
