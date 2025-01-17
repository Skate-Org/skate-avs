import { IAvsGovernance_ABI } from "../../ABI/IAvsGovernance";
import { ATTESTATION_CENTER_ADDRESS, AVS_GOVERNANCE_ADDRESS } from "../../common/const";
import { l1Client, l2Client } from "../../common/client";
import { IAttestationCenter_ABI } from "../../ABI/IAttestationCenter";

export type AvsConfig = Awaited<ReturnType<typeof getAvsDetails>>
export async function getAvsDetails() {
  const avsName = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: IAvsGovernance_ABI,
    functionName: "avsName",
  });
  console.log("\nAVS Name:", avsName);

  const isAllowlist = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: IAvsGovernance_ABI,
    functionName: "getIsAllowlisted",
  });
  console.log("\nIs Whitelisting required?", isAllowlist);

  const activeOperatorCount = await l2Client.readContract({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: IAttestationCenter_ABI,
    functionName: "numOfOperators",
  })
  console.log(`\nNumber of registered operators: ${activeOperatorCount}`);

  console.log(`\nOperator info:`);
  const registeredOperators = [];
  for (let id = 1; id <= activeOperatorCount; id++) {
    const { operator, ...paymentDetails } = await l2Client.readContract({
      address: ATTESTATION_CENTER_ADDRESS,
      abi: IAttestationCenter_ABI,
      functionName: "getOperatorPaymentDetail",
      args: [BigInt(id)]
    });
    registeredOperators.push({ operator, id });
    console.log({ address: operator, id, paymentDetails });
  }

  const numberOfOperatorLimit = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: IAvsGovernance_ABI,
    functionName: "getNumOfOperatorsLimit",
  });
  console.log("\nMax number of operator allowed: ", numberOfOperatorLimit);

  const stakingConfig: Record<string, { minShareRequired: string, multiplier: number }> = {};

  const stakingStrategies = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: IAvsGovernance_ABI,
    functionName: "strategies",
  });
  console.log("------------\nRe-staking strategies: ");
  for (const strategy of stakingStrategies) {
    const minShareRequired = await l1Client.readContract({
      address: AVS_GOVERNANCE_ADDRESS,
      abi: IAvsGovernance_ABI,
      functionName: "minSharesForStrategy",
      args: [strategy]
    });

    const multiplier = await l1Client.readContract({
      address: AVS_GOVERNANCE_ADDRESS,
      abi: IAvsGovernance_ABI,
      functionName: "strategyMultiplier",
      args: [strategy]
    });
    console.log(`minShareRequired=${minShareRequired} | multiplier=${multiplier} | strategy=${strategy}`)

    stakingConfig[strategy] = {
      minShareRequired: minShareRequired.toString(10),
      multiplier: multiplier == 0n ? 1 : Number(multiplier),
    }
  }

  return {
    avsName,
    isAllowlist,
    activeOperatorCount: Number(activeOperatorCount),
    numberOfOperatorLimit: Number(numberOfOperatorLimit),
    registeredOperators,
    stakingConfig
  }
}
