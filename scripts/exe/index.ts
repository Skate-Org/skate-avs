import { SkateAmmCoreSDK } from "@skate-org/skate-app-amm";

async function main() {
  const sdk = new SkateAmmCoreSDK("PRODUCTION");

  console.log(sdk.allKernelPools());
}

main();
