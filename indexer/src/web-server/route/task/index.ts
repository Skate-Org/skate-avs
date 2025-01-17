import { FastifyInstance } from "fastify";
import { taskInfoHandler } from "./info.controller";
import { taskCountHandler } from "./count.controller";
import { singleTaskInfoHandler } from "./single_task.controller";

const taskRouter = async (fastify: FastifyInstance) => {
  fastify.get("/count", taskCountHandler);

  fastify.get("/:taskId", singleTaskInfoHandler);
  fastify.get("/info", taskInfoHandler);
};

export default taskRouter;
