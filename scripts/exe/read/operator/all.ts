import { ATTESTATION_CENTER_ADDRESS, OBLS_ADDRESS } from "../../../lib/const";
import { l1Client, l2Client } from "../../../lib/client";
import { AttestationCenter_ABI } from "../../../lib/ABI/AttestationCenter";
import { OBLS_ABI } from "../../../lib/ABI/OBLS";
import { formatUnits } from "viem";

async function main() {
  const numberOfOperators = await l2Client.readContract({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: AttestationCenter_ABI,
    functionName: "numOfActiveOperators",
  });
  console.log(`\nNumber of active operators: ${numberOfOperators}`);

  for (let id = 1; id <= numberOfOperators; id++) {
    const paymentDetails = await l2Client.readContract({
      address: ATTESTATION_CENTER_ADDRESS,
      abi: AttestationCenter_ABI,
      functionName: "getOperatorPaymentDetail",
      args: [BigInt(id)],
    });
    console.log({ address: paymentDetails.operator, id });

    const votingPower = await l2Client.readContract({
      address: OBLS_ADDRESS,
      abi: OBLS_ABI,
      functionName: "votingPower",
      args: [BigInt(id)],
    });
    console.log(`L2 voting_power=${formatUnits(votingPower, 18)}\n`);
  }
}

main();
