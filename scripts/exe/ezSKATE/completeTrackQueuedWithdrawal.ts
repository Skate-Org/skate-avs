import { L1_EXPLORER } from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";
import { EzRVault_ABI, EzSKATE } from "../../lib/ABI/EzRVault";

async function main() {
  const { request } = await l1Client.simulateContract({
    account: avsOwnerAccount,
    address: EzSKATE,
    abi: EzRVault_ABI,
    functionName: "completeEmergencyTrackedWithdrawal",
    args: [
      {
        staker: "0xc12e4d31e92cedc1ad4c8c23dbce2c5f7cb52998",
        delegatedTo: "0x8f14fecd0b3c592baa45e02d7c7a95c891730fcc",
        withdrawer: "0xc12e4d31e92cedc1ad4c8c23dbce2c5f7cb52998",
        nonce: 81n,
        startBlock: 23195918,
        strategies: ["0xa9ba139e8be19529854234b956fa45716ade505a"],
        scaledShares: [740430172302864768028545n],
      },
    ],
  });

  const txHash = await l1WriteClient.writeContract(request);
  console.log(`Called: ${L1_EXPLORER}/tx/${txHash}`);
  await l1Client.waitForTransactionReceipt({ hash: txHash });
}

main();
