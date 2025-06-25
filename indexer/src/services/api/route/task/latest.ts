import type { FastifyRequest, FastifyReply } from "fastify";
import { MODE } from "../../../../lib/env";
import { getAvsTasksByAttester } from "../../../../lib/db/avs.taskByAttester";

export async function getLatestTasksHandler(
  request: FastifyRequest<{ Querystring: { limit?: number } }>,
  reply: FastifyReply,
) {
  try {
    const limit = Math.max(Number(Math.abs(request.query.limit || 1)), 30);

    const { tasks: latestTasks } = await getAvsTasksByAttester(MODE, 1, limit);

    return reply.status(200).send({ success: true, data: { taskCount: latestTasks[0].taskId, latestTasks } });
  } catch (error) {
    reply.log.error(`CODE 500: Internal Server Error ${error}`);
    return reply.status(500).send({ success: false, message: "500: Internal Server Error", data: null });
  }
}
