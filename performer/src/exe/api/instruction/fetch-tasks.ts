import "dotenv/config";
import { FastifyReply, FastifyRequest } from "fastify";
import { messageBoxFromMode, SKATE_EXPLORER, skateClient } from "../../../lib/const";
import { IMessageBox_ABI } from "../../../ABI/IMessageBox";
import { SkateTask, decodeEventLogs } from "../../../lib/avs";
import { newProducer } from "../../../lib/zeromq";
import { MODE } from "../../../lib/env";

export const fetchTasks = async (
  request: FastifyRequest<{
    Body: { fromBlock: number; toBlock: number };
    Headers: { "api-key": string };
  }>,
  reply: FastifyReply,
) => {
  const API_KEY = process.env.API_KEY; // Replace with your actual API key
  const apiKey = request.headers["api-key"];
  if (apiKey !== API_KEY) {
    return reply.status(401).send({ status: "error", message: "Unauthorized: Invalid API key" });
  }
  try {
    const { fromBlock, toBlock } = request.body;
    const logs = await skateClient.getContractEvents({
      address: messageBoxFromMode(MODE),
      abi: IMessageBox_ABI,
      eventName: "TaskSubmitted",
      fromBlock: BigInt(fromBlock),
      toBlock: BigInt(toBlock),
      strict: true,
    });
    console.log(`Receive request to get tasks from ${fromBlock} to ${toBlock}`);
    if (logs.length > 0) {
      console.log(`Found ${logs.length} logs`);
      const { sendData } = await newProducer<SkateTask>();
      const decodedLogs = decodeEventLogs(logs);
      for (const log of decodedLogs) {
        console.log(`Sending task... -- taskId=${log.taskId} | link=${SKATE_EXPLORER}/tx/${log.tx_hash}`);
        await sendData(log);
      }
      return reply.send({ status: "success", message: `${logs.length} TaskSubmitted events detected` });
    } else {
      return reply.status(404).send({ status: "error", message: "No MessageBox.TaskSubmitted log found!" });
    }
  } catch (err: any) {
    if (err.name === "InvalidParamsRpcError") {
      return reply.status(400).send({ status: "error", message: "Invalid transaction hash format" });
    }
    if (err.name === "TransactionReceiptNotFoundError") {
      return reply.status(500).send({ status: "error", message: "Transaction with specified hash does not exist" });
    }
    console.error(`${err}\n\nError name: ${err.name}`);
    return reply.status(500).send({ status: "error", message: "Internal fetch error" });
  }
};

