import "dotenv/config";

// Kernel
export const SKATE_RPC = process.env.SKATE_RPC as string;


export const MESSAGE_BOX_ADDRESS = "0xAf6257d774Ac84cd749f1f47207A9FFe575E12B1"
export const MESSAGE_BOX_GENESIS_BLOCK = 3931973
export const STAGING_MESSAGE_BOX_ADDRESS = "0x8926c029423B1e9D7af9D0B93C0C2cf5354Dc998"
export const STAGING_MESSAGE_BOX_GENESIS_BLOCK = 602796

// AVS
export const L1_RPC = process.env.L1_RPC as string;
export const L2_RPC = process.env.L2_RPC as string;

export const ATTESTATION_CENTER_ADDRESS = "0x8B48423C8f6c9dEF28BFE5fd1870984817D0feB9"
export const ATTESTATION_CENTER_GENESIS_BLOCK = 71329746
export const AVS_GOVERNANCE_ADDRESS = "0xFC569B3b74e15cf48AA684144e072e839Fd89380"

export const BOOTSTRAP_ID = process.env.OTHENTIC_BOOTSTRAP_ID as string;
