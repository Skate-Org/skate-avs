import { ATTESTATION_CENTER_ADDRESS, L2_EXPLORER } from "../../../lib/const";
import { l1Client, l2Client } from "../../../lib/client";
import { AttestationCenter_ABI } from "../../../lib/ABI/AttestationCenter";

function addressLink(address: `0x${string}`, explorer = L2_EXPLORER) {
  return `${explorer}/address/${address}`
}

async function main() {
  const numberOfOperators = await l2Client.readContract({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: AttestationCenter_ABI,
    functionName: "numOfOperators",
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
  }
}

main();
