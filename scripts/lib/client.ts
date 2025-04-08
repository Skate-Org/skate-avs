import { createPublicClient, createWalletClient, fallback, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { L1_RPC, L2_RPC, PRIVATE_KEY, SKATE_RPC } from "./const";

export const l1Client = createPublicClient({
  transport: fallback([http(L1_RPC)]),
});

export const l1WriteClient = createWalletClient({
  transport: fallback([http(L1_RPC)]),
});

export const l2Client = createPublicClient({
  transport: fallback([http(L2_RPC), http("https://rpc.mantle.xyz")]),
});

export const l2WriteClient = createWalletClient({
  transport: fallback([http(L2_RPC), http("https://rpc.mantle.xyz")]),
});

export const avsOwnerAccount = privateKeyToAccount(PRIVATE_KEY);

export const skateClient = createPublicClient({
  transport: http(SKATE_RPC),
});
