import { FastifyInstance } from "fastify";
import { validateHandler } from "./validate.controller";

const taskRouter = async (fastify: FastifyInstance) => {
  fastify.post("/validate", validateHandler);
};

export default taskRouter;
