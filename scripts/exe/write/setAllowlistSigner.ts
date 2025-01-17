import { AvsGovernance_ABI } from "../../lib/ABI/AvsGovernance";
import { AVS_GOVERNANCE_ADDRESS, L1_EXPLORER } from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";

async function main() {
  const allowlistSigner = avsOwnerAccount.address;
  const { request } = await l1Client.simulateContract({
    account: avsOwnerAccount,
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "setAllowlistSigner",
    args: [allowlistSigner],
  });

  const txHash = await l1WriteClient.writeContract(request);
  console.log(`Checkout avs allowlist signer set: ${L1_EXPLORER}/tx/${txHash}`);
}

main();
