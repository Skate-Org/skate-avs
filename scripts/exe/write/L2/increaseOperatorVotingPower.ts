import { L2_EXPLORER, OBLS_ADDRESS } from "../../../lib/const";
import { avsOwnerAccount, l2Client, l2WriteClient } from "../../../lib/client";
import { OBLS_ABI } from "../../../lib/ABI/OBLS";
import { parseUnits } from "viem";

async function main() {
  const { request: request2 } = await l2Client.simulateContract({
    account: avsOwnerAccount,
    address: OBLS_ADDRESS,
    abi: OBLS_ABI,
    functionName: "increaseOperatorVotingPower",
    args: [17n, parseUnits("8999.374080334167934788", 18)],
  });

  const txHash = await l2WriteClient.writeContract(request2);
  console.log(`Set operator voting power: ${L2_EXPLORER}/tx/${txHash}`);
}

main();
