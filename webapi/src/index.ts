import Fastify from "fastify";
import taskRouter from "./route/task";
import healthRouter from "./route/health";
import { cors, corsOptions } from "./middleware/cors";

const server = Fastify();

// Register CORs
server.register(cors, corsOptions);

// Register routes
server.register(taskRouter, { prefix: "/task" });
server.register(healthRouter, { prefix: "/" });

const PORT = 4002;
server.listen({ port: PORT, host: "0.0.0.0" }, (err, _) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.info(`SkateAVS.WebAPI::Starting on port ${PORT}`);
});
