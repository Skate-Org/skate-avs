import { createPublicClient, http } from "viem";
import { L1_RPC, L2_RPC, SKATE_RPC } from "./const";

export const l1Client = createPublicClient({
  transport: http(L1_RPC),
  pollingInterval: 6_000,
});

export const l2Client = createPublicClient({
  transport: http(L2_RPC),
  pollingInterval: 1_000,
});

export const skateClient = createPublicClient({
  transport: http(SKATE_RPC),
  pollingInterval: 1_000,
});
