import { FastifyInstance } from "fastify";
import { fetchTasks } from "./fetch-tasks";

export const instructionRouter = async (fastify: FastifyInstance) => {
  fastify.post("/fetch-tasks", fetchTasks);
};

