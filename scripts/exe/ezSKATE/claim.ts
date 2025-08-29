import { L1_EXPLORER } from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";
import { EzSKATE, EzRVault_ABI } from "../../lib/ABI/EzRVault";
import { formatEther } from "viem";

async function main() {
  // Get withdrawal root from command line argument
  const withdrawalRoot = process.argv[2];

  if (!withdrawalRoot) {
    console.error(
      "Usage: npm run ts-node exe/ezSKATE/claim.ts <withdrawal_root>",
    );
    console.error("Example: npm run ts-node exe/ezSKATE/claim.ts 0x1234...");
    process.exit(1);
  }

  console.log(`Claiming withdrawal for ezSKATE vault`);
  console.log(`Using account: ${avsOwnerAccount.address}`);
  console.log(`ezSKATE vault: ${EzSKATE}`);
  console.log(`Withdrawal root: ${withdrawalRoot}`);

  try {
    // Step 1: Check withdrawal request details
    console.log("\nChecking withdrawal request details...");
    const withdrawRequestInfo = await l1Client.readContract({
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "withdrawRequest",
      args: [withdrawalRoot as `0x${string}`],
    });

    const withdrawer = withdrawRequestInfo[0];
    const lpTokenAmountLocked = withdrawRequestInfo[1];
    const createdAtBlock = withdrawRequestInfo[2];

    console.log(`Withdrawer: ${withdrawer}`);
    console.log(
      `LP Token Amount Locked: ${formatEther(lpTokenAmountLocked)} ezSKATE`,
    );
    console.log(`Created At Block: ${createdAtBlock}`);

    // Verify the withdrawer matches current account
    if (withdrawer.toLowerCase() !== avsOwnerAccount.address.toLowerCase()) {
      throw new Error(
        `Withdrawal was initiated by ${withdrawer}, but current account is ${avsOwnerAccount.address}`,
      );
    }

    // Step 2: Check if cooldown period has passed
    console.log("\nChecking cooldown period...");
    const cooldownBlocks = await l1Client.readContract({
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "cooldownBlocks",
    });

    const currentBlock = await l1Client.getBlockNumber();
    const canClaimAtBlock = createdAtBlock + cooldownBlocks;
    const blocksRemaining =
      canClaimAtBlock > currentBlock
        ? canClaimAtBlock - currentBlock
        : BigInt(0);

    console.log(`Cooldown period: ${cooldownBlocks} blocks`);
    console.log(`Current block: ${currentBlock}`);
    console.log(`Can claim at block: ${canClaimAtBlock}`);
    console.log(`Blocks remaining: ${blocksRemaining}`);

    if (blocksRemaining > BigInt(0)) {
      throw new Error(
        `Cooldown period not yet complete. Wait ${blocksRemaining} more blocks before claiming.`,
      );
    }

    // Step 3: Get delegation manager and prepare withdrawal struct
    console.log("\nPreparing claim transaction...");
    const delegationManager = await l1Client.readContract({
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "delegationManager",
    });

    const underlyingStrategy = await l1Client.readContract({
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "underlyingStrategy",
    });

    console.log(`Delegation Manager: ${delegationManager}`);
    console.log(`Underlying Strategy: ${underlyingStrategy}`);

    // Note: In a real implementation, you would need to get the actual withdrawal struct
    // from EigenLayer's delegation manager. For this example, we'll create a minimal struct.
    // This would typically come from querying the delegation manager's withdrawal queue.

    const withdrawal = {
      staker: EzSKATE as `0x${string}`, // The vault is the staker
      delegatedTo: avsOwnerAccount.address, // Assuming vault is delegated to this address
      withdrawer: avsOwnerAccount.address,
      nonce: BigInt(0), // This should be the actual nonce from EigenLayer
      startBlock: Number(createdAtBlock),
      strategies: [underlyingStrategy] as readonly `0x${string}`[],
      scaledShares: [lpTokenAmountLocked] as readonly bigint[], // This might need scaling
    };

    console.log("\nWarning: This is a simplified claim implementation.");
    console.log(
      "In production, you should query EigenLayer's delegation manager",
    );
    console.log("to get the exact withdrawal struct parameters.");

    // Step 4: Execute claim
    console.log(
      `\nExecuting claim for ${formatEther(lpTokenAmountLocked)} ezSKATE...`,
    );

    try {
      const { request: claimRequest } = await l1Client.simulateContract({
        account: avsOwnerAccount,
        address: EzSKATE,
        abi: EzRVault_ABI,
        functionName: "claim",
        args: [withdrawal],
      });

      const claimTxHash = await l1WriteClient.writeContract(claimRequest);
      console.log(`Claim transaction sent: ${L1_EXPLORER}/tx/${claimTxHash}`);

      // Wait for claim transaction
      console.log("Waiting for claim transaction to be confirmed...");
      const claimReceipt = await l1Client.waitForTransactionReceipt({
        hash: claimTxHash,
      });
      console.log("Claim transaction confirmed!");

      // Step 5: Check if claim was successful
      console.log("\nVerifying claim results...");

      // Check SKATE token balance after claim
      const skateToken = await l1Client.readContract({
        address: EzSKATE,
        abi: EzRVault_ABI,
        functionName: "underlying",
      });

      console.log(`\nClaim successful!`);
      console.log(`Transaction hash: ${claimTxHash}`);
      console.log(`Block number: ${claimReceipt.blockNumber}`);
      console.log(`Gas used: ${claimReceipt.gasUsed}`);
      console.log(
        `SKATE tokens should now be available in your wallet at: ${skateToken}`,
      );
    } catch (claimError) {
      console.error("\nClaim simulation failed. This might be because:");
      console.error("1. The withdrawal struct parameters are incorrect");
      console.error("2. The withdrawal is not yet available in EigenLayer");
      console.error("3. The withdrawal has already been claimed");
      console.error("\nDetailed error:", claimError);

      console.log("\nTo properly claim, you may need to:");
      console.log(
        "1. Query EigenLayer's delegation manager for the correct withdrawal struct",
      );
      console.log("2. Use EigenLayer's SDK or direct contract calls");
      console.log("3. Wait for EigenLayer withdrawal processing to complete");
    }
  } catch (error) {
    console.error("\nClaim process failed:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log("\nClaim process completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nClaim process failed:", error);
      process.exit(1);
    });
}

export { main as claimFromEzSKATE };
