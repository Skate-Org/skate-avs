import { FastifyInstance } from "fastify";
import { infoHandler } from "./info";

const operatorRouter = async (fastify: FastifyInstance) => {
  fastify.get("/:operator", infoHandler)
};

export default operatorRouter;
