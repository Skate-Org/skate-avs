import { adapter as ammAdapter } from "@skate-org/skate-app-amm";

async function main() {
  console.log(ammAdapter.kernelManager.functionSelector);
}

main();
