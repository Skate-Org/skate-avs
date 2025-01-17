import type { FastifyRequest, FastifyReply } from "fastify";
import { getSingleBatchSkateTasks } from "../../../common/db";
import { MODE } from "../../../common/env";
import { messageBoxFromMode } from "../../../indexer/utils";

export async function taskInfoHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: string;
      chainId?: string;
      appAddress?: string;
      user?: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const query = request.query;

    if (!!query.limit && Number(query.limit) > 2_000) {
      return reply.status(400).send({ message: "Max 2000 tasks per query", data: null });
    }

    const returnTasks = await getSingleBatchSkateTasks(MODE, messageBoxFromMode(MODE));
    console.log(`SkateAvs.Indexer::[WebServer]/task/info -- return ${returnTasks.length} tasks`);

    return reply.status(200).send({ success: true, data: returnTasks });
  } catch (error) {
    console.error(`SkateAvs.Indexer::[WebServer]/task/info -- Internal Server Error: `, error);
    return reply.status(500).send({ success: false, message: "500: Internal Server Error", data: null });
  }
}
