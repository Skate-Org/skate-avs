import type { FastifyRequest, FastifyReply } from "fastify";
import { getAllSkateTasks } from "../../../common/db";
import { MODE } from "../../../common/env";

export async function taskCountHandler(_: FastifyRequest<{}>, reply: FastifyReply) {
  try {
    const count = (await getAllSkateTasks(MODE)).length;
    return reply.status(200).send({ success: true, data: count });
  } catch (error) {
    console.error(`SkateAvs.Indexer::[WebServer]/task/count -- Internal Server Error ${error}`);
    return reply.status(500).send({ success: false, message: "500: Internal Server Error", data: null });
  }
}
