import type { FastifyRequest, FastifyReply } from "fastify";
import { MODE } from "../../../../lib/env";
import { getSingleAvsTask } from "../../../../lib/db";

export async function getTaskByIdHandler(
  request: FastifyRequest<{
    Params: { taskId: number };
  }>,
  reply: FastifyReply,
) {
  try {
    const { taskId } = request.params;
    console.log(`SkateAvs.Indexer::[WebServer]/task/:taskId -- Request for AVS task: `, taskId);
    const taskResult = await getSingleAvsTask(MODE, Number(taskId));

    return reply.status(200).send({ success: true, data: taskResult });
  } catch (error) {
    reply.log.error(`CODE 500: Internal Server Error ${error}`);
    return reply.status(500).send({ success: false, message: "500: Internal Server Error", data: null });
  }
}
