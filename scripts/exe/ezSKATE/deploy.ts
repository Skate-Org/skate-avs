import { L1_EXPLORER } from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";
import {
  EzRVaultsFactory_ABI,
  EzRVaultsFactoryAddress,
} from "../../lib/ABI/EzRVaultsFactory";

const SKATE_TOKEN = "0x61DBbBb552dc893ab3aAd09F289f811E67cEf285";
const SKATE_EIGEN_STRATEGY = "0xA9ba139E8Be19529854234b956FA45716Ade505A";

const FEE_RECEIVER = "0x1c730A600e279Ca17638253108d3EA584f1c164D";
const LOCKUP_BLOCKS = 151200n; // 3 weeks (151200 * 12 / 86400)
const VAULT_FEE = 0n;

async function main() {
  const { request } = await l1Client.simulateContract({
    account: avsOwnerAccount,
    address: EzRVaultsFactoryAddress,
    abi: EzRVaultsFactory_ABI,
    functionName: "createVault",
    args: [
      {
        underlying: SKATE_TOKEN,
        strategy: SKATE_EIGEN_STRATEGY,
        vaultOwner: avsOwnerAccount.address,
        rewardsDestination: FEE_RECEIVER,
        vaultFeeDestination: FEE_RECEIVER,
        vaultCooldown: LOCKUP_BLOCKS,
        vaultFee: VAULT_FEE,
        name: "Staked SKATE",
        symbol: "ezSKATE",
      },
    ],
  });

  const txHash = await l1WriteClient.writeContract(request);
  console.log(`ezSKATE deployed: ${L1_EXPLORER}/tx/${txHash}.`);
  await l1Client.waitForTransactionReceipt({ hash: txHash });
}

main();
