import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";
import { EnvMode } from "./env";

const OTHENTIC_AGGREGATOR_RPC = process.env.OTHENTIC_AGGREGATOR_RPC as string;
const PERFORMER_KEY = process.env.PERFORMER_PRIVATE_KEY as `0x${string}`;
const PERFORMER = privateKeyToAccount(process.env.PERFORMER_PRIVATE_KEY as `0x${string}`);

const LEGACY_MESSAGE_BOX_ADDRESS = "0xAf6257d774Ac84cd749f1f47207A9FFe575E12B1"
const STAGING_LEGACY_MESSAGE_BOX_ADDRESS = "0x8926c029423B1e9D7af9D0B93C0C2cf5354Dc998"

export function legacyMessageBox(mode: EnvMode) {
  const address = mode == "PRODUCTION" ? LEGACY_MESSAGE_BOX_ADDRESS : STAGING_LEGACY_MESSAGE_BOX_ADDRESS;
  return address as `0x${string}`;
}

const MESSAGE_BOX_ADDRESS = "0x3a7BD656C8735675bbA3D9b27542030ac2D1C6f4"
export function messageBox(mode: EnvMode) {
  const address = mode == "PRODUCTION" ? MESSAGE_BOX_ADDRESS : MESSAGE_BOX_ADDRESS;
  return address as `0x${string}`;
}

const skateClient = createPublicClient({
  transport: http(process.env.SKATE_RPC),
});

export { OTHENTIC_AGGREGATOR_RPC, PERFORMER, PERFORMER_KEY, skateClient };

export const PERFORMER_SOCKET = process.env.PERFORMER_SOCKET as `${string}.sock`;

export const SKATE_EXPLORER = "https://scan.skatechain.org";
