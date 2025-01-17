import Fastify from "fastify";
import { metricsMiddleware } from "./middleware/metrics";
import { rateLimit, rateLimitOptions } from "./middleware/rateLimiter";
import { cors, corsOptions } from "./middleware/cors";
import operatorRouter from "./route/operator";
import configRouter from "./route/config";

const app = Fastify();

// Register CORS
app.register(cors, corsOptions);

// Custom rate limiter
app.register(rateLimit, rateLimitOptions);

// // NOTE: enable this if DDoS occurs.
// import { validateKeyMiddleware } from './middleware/validAPIKey';
// app.addHook('onRequest', validateKeyMiddleware);

// Metrics middleware
app.addHook("onRequest", metricsMiddleware);

// Routes
app.register(operatorRouter, { prefix: "/operator" })
app.register(configRouter, { prefix: "/config" })

const PORT = 5022;
app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`SkateAvs.Indexer::Web Server started on port http://localhost:${PORT}`);
});
