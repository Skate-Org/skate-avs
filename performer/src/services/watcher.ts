import { IMessageBox_Shuffle_ABI, IMessageBox_Polymarket_ABI, IMessageBox_AMM_ABI } from "../lib/abi/IMessageBox";
import { SkateTask, decodeEventLogs } from "../lib/abi/IMessageBox";
import { newProducer } from "../lib/zeromq";
import { ammMessageBox, polymarketMessageBox, shuffleMessageBox, skateClient } from "../lib/config";
import { MODE } from "../lib/env";

export default async function main() {
  const { sendData } = await newProducer<SkateTask>();

  const mode = MODE;

  skateClient.watchContractEvent({
    address: shuffleMessageBox(mode),
    abi: IMessageBox_Shuffle_ABI,
    eventName: "TaskSubmitted",
    strict: true,
    async onLogs(logs) {
      const skateTasks = decodeEventLogs(logs);
      console.log("AVS.Performer::Watcher received [SHUFFLE Tasks] --- ", skateTasks);
      skateTasks.forEach((l) => sendData(l));
    },
  });

  skateClient.watchContractEvent({
    address: ammMessageBox(mode),
    abi: IMessageBox_AMM_ABI,
    eventName: "TaskSubmitted",
    strict: true,
    async onLogs(logs) {
      const skateTasks = decodeEventLogs(logs);
      console.log("AVS.Performer::Watcher received [AMM Tasks] --- ", skateTasks);
      skateTasks.forEach((l) => sendData(l));
    },
  });

  skateClient.watchContractEvent({
    address: ammMessageBox("PRODUCTION"),
    abi: IMessageBox_AMM_ABI,
    eventName: "TaskSubmitted",
    strict: true,
    async onLogs(logs) {
      const skateTasks = decodeEventLogs(logs);
      console.log("AVS.Performer::Watcher received [AMM Tasks] --- ", skateTasks);
      skateTasks.forEach((l) => sendData(l));
    },
  });
}

main();
