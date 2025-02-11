import { ATTESTATION_CENTER_ADDRESS, AVS_GOVERNANCE_ADDRESS, L2_EXPLORER } from "../../../lib/const";
import { l1Client, l2Client } from "../../../lib/client";
import { AttestationCenter_ABI } from "../../../lib/ABI/AttestationCenter";
import { AvsGovernance_ABI } from "../../../lib/ABI/AvsGovernance";
import { formatUnits } from "viem";
import { Strategy_ABI } from "../../../lib/ABI/Strategy";

function addressLink(address: `0x${string}`, explorer = L2_EXPLORER) {
  return `${explorer}/address/${address}`
}

async function main() {
  const numberOfOperators = await l2Client.readContract({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: AttestationCenter_ABI,
    functionName: "numOfActiveOperators",
  })
  console.log(`\nNumber of registered attesters: ${numberOfOperators}`);

  for (let id = 1; id <= numberOfOperators; id++)  {
    const paymentDetails = await l2Client.readContract({
      address: ATTESTATION_CENTER_ADDRESS,
      abi: AttestationCenter_ABI,
      functionName: "getOperatorPaymentDetail",
      args: [BigInt(id)]
    });
    console.log(paymentDetails);
    const details = await getOperatorDetails(paymentDetails.operator);
  }
}

async function getOperatorDetails(operator: `0x${string}`) {
  console.log(`Operator: ${operator} (${addressLink(operator)})`);

  const id = await l2Client.readContract({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: AttestationCenter_ABI,
    functionName: "operatorsIdsByAddress",
    args: [operator],
  })
  console.log(`\nID: ${id}`);

  const votingPower = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "votingPower",
    args: [operator]
  });
  console.log(`\n---------------\nStats: voting_power=${formatUnits(votingPower, 18)}`);

  const strategies = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "getOperatorRestakedStrategies",
    args: [operator]
  });

  console.log(`\n---------------\nRestaked strategies:`);
  await Promise.all(Object.entries(strategies).map(async ([_, strategy]) => {
    // const share = await l1Client.readContract({
    //   address: strategy,
    //   abi: Strategy_ABI,
    //   functionName: "shares",
    //   args: [operator]
    // });
    console.log(`\t${addressLink(strategy)}`);
  }))

  const rewardReceiver = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "getRewardsReceiver",
    args: [operator]
  });
  console.log(`\n---------------\nReward receiver: ${rewardReceiver} (${addressLink(rewardReceiver)})`);
}

main();
