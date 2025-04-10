import type { FastifyRequest, FastifyReply } from "fastify";
import { MODE } from "../../../../lib/env";
import { getAvsTasksByAttester } from "../../../../lib/db/avs.taskByAttester";
import { l2Client } from "../../../../lib/client";
import { AttestationCenter_ABI } from "../../../../lib/abi";
import { ATTESTATION_CENTER_ADDRESS } from "../../../../lib/const";
import { getBatchAvsTasks } from "../../../../lib/db";

export async function getTasksByOperatorHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: string;
    } & (
      | {
        address: `0x${string}`;
      }
      | { id: number }
    );
  }>,
  reply: FastifyReply,
) {
  try {
    const query = request.query;

    const limit = Math.max(Number(query.limit || 0), 50);

    let attesterId: number | null = null;

    if ("id" in query) {
      attesterId = Number(query.id);
    } else if ("address" in query) {
      const id = await l2Client.readContract({
        address: ATTESTATION_CENTER_ADDRESS,
        abi: AttestationCenter_ABI,
        functionName: "operatorsIdsByAddress",
        args: [query.address],
      });
      if (id == 0n) {
        // NOTE: Operator does not exists, return
        return reply.status(200).send({ success: true, data: null });
      }
      attesterId = Number(id);
    } else {
      return reply
        .status(400)
        .send({ success: false, data: null, error: "Invalid input, must specify either operatorId or address" });
    }

    const { tasks, taskCount } = await getAvsTasksByAttester(MODE, attesterId, limit);

    const taskIds = tasks.map((t) => t.taskId);
    const avsTasks = await getBatchAvsTasks(MODE, taskIds);

    const data = {
      taskCount,
      recentTasks: avsTasks,
    };

    return reply.status(200).send({ success: true, data });
  } catch (error) {
    console.error(`SkateAvs.Indexer::[WebServer]/task/info -- Internal Server Error: `, error);
    return reply.status(500).send({ success: false, message: "500: Internal Server Error", data: null });
  }
}
