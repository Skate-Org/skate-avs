import { EzSKATE, EzRVault_ABI } from "../../lib/ABI/EzRVault";
import { encodeFunctionData } from "viem";

async function main() {
  console.log("Encoding ezSKATE claim calldata...");
  console.log(`ezSKATE Vault: ${EzSKATE}`);

  // Define the withdrawal tuple parameters
  const withdrawal = {
    staker: "0xC12E4D31e92ceDC1AD4c8c23DBcE2C5f7Cb52998" as `0x${string}`,
    delegatedTo: "0x8f14feCD0b3c592bAA45E02D7C7A95c891730FCC" as `0x${string}`,
    withdrawer: "0xC12E4D31e92ceDC1AD4c8c23DBcE2C5f7Cb52998" as `0x${string}`,
    nonce: 3n,
    startBlock: 22922149,
    strategies: ["0xA9ba139E8Be19529854234b956FA45716Ade505A" as `0x${string}`] as const,
    scaledShares: [189112125054856218974n] as const,
  };

  console.log("\\nWithdrawal parameters:");
  console.log(`  staker: ${withdrawal.staker}`);
  console.log(`  delegatedTo: ${withdrawal.delegatedTo}`);
  console.log(`  withdrawer: ${withdrawal.withdrawer}`);
  console.log(`  nonce: ${withdrawal.nonce}`);
  console.log(`  startBlock: ${withdrawal.startBlock}`);
  console.log(`  strategies: ${withdrawal.strategies}`);
  console.log(`  scaledShares: ${withdrawal.scaledShares}`);

  try {
    // Encode the claim function data
    const encodedData = encodeFunctionData({
      abi: EzRVault_ABI,
      functionName: "claim",
      args: [withdrawal],
    });

    console.log("\\n=== Encoded Claim Calldata ===");
    console.log(encodedData);

    console.log("\\n=== Function Signature ===");
    console.log(encodedData.slice(0, 10));

    console.log("\\n=== Parameters Data ===");
    console.log(encodedData.slice(10));

    console.log("\\n=== Usage Instructions ===");
    console.log("This calldata can be used to:");
    console.log("1. Call the claim function directly on the ezSKATE vault");
    console.log("2. Use in a multisig transaction");
    console.log("3. Use in a smart contract call");
    console.log(`4. Target contract: ${EzSKATE}`);

  } catch (error) {
    console.error("Error encoding claim calldata:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log("\\nClaim calldata encoding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\\nClaim calldata encoding failed:", error);
      process.exit(1);
    });
}