import type { FastifyRequest, FastifyReply } from "fastify";
import { getAvsConfig } from "../../../indexer/api/config";

export async function avsDetailHandler(_: FastifyRequest<{}>, reply: FastifyReply) {
  try {
    const avsConfig = getAvsConfig();
    return reply.status(200).send({ success: true, data: avsConfig });
  } catch (error) {
    console.error(`SkateAvs.Dashboard.Backend::/ -- Internal Server Error ${error}`);
    return reply.status(500).send({ success: false, message: "500: Internal Server Error", data: null });
  }
}
