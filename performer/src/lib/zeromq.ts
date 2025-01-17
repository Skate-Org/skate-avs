import * as zmq from "zeromq";
import "dotenv/config";
import fs from "fs";

export const PERFORMER_SOCKET = process.env.PERFORMER_SOCKET as `${string}.sock`;

/**
 * ZMQ producer instance
 */
export async function newProducer<T>(socketName = PERFORMER_SOCKET, logger?: (t: T) => void) {
  const socket = new zmq.Push();
  const socketPath = `ipc://${socketName}`;

  console.info(`(Producer) Connecting to ${socketPath}`);
  socket.connect(socketPath);

  console.info(`(Producer) connected to ${socketPath}`);
  return {
    /**
     * Send data to the connected consumer(s)
     */
    sendData: async (task: T) => {
      const taskData = JSON.stringify(task);
      if (logger) {
        logger(task);
      }
      await socket.send(taskData); // Send task data to connected consumers
    },

    /**
     * Gracefully close the producer
     */
    close: async () => {
      socket.close();
      console.info("(Producer) connection closed.");
    },
  };
}
/**
 * ZMQ consumer instance
 */
export async function newConsumer<T>(socketName = PERFORMER_SOCKET, onTaskReceived?: (task: T) => void, logTask?: (task: T) => void) {
  const socket = new zmq.Pull();
  const socketPath = `ipc://${socketName}`;

  // Ensure socket path cleanup before binding
  if (fs.existsSync(socketName)) {
    fs.unlinkSync(socketName); // Remove stale socket file
  }

  await socket.bind(socketPath); // Consumer binds to the socket
  console.info(`(Consumer) listening on ${socketPath}`);
  let taskReceivedHandler = onTaskReceived ?? null;

  return {
    registerTaskReceiveHandler: (handler: (task: T) => void) => {
      taskReceivedHandler = handler;
    },
    /**
     * Start process tasks from the socket
     */
    processTasks: async () => {
      if (!taskReceivedHandler) {
        console.warn("(Consumer) Task Handler not set");
        return;
      }
      console.log("(Consumer) processing tasks...");
      // Start an asynchronous loop to listen for tasks
      for await (const [msg] of socket) {
        try {
          // Parse the incoming task message
          const task: T = JSON.parse(msg.toString());
          if (!!logTask) {
            logTask(task);
          }

          // Trigger the registered task handler if set
          if (!!taskReceivedHandler) {
            taskReceivedHandler(task);
          }
        } catch (err) {
          console.warn("Failed to parse task data:", err);
        }
      }
    },
    /**
     * Gracefully close the consumer connection
     */
    close: async () => {
      socket.close();
      if (fs.existsSync(socketName)) {
        fs.unlinkSync(socketName); // Cleanup socket file on close
      }
      console.info("Consumer connection closed.");
    },
  };
}
