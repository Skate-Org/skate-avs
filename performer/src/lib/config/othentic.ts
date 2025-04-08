import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";

export const OTHENTIC_AGGREGATOR_RPC = process.env.OTHENTIC_AGGREGATOR_RPC as string;
export const PERFORMER_KEY = process.env.PERFORMER_PRIVATE_KEY as `0x${string}`;
export const PERFORMER = privateKeyToAccount(process.env.PERFORMER_PRIVATE_KEY as `0x${string}`);
export const PERFORMER_SOCKET = process.env.PERFORMER_SOCKET as `${string}.sock`;
