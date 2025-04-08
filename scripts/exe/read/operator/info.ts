import { formatUnits } from "viem";
import { AvsGovernance_ABI } from "../../../lib/ABI/AvsGovernance";
import {
  ATTESTATION_CENTER_ADDRESS,
  AVS_GOVERNANCE_ADDRESS,
  L1_EXPLORER,
  OBLS_ADDRESS,
} from "../../../lib/const";
import { l1Client, l2Client } from "../../../lib/client";
import { AttestationCenter_ABI } from "../../../lib/ABI/AttestationCenter";
import { Strategy_ABI } from "../../../lib/ABI/Strategy";
import { OBLS_ABI } from "../../../lib/ABI/OBLS";

function addressLink(address: `0x${string}`) {
  return `${L1_EXPLORER}/address/${address}`;
}

async function main() {
  const defaultOperator = "0x8f14feCD0b3c592bAA45E02D7C7A95c891730FCC";
  const operator = (process.argv[2] as `0x${string}`) || defaultOperator;
  console.log(`Operator: ${operator} (${addressLink(operator)})`);

  const id = await l2Client.readContract({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: AttestationCenter_ABI,
    functionName: "operatorsIdsByAddress",
    args: [operator],
  });
  console.log(`\nID: ${id}`);

  const votingPower = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "votingPower",
    args: [operator],
  });
  console.log(
    `\n---------------\nStats: L1 voting_power=${formatUnits(votingPower, 18)}`,
  );

  const votingPower2 = await l2Client.readContract({
    address: OBLS_ADDRESS,
    abi: OBLS_ABI,
    functionName: "votingPower",
    args: [id],
  });

  const isActive = await l2Client.readContract({
    address: OBLS_ADDRESS,
    abi: OBLS_ABI,
    functionName: "isActive",
    args: [id],
  });
  console.log(
    `\n---------------\nStats: IsActive=${isActive} | L2 voting_power=${formatUnits(votingPower2, 18)}`,
  );

  const strategies = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "getOperatorRestakedStrategies",
    args: [operator],
  });

  console.log(`\n---------------\nRestaked strategies:`);
  await Promise.all(
    Object.entries(strategies).map(async ([_, strategy]) => {
      try {
        const share = await l1Client.readContract({
          address: strategy,
          abi: Strategy_ABI,
          functionName: "shares",
          args: [operator],
        });
        console.log(`\t${share} -- ${addressLink(strategy)}`);
      } catch (e) {
        console.warn(`Strategy ${strategy} has no "shares" view function`);
      }
    }),
  );

  const rewardReceiver = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "getRewardsReceiver",
    args: [operator],
  });
  console.log(
    `\n---------------\nReward receiver: ${rewardReceiver} (${addressLink(rewardReceiver)})`,
  );
}

main();
