import { FastifyRequest, FastifyReply } from "fastify";
import client from "prom-client";

/**
 * Create a Registry which registers the metrics
 */
const metricsRegistry = new client.Registry();

/**
 * Add a default label which is added to all metrics
 */
metricsRegistry.setDefaultLabels({
  app: "skate-avs-webAPI",
});

/**
 * Enable the collection of default metrics
 */
client.collectDefaultMetrics({ register: metricsRegistry });

/**
 * Create a custom counter metric for HTTP requests
 */
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

/**
 * Create a custom histogram metric for HTTP request duration
 */
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
});

metricsRegistry.registerMetric(httpRequestCounter);
metricsRegistry.registerMetric(httpRequestDuration);

/**
 * Middleware to collect metrics for each HTTP request
 */
const metricsMiddleware = (req: FastifyRequest, res: FastifyReply, done: (err?: Error) => void) => {
  const end = httpRequestDuration.startTimer();
  res.raw.on("finish", () => {
    const { method, url } = req;
    const { statusCode } = res.raw;
    httpRequestCounter.labels(method as string, url as string, String(statusCode)).inc();
    end({ method: method as string, route: url as string, status_code: String(statusCode) });
  });
  done();
};

export { metricsRegistry, metricsMiddleware };
