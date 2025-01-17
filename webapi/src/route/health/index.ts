import { FastifyInstance } from "fastify";

const healthRouter = async (fastify: FastifyInstance) => {
  fastify.get("/", (_, reply) => {
    reply.status(200).send({ message: "Ok" });
  });
};

export default healthRouter;
