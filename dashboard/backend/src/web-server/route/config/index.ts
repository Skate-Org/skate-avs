import { FastifyInstance } from "fastify";
import { avsDetailHandler } from "./detail";

const configRouter = async (fastify: FastifyInstance) => {
  fastify.get("/", avsDetailHandler);
};

export default configRouter;
