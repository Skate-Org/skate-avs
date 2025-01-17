import { checksumAddress, decodeAbiParameters, Log } from "viem";
import { AvsAttestationCenter_ABI, AvsAttestationCenter_SubmittedDataABI } from "../ABI/IAttestationCenter";
import { ATTESTATION_CENTER_ADDRESS } from "../common/const";
import { l2Client } from "../common/client";
import { messageBoxFromMode, saveTasks, TaskParams } from "./utils";
import { EnvMode } from "../common/env";

type ApproveLog = Log<bigint, number, false, (typeof AvsAttestationCenter_ABI)[0], undefined>;
async function processAttestationApprovedLogs(mode: EnvMode, logs: ApproveLog[]) {
  const tasks: TaskParams[] = [];

  for (const log of logs) {
    const { operator: performer, taskNumber, proofOfTask, data, taskDefinitionId } = log.args;
    const { from: aggRaw } = await l2Client.getTransaction({ hash: log.transactionHash });
    // NOTE: uses EIP-55 for backwards compatibility, avs chain is known by all entity.
    const aggregator = checksumAddress(aggRaw);

    try {
      const decodedTasksFromAbi = decodeAbiParameters(AvsAttestationCenter_SubmittedDataABI, data)[0];
      const decodedTasks: TaskParams[] = decodedTasksFromAbi.map((t) => {
        return {
          taskId: Number(t.taskId),
          messageBoxAddress: messageBoxFromMode(mode),
          aggregator,
          performer,
          avsTaskId: taskNumber,
          avsProof: proofOfTask,
          taskDefinitionId,
          avsTxHash: log.transactionHash,
          avsVerified: true,
        };
      });
      tasks.push(...decodedTasks);
    } catch {
      console.error("SkateAvs.Indexer::Collector.Avs -- Can't decode data, maybe malformed or deprecated");
    }
  }

  return tasks;
}

// NOTE: this function is almost identical to `processAttestationApprovedLogs` since the 2 event signature are identical.
// Though it is implemented as 2 methods to ensure modularity for future updates (if any)
type RejectLog = Log<bigint, number, false, (typeof AvsAttestationCenter_ABI)[1], undefined>;
async function processAttestationRejectedLogs(mode: EnvMode, logs: RejectLog[]) {
  const tasks: TaskParams[] = [];

  for (const log of logs) {
    const { operator: performer, taskNumber, proofOfTask, data } = log.args;
    if (performer == undefined || data == undefined || taskNumber == undefined || proofOfTask == undefined) {
      console.error("SkateAvs.Indexer::Collector.Avs -- Invalid log: ", log);
      continue;
    }

    const { from: rawAggregator } = await l2Client.getTransaction({ hash: log.transactionHash });
    const aggregator = checksumAddress(rawAggregator, await l2Client.getChainId());

    try {
      const decodedTasksFromAbi = decodeAbiParameters(AvsAttestationCenter_SubmittedDataABI, data)[0];
      const decodedTasks: TaskParams[] = decodedTasksFromAbi.map((t) => {
        return {
          taskId: Number(t.taskId),
          messageBoxAddress: messageBoxFromMode(mode),
          aggregator,
          avsVerified: true,
        };
      });
      tasks.push(...decodedTasks);
    } catch {
      console.error("SkateAvs.Indexer::Collector.Avs -- Can't decode data, maybe malformed or deprecated");
    }
  }

  return tasks;
}

export async function collectAttestation(mode: EnvMode, fromBlock: bigint, toBlock: bigint | undefined) {
  const approvedLogs = await l2Client.getContractEvents({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: AvsAttestationCenter_ABI,
    eventName: "TaskSubmitted",
    fromBlock,
    toBlock,
  });
  const rejectedLogs = await l2Client.getContractEvents({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: AvsAttestationCenter_ABI,
    eventName: "TaskRejected",
    fromBlock,
    toBlock,
  });

  const approvedTasks = await processAttestationApprovedLogs(mode, approvedLogs);
  const rejectedTasks = await processAttestationRejectedLogs(mode, rejectedLogs);

  const tasks = [...approvedTasks, ...rejectedTasks];
  if (tasks.length > 0) {
    console.log(
      `SkateAvs.Indexer::Collector.Avs -- Collected ${approvedTasks.length} approved + ${rejectedTasks.length} rejected task(s) from AVS Attestation Center`,
    );
    try {
      await saveTasks(mode, tasks);
    } catch (e) {
      console.error(`SkateAvs.Indexer::Collector.Avs -- Saved Failed `, e);
    }
  }
}

export async function watchAttestation(mode: EnvMode) {
  const unwatchApprovedLogs = l2Client.watchContractEvent({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: AvsAttestationCenter_ABI,
    eventName: "TaskSubmitted",
    onLogs: async (logs) => {
      const approvedTasks = await processAttestationApprovedLogs(mode, logs);
      if (approvedTasks.length > 0) {
        console.info(`SkateAvs.Indexer::Collector.Avs -- Collected ${approvedTasks.length} APPROVED task(s) from AVS`);
      }
      await saveTasks(mode, approvedTasks);
    },
  });
  const unwatchRejectedLogs = l2Client.watchContractEvent({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: AvsAttestationCenter_ABI,
    eventName: "TaskRejected",
    onLogs: async (logs) => {
      const rejectedTasks = await processAttestationRejectedLogs(mode, logs);
      if (rejectedTasks.length > 0) {
        console.info(`SkateAvs.Indexer::Collector.Avs -- Collected ${rejectedTasks.length} APPROVED task(s) from AVS`);
      }
      await saveTasks(mode, rejectedTasks);
    },
  });

  return () => {
    unwatchApprovedLogs();
    unwatchRejectedLogs();
  };
}
