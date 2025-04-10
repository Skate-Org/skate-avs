import { FastifyInstance } from "fastify";
import { getTasksByOperatorHandler } from "./operator";
import { getTaskByIdHandler } from "./id";

const taskRouter = async (fastify: FastifyInstance) => {
  fastify.get("/id/:taskId", getTaskByIdHandler);
  fastify.get("/operator", getTasksByOperatorHandler);
};

export default taskRouter;
