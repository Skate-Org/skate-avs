import Fastify from "fastify";
import { instructionRouter } from "./instruction";

export function startWebServer(port: number) {
  const server = Fastify();
  server.register(instructionRouter, { prefix: "/instruction" });
  server.listen({ port, host: "0.0.0.0" }, (err, _) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  });
}

export default async function main() {
  const PORT = 4003;
  startWebServer(PORT);
  console.log("AVS.Performer::Input-Handler -- Opening manual task injection on port " + PORT);
}

main();
