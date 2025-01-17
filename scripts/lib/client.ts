import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { L1_RPC, L2_RPC, PRIVATE_KEY, SKATE_RPC } from "./const";

export const l1Client = createPublicClient({
  transport: http(L1_RPC),
  pollingInterval: 1_000,
});

export const l1WriteClient = createWalletClient({
  transport: http(L1_RPC),
});

export const l2Client = createPublicClient({
  transport: http(L2_RPC),
  pollingInterval: 1_000,
});

export const avsOwnerAccount = privateKeyToAccount(PRIVATE_KEY);

export const skateClient = createPublicClient({
  transport: http(SKATE_RPC),
  pollingInterval: 1_000,
});
