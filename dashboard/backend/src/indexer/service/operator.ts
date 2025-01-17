import { IAvsGovernance_ABI } from "../../ABI/IAvsGovernance";
import { ATTESTATION_CENTER_ADDRESS, AVS_GOVERNANCE_ADDRESS } from "../../common/const";
import { l1Client, l2Client } from "../../common/client";
import { IAttestationCenter_ABI } from "../../ABI/IAttestationCenter";
import { IEigenLayerStrategy_ABI } from "../../ABI/IEigenLayerStrategy";

export async function getOperatorInfo(operator: `0x${string}`) {
  let id = 0n;
  try {
    id = await l2Client.readContract({
      address: ATTESTATION_CENTER_ADDRESS,
      abi: IAttestationCenter_ABI,
      functionName: "operatorsIdsByAddress",
      args: [operator],
    })
  } catch (e) {
    return null;
  }
  if (id == 0n) {
    return null;
  }

  const votingPower = await l2Client.readContract({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: IAttestationCenter_ABI,
    functionName: "votingPower",
    args: [operator]
  });
  const { operator: _, ...paymentDetails } = await l2Client.readContract({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: IAttestationCenter_ABI,
    functionName: "getOperatorPaymentDetail",
    args: [id]
  });
  const restakedInfo: Record<string, { share: string }> = {};
  const strategies = await l1Client.readContract({
    address: AVS_GOVERNANCE_ADDRESS,
    abi: IAvsGovernance_ABI,
    functionName: "getOperatorRestakedStrategies",
    args: [operator]
  });
  await Promise.all(Object.entries(strategies).map(async ([_, strategy]) => {
    const share = await l1Client.readContract({
      address: strategy,
      abi: IEigenLayerStrategy_ABI,
      functionName: "shares",
      args: [operator]
    });
    restakedInfo[strategy] = { share: share.toString(10) }
  }))

  // TODO: fetch task completed

  return {
    id,
    votingPower,
    paymentDetails,
    restakedInfo
  }
}
