import { L1_EXPLORER, AVS_TREASURY_L1 } from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";
import { AvsTreasury_ABI } from "../../lib/ABI/AvsTreasury";
import { EzSKATE, EzRVault_ABI } from "../../lib/ABI/EzRVault";
import { parseEther, maxUint256, erc20Abi, formatEther } from "viem";

// Deposit amount: 10^18 ezSKATE (1 ezSKATE token)
const DEPOSIT_AMOUNT = parseEther("499903.4824");

async function main() {
  console.log(`Depositing ezSKATE rewards to AVS Treasury`);
  console.log(`Using account: ${avsOwnerAccount.address}`);
  console.log(`ezSKATE token: ${EzSKATE}`);
  console.log(`AVS Treasury: ${AVS_TREASURY_L1}`);
  console.log(`Deposit amount: ${formatEther(DEPOSIT_AMOUNT)} ezSKATE`);

  try {
    // Step 1: Check ezSKATE balance
    console.log("\nChecking ezSKATE balance...");
    const ezSkateBalance = await l1Client.readContract({
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "balanceOf",
      args: [avsOwnerAccount.address],
    });

    console.log(
      `Current ezSKATE balance: ${formatEther(ezSkateBalance)} ezSKATE`,
    );

    if (ezSkateBalance < DEPOSIT_AMOUNT) {
      throw new Error(
        `Insufficient ezSKATE balance. Required: ${formatEther(DEPOSIT_AMOUNT)}, Available: ${formatEther(ezSkateBalance)}`,
      );
    }

    // Step 2: Check current allowance for AVS Treasury
    console.log("\nChecking ezSKATE allowance for AVS Treasury...");
    const currentAllowance = await l1Client.readContract({
      address: EzSKATE,
      abi: erc20Abi,
      functionName: "allowance",
      args: [avsOwnerAccount.address, AVS_TREASURY_L1],
    });

    console.log(`Current allowance: ${formatEther(currentAllowance)} ezSKATE`);

    // Step 3: Approve if needed
    if (currentAllowance < DEPOSIT_AMOUNT) {
      console.log("\nInsufficient allowance, approving maximum amount...");

      const { request: approveRequest } = await l1Client.simulateContract({
        account: avsOwnerAccount,
        address: EzSKATE,
        abi: erc20Abi,
        functionName: "approve",
        args: [AVS_TREASURY_L1, maxUint256],
      });

      const approveTxHash = await l1WriteClient.writeContract(approveRequest);
      console.log(
        `Approval transaction sent: ${L1_EXPLORER}/tx/${approveTxHash}`,
      );

      // Wait for approval transaction
      console.log("Waiting for approval transaction to be confirmed...");
      await l1Client.waitForTransactionReceipt({ hash: approveTxHash });
      console.log("Approval transaction confirmed!");

      // Wait a bit for the approval to be processed
      console.log("Waiting 12 seconds for approval processing...");
      await new Promise((resolve) => setTimeout(resolve, 12000));
    } else {
      console.log("Sufficient allowance already exists, skipping approval");
    }

    // Step 4: Deposit ezSKATE to AVS Treasury
    console.log(
      `\nDepositing ${formatEther(DEPOSIT_AMOUNT)} ezSKATE to AVS Treasury...`,
    );

    const { request: depositRequest } = await l1Client.simulateContract({
      account: avsOwnerAccount,
      address: AVS_TREASURY_L1,
      abi: AvsTreasury_ABI,
      functionName: "depositERC20",
      args: [DEPOSIT_AMOUNT],
    });

    const depositTxHash = await l1WriteClient.writeContract(depositRequest);
    console.log(`Deposit transaction sent: ${L1_EXPLORER}/tx/${depositTxHash}`);

    // Wait for deposit transaction
    console.log("Waiting for deposit transaction to be confirmed...");
    const depositReceipt = await l1Client.waitForTransactionReceipt({
      hash: depositTxHash,
    });
    console.log("Deposit transaction confirmed!");

    // Step 5: Verify the deposit by checking updated balances
    console.log("\nVerifying deposit...");

    const newEzSkateBalance = await l1Client.readContract({
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "balanceOf",
      args: [avsOwnerAccount.address],
    });

    const balanceChange = ezSkateBalance - newEzSkateBalance;

    console.log(`\nDeposit Summary:`);
    console.log(
      `Previous ezSKATE balance: ${formatEther(ezSkateBalance)} ezSKATE`,
    );
    console.log(
      `New ezSKATE balance: ${formatEther(newEzSkateBalance)} ezSKATE`,
    );
    console.log(`Amount deposited: ${formatEther(balanceChange)} ezSKATE`);
    console.log(`Transaction hash: ${depositTxHash}`);
    console.log(`Block number: ${depositReceipt.blockNumber}`);
    console.log(`Gas used: ${depositReceipt.gasUsed}`);

    if (balanceChange === DEPOSIT_AMOUNT) {
      console.log(
        "\nDeposit successful! ezSKATE rewards have been deposited to AVS Treasury.",
      );
    } else {
      console.log(
        `\nWarning: Expected to deposit ${formatEther(DEPOSIT_AMOUNT)} but actual change was ${formatEther(balanceChange)}`,
      );
    }
  } catch (error) {
    console.error("\nDeposit failed:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log("\nDeposit rewards process completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nDeposit rewards process failed:", error);
      process.exit(1);
    });
}

export { main as depositRewardsToTreasury };
