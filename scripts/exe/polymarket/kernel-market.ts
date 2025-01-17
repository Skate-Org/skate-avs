import { KernelPolymarket_ABI } from "../../lib/ABI/mock";
import { skateClient } from "../../lib/client";

async function main() {
  const MARKET_ADDRESS = "0xB13E15741f51a7EA1C4B37DBe3de2626EAE3ba31";
  const proxyAddress = await skateClient.readContract({
    address: MARKET_ADDRESS,
    abi: KernelPolymarket_ABI,
    functionName: "getSafeByUser",
    args: [3n, "0x24c408658dffdd3cec4a59b9e8a5a60ad62725508b8707f4e07475aa40f0409d"]
  });
  console.log("\nSafe address for user:", proxyAddress);
}

main();
