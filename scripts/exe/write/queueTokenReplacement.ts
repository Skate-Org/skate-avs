import { AVS_TREASURY_L1, L1_EXPLORER } from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";
import { parseAbi } from "viem";
import { EzSKATE } from "../../lib/ABI/EzRVault";

const newToken = EzSKATE;

async function main() {
  const { request } = await l1Client.simulateContract({
    account: avsOwnerAccount,
    address: AVS_TREASURY_L1,
    abi: parseAbi(["function queueTokenReplacement(address _newToken)"]),
    functionName: "queueTokenReplacement",
    args: [newToken],
  });

  const txHash = await l1WriteClient.writeContract(request);
  console.log(`Reward token replacement queued: ${L1_EXPLORER}/tx/${txHash}.
New reward token: ${newToken}`);
}

main();
