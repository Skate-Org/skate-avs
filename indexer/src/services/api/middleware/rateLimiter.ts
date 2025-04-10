import rateLimit, { RateLimitPluginOptions } from "@fastify/rate-limit";
import "dotenv/config";

const EXEMPT_KEYS = [process.env.API_KEY!];

const rateLimitOptions: RateLimitPluginOptions = {
  global: false,
  max: 1_000_000,
  timeWindow: "1 minute",
  keyGenerator: function (request) {
    return request.ip;
  },
  nameSpace: "skate-limit",
  allowList: EXEMPT_KEYS,
  addHeadersOnExceeding: {
    // default show all the response headers when rate limit is not reached
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
  },
  addHeaders: {
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
    "retry-after": true,
  },
};

export { rateLimit, rateLimitOptions };
