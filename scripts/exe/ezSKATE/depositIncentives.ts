import { L1_EXPLORER } from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";
import { EzRVault_ABI, EzSKATE } from "../../lib/ABI/EzRVault";
import { parseUnits } from "viem";

const SKATE_DEPOSIT_AMOUNT = parseUnits("17589.30", 18);

// WARN: This pause all interaction with Renzo contract
async function main() {
  const { request } = await l1Client.simulateContract({
    account: avsOwnerAccount,
    address: EzSKATE,
    abi: EzRVault_ABI,
    functionName: "depositIncentive",
    args: [SKATE_DEPOSIT_AMOUNT],
  });

  const txHash = await l1WriteClient.writeContract(request);
  console.log(`Incentive deposited: ${L1_EXPLORER}/tx/${txHash}`);
  await l1Client.waitForTransactionReceipt({ hash: txHash });
}

main();
