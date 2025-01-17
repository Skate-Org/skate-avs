import { createPublicClient, http } from "viem";
import { L2_RPC, SKATE_RPC } from "./const";

const l2Client = createPublicClient({
  transport: http(L2_RPC),
  pollingInterval: 1_000,
});
const skateClient = createPublicClient({
  transport: http(SKATE_RPC),
  pollingInterval: 1_000,
});
export { l2Client, skateClient };
