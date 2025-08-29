import { L1_EXPLORER } from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";
import { EzSKATE, EzRVault_ABI } from "../../lib/ABI/EzRVault";
import { parseUnits, formatEther } from "viem";

async function main() {
  // Get withdraw amount from command line or use default
  const withdrawAmountSKATE = process.argv[2] || "0.5";
  const withdrawAmount = parseUnits(withdrawAmountSKATE, 18);

  console.log(`Initiating withdrawal of ${withdrawAmountSKATE} ezSKATE tokens`);
  console.log(`Using account: ${avsOwnerAccount.address}`);
  console.log(`ezSKATE vault: ${EzSKATE}`);

  try {
    // Step 1: Check ezSKATE balance
    console.log("\nChecking ezSKATE balance...");
    const ezSkateBalance = await l1Client.readContract({
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "balanceOf",
      args: [avsOwnerAccount.address],
    });

    console.log(`Current ezSKATE balance: ${formatEther(ezSkateBalance)} ezSKATE`);

    if (ezSkateBalance < withdrawAmount) {
      throw new Error(
        `Insufficient ezSKATE balance. Required: ${withdrawAmountSKATE}, Available: ${formatEther(ezSkateBalance)}`
      );
    }

    // Step 2: Check cooldown period
    console.log("\nChecking withdrawal cooldown period...");
    const cooldownBlocks = await l1Client.readContract({
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "cooldownBlocks",
    });

    console.log(`Cooldown period: ${cooldownBlocks} blocks`);

    // Step 3: Initiate withdrawal (this queues the withdrawal)
    console.log(`\nInitiating withdrawal of ${withdrawAmountSKATE} ezSKATE...`);
    const { request: withdrawRequest } = await l1Client.simulateContract({
      account: avsOwnerAccount,
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "withdraw",
      args: [withdrawAmount],
    });

    const withdrawTxHash = await l1WriteClient.writeContract(withdrawRequest);
    console.log(`Withdrawal transaction sent: ${L1_EXPLORER}/tx/${withdrawTxHash}`);

    // Wait for withdrawal transaction
    console.log("Waiting for withdrawal transaction to be confirmed...");
    const withdrawReceipt = await l1Client.waitForTransactionReceipt({
      hash: withdrawTxHash,
    });
    console.log("Withdrawal transaction confirmed!");

    // Step 4: Get withdrawal root from transaction logs
    console.log("\nProcessing withdrawal receipt...");
    
    // Look for WithdrawStarted event to get the withdrawal root
    const withdrawEvent = withdrawReceipt.logs.find(log => 
      log.address.toLowerCase() === EzSKATE.toLowerCase() &&
      log.topics.length > 0
    );

    let withdrawalRoot: string | null = null;
    if (withdrawEvent && withdrawEvent.topics.length > 1) {
      // The withdrawal root is typically in the first topic after the event signature
      withdrawalRoot = withdrawEvent.topics[1] || null;
    }

    if (withdrawalRoot) {
      console.log(`Withdrawal root: ${withdrawalRoot}`);
      
      // Step 5: Check withdrawal request details
      console.log("\nChecking withdrawal request details...");
      try {
        const withdrawRequestInfo = await l1Client.readContract({
          address: EzSKATE,
          abi: EzRVault_ABI,
          functionName: "withdrawRequest",
          args: [withdrawalRoot as `0x${string}`],
        });

        console.log(`Withdrawer: ${withdrawRequestInfo[0]}`);
        console.log(`LP Token Amount Locked: ${formatEther(withdrawRequestInfo[1])} ezSKATE`);
        console.log(`Created At Block: ${withdrawRequestInfo[2]}`);

        // Calculate when withdrawal can be claimed
        const currentBlock = await l1Client.getBlockNumber();
        const canClaimAtBlock = withdrawRequestInfo[2] + cooldownBlocks;
        const blocksRemaining = canClaimAtBlock > currentBlock ? canClaimAtBlock - currentBlock : BigInt(0);

        console.log(`Current block: ${currentBlock}`);
        console.log(`Can claim at block: ${canClaimAtBlock}`);
        console.log(`Blocks remaining: ${blocksRemaining}`);

        if (blocksRemaining > BigInt(0)) {
          console.log(`\nWithdrawal initiated successfully!`);
          console.log(`You can claim your withdrawal after ${blocksRemaining} more blocks.`);
          console.log(`Withdrawal root for claiming: ${withdrawalRoot}`);
        } else {
          console.log(`\nWithdrawal can be claimed immediately!`);
          console.log(`Use the claim script with withdrawal root: ${withdrawalRoot}`);
        }
      } catch (error) {
        console.log("Could not fetch withdrawal request details, but withdrawal was initiated.");
        console.log(`Withdrawal root: ${withdrawalRoot}`);
      }
    } else {
      console.log("Withdrawal initiated, but could not extract withdrawal root from logs.");
      console.log("Check the transaction receipt manually for withdrawal details.");
    }

    console.log(`\nWithdrawal Summary:`);
    console.log(`Transaction hash: ${withdrawTxHash}`);
    console.log(`Block number: ${withdrawReceipt.blockNumber}`);
    console.log(`Gas used: ${withdrawReceipt.gasUsed}`);

  } catch (error) {
    console.error("\nWithdrawal failed:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log("\nWithdrawal process completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nWithdrawal process failed:", error);
      process.exit(1);
    });
}

export { main as withdrawFromEzSKATE };