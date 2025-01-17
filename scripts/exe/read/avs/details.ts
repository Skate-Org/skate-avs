import { AvsGovernance_ABI } from "../../../lib/ABI/AvsGovernance";
import { AVS_GOVERNANCE_ADDRESS } from "../../../lib/const";
import { l1Client } from "../../../lib/client";

async function main() {
  const avsName = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "avsName",
  });
  console.log("\nAVS Name:", avsName);

  const isAllowlist = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "getIsAllowlisted",
  });

  console.log("\nIs Whitelisting required?", isAllowlist);

  const activeOperatorCount = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "numOfActiveOperators",
  });
  console.log("\nNumber of active operators:", activeOperatorCount);

  const numberOfOperatorLimit = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "getNumOfOperatorsLimit",
  });
  console.log("\nMax number of operator allowed: ", numberOfOperatorLimit);

  const stakingStrategies = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "strategies",
  });
  console.log("------------\nRe-staking strategies: ");
  for (const strategy of stakingStrategies) {
    const minShareRequired = await l1Client.readContract({
      address: AVS_GOVERNANCE_ADDRESS,
      abi: AvsGovernance_ABI,
      functionName: "minSharesForStrategy",
      args: [strategy]
    });

    const multiplier = await l1Client.readContract({
      address: AVS_GOVERNANCE_ADDRESS,
      abi: AvsGovernance_ABI,
      functionName: "strategyMultiplier",
      args: [strategy]
    });

    console.log(`minShareRequired=${minShareRequired} | multiplier=${multiplier} | strategy=${strategy}`)
  }
}

main();
