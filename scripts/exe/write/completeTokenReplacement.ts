import { AVS_TREASURY_L1, L1_EXPLORER } from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";
import { parseAbi } from "viem";

const EIGEN_TOKEN_ADDRESS = "0xec53bf9167f50cdeb3ae105f56099aaab9061f83";
const newToken = EIGEN_TOKEN_ADDRESS;

async function main() {
  const { request } = await l1Client.simulateContract({
    account: avsOwnerAccount,
    address: AVS_TREASURY_L1,
    abi: parseAbi(["function completeTokenReplacement()"]),
    functionName: "completeTokenReplacement",
  });

  const txHash = await l1WriteClient.writeContract(request);
  console.log(`Reward token changed: ${L1_EXPLORER}/tx/${txHash}.`);
  await l1Client.waitForTransactionReceipt({ hash: txHash });
}

main();
