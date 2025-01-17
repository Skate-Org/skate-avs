import type { FastifyRequest, FastifyReply } from "fastify";
import { getSingleSkateTask } from "../../../common/db";
import { MODE } from "../../../common/env";
import { messageBoxFromMode } from "../../../indexer/utils";

export async function singleTaskInfoHandler(
  request: FastifyRequest<{
    Params: { taskId: number };
  }>,
  reply: FastifyReply,
) {
  try {
    const { taskId } = request.params;
    console.log(`SkateAvs.Indexer::[WebServer]/task/:taskId -- Request for `, taskId);
    const taskResult = await getSingleSkateTask(MODE, {
      taskId: Number(taskId),
      messageBoxAddress: messageBoxFromMode(MODE),
    });

    return reply.status(200).send({ success: true, data: taskResult });
  } catch (error) {
    reply.log.error(`CODE 500: Internal Server Error ${error}`);
    return reply.status(500).send({ success: false, message: "500: Internal Server Error", data: null });
  }
}
