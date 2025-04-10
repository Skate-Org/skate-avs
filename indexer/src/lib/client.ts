import { createPublicClient, http } from "viem";
import { L1_RPC, L2_RPC } from "./const";
import { mainnet, mantle } from "viem/chains";

const l1Transport = http(L1_RPC);
export const l1Client = createPublicClient({
  chain: mainnet,
  transport: l1Transport,
});

const l2Transport = http(L2_RPC);
export const l2Client = createPublicClient({
  chain: mantle,
  transport: l2Transport,
});

const SKATE_RPC_URL = "https://rpc.skatechain.org";
const skateChain = {
  id: 5050,
  name: "Skate Mainnet",
  rpcUrls: { default: { http: [SKATE_RPC_URL] } },
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: "Skate scan",
      url: "https://scan.skatechain.org",
      apiUrl: "https://api.scan.skatechain.org/api",
    },
  },
};

export const skateClient = createPublicClient({
  chain: skateChain,
  transport: http(SKATE_RPC_URL),
});
