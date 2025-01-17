import { newProducer } from "../../lib/zeromq";

(async () => {
  const { sendData, close } = await newProducer<string>("test_socket.sock", (task) => {
    console.log("Sending task:", task);
  });

  // Send some tasks
  for (let i = 1; i <= 5; i++) {
    await sendData(`Task ${i}`);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
  }

  // Close the producer
  await close();
})();

