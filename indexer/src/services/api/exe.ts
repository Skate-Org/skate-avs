import Fastify from "fastify";
import taskRouter from "./route/task";
import { metricsMiddleware } from "./middleware/metrics";
import { rateLimit, rateLimitOptions } from "./middleware/rateLimiter";
import { cors, corsOptions } from "./middleware/cors";

const app = Fastify();

// Register CORS
app.register(cors, corsOptions);

// Custom rate limiter
app.register(rateLimit, rateLimitOptions);

// Metrics middleware
app.addHook("onRequest", metricsMiddleware);

// Routes
app.register(taskRouter, { prefix: "/task" });

const PORT = 5051;
app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`SkateAvs.Indexer::Web Server started on http://localhost:${PORT}`);
});
