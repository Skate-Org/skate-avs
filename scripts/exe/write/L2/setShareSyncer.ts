import {
  ATTESTATION_CENTER_ADDRESS,
  L1_EXPLORER,
  L2_EXPLORER,
  OBLS_ADDRESS,
} from "../../../lib/const";
import { avsOwnerAccount, l2Client, l2WriteClient } from "../../../lib/client";
import { AttestationCenter_ABI } from "../../../lib/ABI/AttestationCenter";

async function main() {
  const { request: request1 } = await l2Client.simulateContract({
    account: avsOwnerAccount,
    address: ATTESTATION_CENTER_ADDRESS,
    abi: AttestationCenter_ABI,
    functionName: "setOblsSharesSyncer",
    args: [avsOwnerAccount.address],
  });

  const txHash1 = await l2WriteClient.writeContract(request1);
  console.log(`Set new Syncer: ${L2_EXPLORER}/tx/${txHash1}`);

  // const { request: request2 } = await l2Client.simulateContract({
  //   account: avsOwnerAccount,
  //   address: OBLS_ADDRESS,
  //   abi: OBLS_ABI,
  //   functionName: "increaseOperatorVotingPower",
  //   args: [1n, parseUnits("1", 36)],
  // });
  //
  // const txHash = await l2WriteClient.writeContract(request);
  // console.log(`Set new supported strategies: ${L1_EXPLORER}/tx/${txHash}`);
}

main();
