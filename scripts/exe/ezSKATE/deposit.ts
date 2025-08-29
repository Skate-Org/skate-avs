import { L1_EXPLORER } from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";
import { EzSKATE, EzRVault_ABI } from "../../lib/ABI/EzRVault";
import { parseEther, maxUint256, erc20Abi, parseUnits } from "viem";

// SKATE token address from deploy.ts
const SKATE_TOKEN = "0x61DBbBb552dc893ab3aAd09F289f811E67cEf285";
const depositAmountSKATE = "1";
const depositAmount = parseUnits(depositAmountSKATE, 18);

async function main() {
  console.log(
    `🚀 Starting deposit of ${depositAmountSKATE} SKATE tokens to ezSKATE vault`,
  );
  console.log(`Using account: ${avsOwnerAccount.address}`);
  console.log(`ezSKATE vault: ${EzSKATE}`);
  console.log(`SKATE token: ${SKATE_TOKEN}`);

  try {
    // Step 1: Check current allowance
    console.log("\n📊 Checking current SKATE token allowance...");
    const currentAllowance = await l1Client.readContract({
      address: SKATE_TOKEN,
      abi: erc20Abi,
      functionName: "allowance",
      args: [avsOwnerAccount.address, EzSKATE],
    });

    console.log(`Current allowance: ${currentAllowance} wei`);
    console.log(`Required amount: ${depositAmount} wei`);

    // Step 2: Check if approval is needed
    if (currentAllowance < depositAmount) {
      console.log("\n🔓 Insufficient allowance, approving max amount...");

      // Approve max amount for future deposits
      const { request: approveRequest } = await l1Client.simulateContract({
        account: avsOwnerAccount,
        address: SKATE_TOKEN,
        abi: erc20Abi,
        functionName: "approve",
        args: [EzSKATE, maxUint256],
      });

      const approveTxHash = await l1WriteClient.writeContract(approveRequest);
      console.log(
        `💫 Approval transaction sent: ${L1_EXPLORER}/tx/${approveTxHash}`,
      );

      // Wait for approval transaction
      console.log("⏳ Waiting for approval transaction to be confirmed...");
      await l1Client.waitForTransactionReceipt({ hash: approveTxHash });
      console.log("✅ Approval transaction confirmed!");

      // Wait 24 seconds as requested
      console.log("⏱️  Waiting 24 seconds after approval...");
      await new Promise((resolve) => setTimeout(resolve, 24000));
    } else {
      console.log("✅ Sufficient allowance already exists, skipping approval");
    }

    // Step 3: Check SKATE token balance
    console.log("\n💰 Checking SKATE token balance...");
    const balance = await l1Client.readContract({
      address: SKATE_TOKEN,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [avsOwnerAccount.address],
    });

    console.log(`SKATE balance: ${balance} wei`);

    if (balance < depositAmount) {
      throw new Error(
        `Insufficient SKATE balance. Required: ${depositAmount}, Available: ${balance}`,
      );
    }

    // Step 4: Execute deposit
    console.log("\n🏦 Executing deposit to ezSKATE vault...");
    const { request: depositRequest } = await l1Client.simulateContract({
      account: avsOwnerAccount,
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "deposit",
      args: [depositAmount],
    });

    const depositTxHash = await l1WriteClient.writeContract(depositRequest);
    console.log(
      `💫 Deposit transaction sent: ${L1_EXPLORER}/tx/${depositTxHash}`,
    );

    // Wait for deposit transaction
    console.log("⏳ Waiting for deposit transaction to be confirmed...");
    const depositReceipt = await l1Client.waitForTransactionReceipt({
      hash: depositTxHash,
    });
    console.log("✅ Deposit transaction confirmed!");

    // Step 5: Check ezSKATE balance after deposit
    console.log("\n📈 Checking ezSKATE balance after deposit...");
    const ezSkateBalance = await l1Client.readContract({
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "balanceOf",
      args: [avsOwnerAccount.address],
    });

    console.log(`ezSKATE balance: ${ezSkateBalance} wei`);

    // Parse deposit event from logs
    const depositEvent = depositReceipt.logs.find(
      (log) =>
        log.address.toLowerCase() === EzSKATE.toLowerCase() &&
        log.topics[0] ===
        "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15", // Deposit event signature
    );

    if (depositEvent) {
      console.log("\n🎉 Deposit successful!");
      console.log(`Transaction hash: ${depositTxHash}`);
      console.log(`Block number: ${depositReceipt.blockNumber}`);
      console.log(`Gas used: ${depositReceipt.gasUsed}`);
    }
  } catch (error) {
    console.error("\n❌ Deposit failed:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🎊 Deposit process completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Deposit process failed:", error);
      process.exit(1);
    });
}

export { main as depositToEzSKATE };
