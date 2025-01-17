import cors, { FastifyCorsOptions } from "@fastify/cors";

const corsOptions: FastifyCorsOptions = {
  // origin: "https://<frontend_domain_only>",
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export { cors, corsOptions };
