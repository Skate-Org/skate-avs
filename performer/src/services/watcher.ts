import { IMessageBox_Shuffle_ABI, IMessageBox_Polymarket_ABI } from "../lib/abi/IMessageBox";
import { SkateTask, decodeEventLogs } from "../lib/abi/IMessageBox";
import { newProducer } from "../lib/zeromq";
import { polymarketMessageBox, shuffleMessageBox, skateClient } from "../lib/config";
import { MODE } from "../lib/env";

export default async function main() {
  const { sendData } = await newProducer<SkateTask>();

  const mode = MODE;

  // skateClient.watchContractEvent({
  //   address: polymarketMessageBox(mode),
  //   abi: IMessageBox_Polymarket_ABI,
  //   eventName: "TaskSubmitted",
  //   strict: true,
  //   async onLogs(logs) {
  //     const skateTasks = decodeEventLogs(logs);
  //     console.log("AVS.Performer::Watcher received [POLYMARKET Tasks] --- ", skateTasks);
  //     skateTasks.forEach((l) => sendData(l));
  //   },
  // });

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
    address: shuffleMessageBox(mode),
    abi: IMessageBox_Shuffle_ABI,
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
