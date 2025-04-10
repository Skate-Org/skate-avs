import "dotenv/config";

// AVS
export const L1_RPC = process.env.L1_RPC as string;
export const L2_RPC = process.env.L2_RPC as string;
export const L1_EXPLORER = process.env.L1_EXPLORER as string;
export const L2_EXPLORER = process.env.L2_EXPLORER as string;

export const ATTESTATION_CENTER_ADDRESS = "0x8B48423C8f6c9dEF28BFE5fd1870984817D0feB9";
export const ATTESTATION_CENTER_GENESIS_BLOCK = 71329746;
export const AVS_GOVERNANCE_ADDRESS = "0xFC569B3b74e15cf48AA684144e072e839Fd89380";

export const BOOTSTRAP_ID = process.env.OTHENTIC_BOOTSTRAP_ID as string;

export enum CHAIN {
  MAINNET = 1,
  MANTLE = 5000,
  SKATE = 5050,
}
