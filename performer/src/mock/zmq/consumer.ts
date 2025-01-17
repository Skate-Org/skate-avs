import { newConsumer } from "../../lib/zeromq";

(async () => {
  const consumer = await newConsumer<string>("test_socket.sock");

  consumer.registerTaskReceiveHandler((task) => {
    console.log("Received task:", task);
  });

  // Start processing tasks
  await consumer.processTasks();

  // Optional: Close the consumer when needed
  // await consumer.close();
})();

