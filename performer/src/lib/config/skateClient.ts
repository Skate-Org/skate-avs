import { createPublicClient, http } from "viem";
import "dotenv/config";

export const skateClient = createPublicClient({
  transport: http(process.env.SKATE_RPC),
});

export const SKATE_EXPLORER = "https://scan.skatechain.org";
