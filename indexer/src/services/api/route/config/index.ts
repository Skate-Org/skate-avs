import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ATTESTATION_CENTER_ADDRESS, AVS_GOVERNANCE_ADDRESS, BOOTSTRAP_ID } from "../../../../lib/const";

export async function configHandler(_: FastifyRequest, reply: FastifyReply) {
  try {
    const data = {
      apiVersion: "0.0.1",
      docs: "https://www.notion.so/Mainnet-AVS-Operator-onboarding-182c4c1639d28063b827dcc983f9c9f2?pvs=4#1d1c4c1639d28014a5ecc277323c9471",
      addresses: {
        L2: {
          chain: "Mantle",
          chainId: 5000,
          AttestationCenter: ATTESTATION_CENTER_ADDRESS,
        },
        L1: {
          chain: "Mainnet",
          chainId: 1,
          AvsGovernance: AVS_GOVERNANCE_ADDRESS,
        },
      },
      aggregatorConfig: {
        othenticCLI: {
          version: "1.8.0",
          bootstrapId: BOOTSTRAP_ID,
          multiAddr: `/dns4/aggregator.avs.skatechain.org/tcp/6666/p2p/${BOOTSTRAP_ID}`,
        },
      },
      attesterConfig: {
        othenticCLI: {
          version: "^1.8",
        },
      },
    };
    return reply.status(200).send({ success: true, data });
  } catch (error) {
    reply.log.error(`CODE 500: Internal Server Error ${error}`);
    return reply.status(500).send({ success: false, message: "500: Internal Server Error", data: null });
  }
}

const configRouter = async (fastify: FastifyInstance) => {
  fastify.get("/", configHandler);
};

export default configRouter;
