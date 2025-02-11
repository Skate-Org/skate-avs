import { IMessageBox_ABI, IMessageBox_Legacy_ABI } from "../ABI/IMessageBox";
import { SkateTask, decodeEventLogs } from "../lib/avs";
import { newProducer } from "../lib/zeromq";
import { legacyMessageBox, messageBox, skateClient } from "../lib/const";
import { MODE } from "../lib/env";

export default async function main() {
  const { sendData } = await newProducer<SkateTask>();

  const mode = MODE;

  // NOTE: watch and process live
  skateClient.watchContractEvent({
    address: legacyMessageBox(mode),
    abi: IMessageBox_Legacy_ABI,
    eventName: "TaskSubmitted",
    strict: true,
    // TODO: ensure this no task can be lost. else explain why this is (very) safe
    async onLogs(logs) {
      const skateTasks = decodeEventLogs(logs);
      console.log("AVS.Performer::Watcher -- Received Skate tasks (Legacy -- Polymarket) ---- ", skateTasks);
      skateTasks.forEach((l) => sendData(l));
    },
  });

  skateClient.watchContractEvent({
    address: messageBox(mode),
    abi: IMessageBox_ABI,
    eventName: "TaskSubmitted",
    strict: true,
    // TODO: ensure this no task can be lost. else explain why this is (very) safe
    async onLogs(logs) {
      const skateTasks = decodeEventLogs(logs);
      console.log("AVS.Performer::Watcher -- Received Skate tasks (Newly Integrated Apps) ---- ", skateTasks);
      skateTasks.forEach((l) => sendData(l));
    },
  });
}

main();
