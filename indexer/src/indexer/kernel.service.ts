import { Log } from "viem";
import { IMessageBox_ABI } from "../ABI/IMessageBox";
import { skateClient } from "../common/client";
import { EnvMode } from "../common/env";
import { messageBoxFromMode, saveTasks, TaskParams } from "./utils";

type TaskSubmittedLog = Log<bigint, number, false, (typeof IMessageBox_ABI)[0], undefined>;

async function decodeMessageBoxLogs(logs: TaskSubmittedLog[]) {
  const tasks: TaskParams[] = [];

  const TASK_DEFINITION_ID = 0; // Keep it 0 until we have more customized business logic

  for (const log of logs) {
    const {
      args: { taskId, task },
      transactionHash,
      blockNumber,
    } = log;
    if (taskId == undefined || task == undefined) {
      console.error("SkateAvs.Indexer::Collector.Kernel -- Invalid TaskSubmitted log: ", log);
      continue;
    }

    // Store information in the map
    tasks.push({
      taskId: Number(taskId),
      messageBoxAddress: log.address,
      appAddress: task.appAddress,
      calldata: task.taskCalldata,
      kernelTxHash: transactionHash,
      kernelBlock: Number(blockNumber),
      user: task.user,
      chainId: task.chainId.toString(10),
      vmType: Number(task.vmType),
      taskDefinitionId: TASK_DEFINITION_ID,
    });
  }

  return tasks;
}

export async function collectIntent(mode: EnvMode, fromBlock: bigint, toBlock: bigint | undefined) {
  const logs = await skateClient.getContractEvents({
    address: messageBoxFromMode(mode),
    abi: IMessageBox_ABI,
    eventName: "TaskSubmitted",
    fromBlock,
    toBlock,
  });
  const tasks = await decodeMessageBoxLogs(logs);
  if (tasks.length > 0) {
    console.log(
      `SkateAvs.Indexer::Collector.Kernel -- ::Collected ${logs.length} TaskSubmitted event(s) from MessageBox`,
    );
    await saveTasks(mode, tasks);
  }
}

export async function watchIntent(mode: EnvMode) {
  const unwatch = skateClient.watchContractEvent({
    address: messageBoxFromMode(mode),
    abi: IMessageBox_ABI,
    eventName: "TaskSubmitted",
    onLogs: async (logs) => {
      const tasks = await decodeMessageBoxLogs(logs);
      if (tasks.length > 0) {
        console.log(
          `SkateAvs.Indexer::Collector.Kernel -- ::Collected ${logs.length} TaskSubmitted event(s) from MessageBox`,
        );
        try {
          await saveTasks(mode, tasks);
        } catch (e) {
          console.log(`Save Intent error`, e);
        }
      }
    },
  });
  return unwatch;
}
