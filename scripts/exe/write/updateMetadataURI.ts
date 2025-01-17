import { AvsGovernance_ABI } from "../../lib/ABI/AvsGovernance";
import { AVS_GOVERNANCE_ADDRESS, L1_EXPLORER } from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";

async function main() {
  const { request } = await l1Client.simulateContract({
    account: avsOwnerAccount,
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "updateAVSMetadataURI",
    args: ["https://skatechain.s3.ap-northeast-1.amazonaws.com/skate_avs.json"],
  });

  const txHash = await l1WriteClient.writeContract(request);
  console.log(`Checkout update Metadata URI tx: ${L1_EXPLORER}/tx/${txHash}`);
}

main();
