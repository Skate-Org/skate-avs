import "dotenv/config";

// Kernel
export const SKATE_RPC = process.env.SKATE_RPC as string;

export const PRIVATE_KEY = `0x${process.env.PRIVATE_KEY}` as `0x${string}`;

// AVS
export const L1_RPC = process.env.L1_RPC as string;
export const L1_EXPLORER = process.env.L1_EXPLORER as string;
export const AVS_GOVERNANCE_ADDRESS = process.env
  .AVS_GOVERNANCE_ADDRESS as `0x${string}`;

export const L2_RPC = process.env.L2_RPC as string;
export const L2_EXPLORER = process.env.L2_EXPLORER as string;
export const ATTESTATION_CENTER_ADDRESS = process.env
  .ATTESTATION_CENTER_ADDRESS as `0x${string}`;
export const OBLS_ADDRESS = process.env.OBLS_ADDRESS as `0x${string}`;
export const ATTESTATION_CENTER_GENESIS_BLOCK = Number(
  process.env.ATTESTATION_CENTER_GENESIS_BLOCK,
);

export const SKATE_BETA_ERC20 = "0x379049b8d8Dc103551Bcf5B22C97c1164E898757";
export const SKATE_BETA_EL_STRATEGY =
  "0x9E1df768AD1e664498Ff6EB31e9a7122a19D6De3";
