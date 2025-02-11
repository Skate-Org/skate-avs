import { formatUnits } from "viem";
import { AvsGovernance_ABI } from "../../../lib/ABI/AvsGovernance";
import { ATTESTATION_CENTER_ADDRESS, AVS_GOVERNANCE_ADDRESS, L1_EXPLORER } from "../../../lib/const";
import { l1Client, l2Client } from "../../../lib/client";
import { AttestationCenter_ABI } from "../../../lib/ABI/AttestationCenter";
import { Strategy_ABI } from "../../../lib/ABI/Strategy";

function addressLink(address: `0x${string}`) {
  return `${L1_EXPLORER}/address/${address}`
}

async function main() {
  const defaultOperator = "0x8f14feCD0b3c592bAA45E02D7C7A95c891730FCC";
  const operator = process.argv[2] as `0x${string}` || defaultOperator;
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
    const share = await l1Client.readContract({
      address: strategy,
      abi: Strategy_ABI,
      functionName: "shares",
      args: [operator]
    });
    console.log(`\t${share} -- ${addressLink(strategy)}`);
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
