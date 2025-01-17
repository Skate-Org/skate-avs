import type { FastifyRequest, FastifyReply } from "fastify";
import { getOperatorInfo } from "../../../indexer/service/operator";
import { addressLink } from "../../../common/lib";
import { L1_EXPLORER } from "../../../common/const";
import { formatUnits } from "viem";

export async function infoHandler(request: FastifyRequest<{
  Params: { operator: `0x${string}` }
}>, reply: FastifyReply) {
  try {
    const { operator } = request.params;
    const avsConfig = await getOperatorInfo(operator);
    if (!avsConfig) {
      return reply.status(200).send({
        success: true,
        data: null,
        message: "Not an operator"
      });
    }

    const { id, votingPower, paymentDetails, restakedInfo } = avsConfig;

    console.log(`\nSkateAVS.Dashboard.Backend -- /operator/${operator}`);
    console.log(`Operator: (${addressLink(operator, L1_EXPLORER)})`);
    console.log(`ID: ${id}`);
    console.log(`Voting power=${formatUnits(votingPower, 18)}`);
    console.log(`Payment details:`, paymentDetails);

    const { lastPaidTaskNumber, feeToClaim, paymentStatus } = paymentDetails;
    const formattedConfig = {
      id: Number(id),
      votingPower: Number(formatUnits(votingPower, 18)),
      restakedInfo,
      paymentDetails: {
        lastPaidTaskNumber: Number(lastPaidTaskNumber),
        feeToClaim: Number(formatUnits(feeToClaim, 18)),
        paymentStatus
      }
    }

    return reply.status(200).send({
      success: true,
      data: formattedConfig
    });
  } catch (error) {
    console.error(`SkateAvs.Dashboard.Backend:: /operator/:address -- Internal Server Error ${error}`);
    return reply.status(500).send({ success: false, message: "500: Internal Server Error", data: null });
  }
}
