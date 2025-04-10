import "dotenv/config";
import { FastifyRequest, FastifyReply } from "fastify";

/**
 * Middleware to validate the API key
 * @param req - The request object
 * @param res - The response object
 * @param done - Callback to signal completion
 */
const validateKeyMiddleware = (req: FastifyRequest, res: FastifyReply, done: (err?: Error) => void) => {
  const requestApiKey = req.headers["x-api-key"];
  if (!requestApiKey) {
    res.status(401).send({ error: "Unauthorized: No API key provided" });
    return;
  }

  if (requestApiKey !== process.env.API_KEY) {
    res.status(401).send({ error: "Unauthorized: Invalid API key" });
    return;
  }

  done();
};

export { validateKeyMiddleware };
