import { FastifyInstance } from "fastify";
import { getTasksByOperatorHandler } from "./operator";
import { getTaskByIdHandler } from "./id";
import { getLatestTasksHandler } from "./latest";

const taskRouter = async (fastify: FastifyInstance) => {
  fastify.get("/id/:taskId", getTaskByIdHandler);
  fastify.get("/operator", getTasksByOperatorHandler);
  fastify.get("/latest", getLatestTasksHandler);
};

export default taskRouter;
