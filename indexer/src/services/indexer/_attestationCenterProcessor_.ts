import { TaskSubmittedLog, RewardAccumulatedLog, TaskRejectedLog, TaskSubmittedEventAbi } from "../../lib/abi";
import { ATTESTATION_CENTER_ADDRESS } from "../../lib/const";
import { l2Client } from "../../lib/client";
import { EnvMode } from "../../lib/env";
import { createAvsTask } from "../../lib/db";
import { BlockTag, decodeAbiParameters, parseAbiParameters } from "viem";
import { createAvsTaskByAttester } from "../../lib/db/avs.taskByAttester";

const CLIENT = l2Client;

async function processAttestationLogs(
  mode: EnvMode,
  {
    submittedTasks,
    rewardEvents,
    rejectedTasks,
  }: {
    submittedTasks: TaskSubmittedLog[];
    rewardEvents?: RewardAccumulatedLog[];
    rejectedTasks?: TaskRejectedLog[];
  },
) {
  // TODO: Do something with rejected tasks
  rejectedTasks;

  // TODO: Do something with reward events. For now reward scheme is defined off-chain.
  rewardEvents;

  for (const taskLog of submittedTasks) {
    console.log(`Receiving attestation: `, {
      task: taskLog.args,
      block: taskLog.blockNumber,
      hash: `https://explorer.mantle.xyz/tx/${taskLog.transactionHash}`,
    });
    const { taskNumber: taskId, attestersIds, proofOfTask, data, taskDefinitionId } = taskLog.args;

    const txHash = taskLog.transactionHash;

    let skateTasks = [];
    let destChainId = 0;
    const AVS_TASK_ABI_STRING =
      "uint256 destChainId, uint256[] taskIds, bytes32[] taskHashes, uint256[] merkleLeafIndices";
    const AVS_TASK_ABI = parseAbiParameters(AVS_TASK_ABI_STRING);

    try {
      const [chainId, skateTaskIds, taskHashes, merkleLeafIndices] = decodeAbiParameters(AVS_TASK_ABI, data);
      destChainId = Number(chainId);
      for (let i = 0; i < skateTaskIds.length; i++) {
        skateTasks.push({
          id: skateTaskIds[i],
          hash: taskHashes[i],
          merkleIndex: merkleLeafIndices[i],
        });
      }
    } catch (e) {
      console.warn(`Task ID=${taskId} doesn't conform to standard data format. Expected ABI: "${AVS_TASK_ABI_STRING}"`);
    }

    const now = Math.round(Date.now() / 1000);

    await createAvsTask(mode, taskId, {
      taskDefinitionId,
      proofOfTask,
      indexedTimestamp: now,
      skateTasks,
      destChainId,
      attesterIds: attestersIds.map((id) => Number(id)),
      txHash,
    });
    for (const attesterId of attestersIds) {
      await createAvsTaskByAttester(
        mode,
        { attesterId: Number(attesterId), taskId },
        {
          indexedTimestamp: now,
          txHash,
        },
      );
    }
    console.log(`DB saved for: `, { taskId: taskLog.args.taskNumber });
  }
}

export async function collectAttestation(
  _: EnvMode,
  fromBlock: bigint,
  toBlock: bigint | undefined,
): Promise<{
  taskSubmittedLogs: TaskSubmittedLog[];
  taskRejectedLogs: TaskRejectedLog[];
  rewardAccumulatedLogs: RewardAccumulatedLog[];
}> {
  const taskSubmittedLogs = await CLIENT.getContractEvents({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: TaskSubmittedEventAbi,
    eventName: "TaskSubmitted",
    strict: true,
    fromBlock,
    toBlock,
  });

  return {
    taskSubmittedLogs,
    taskRejectedLogs: [] as TaskRejectedLog[],
    rewardAccumulatedLogs: [] as RewardAccumulatedLog[],
  };
}

export async function watchAttestation(mode: EnvMode) {
  const pollingIntervalMs = 2_000;
  const safeWait = 0n;
  if (safeWait < 0n) {
    throw new Error(`Invalid safe wait config ${safeWait}. Must be non-negative`);
  }

  console.log(`Watching AVS Attestation logs...`);

  const blockTag: BlockTag = "latest";
  let currentBlock = (await CLIENT.getBlock({ blockTag })).number - safeWait;

  const unwatch = setInterval(async () => {
    const mostRecentBlock = (await CLIENT.getBlock({ blockTag })).number - safeWait;
    if (currentBlock > mostRecentBlock) {
      // NOTE: This mean the polling is faster than latest block advance, wait for next interval
      return;
    }
    const fromBlock = currentBlock;
    currentBlock = mostRecentBlock;

    const result = await collectAttestation(mode, fromBlock, currentBlock);

    await processAttestationLogs(mode, {
      submittedTasks: result.taskSubmittedLogs,
    });

    currentBlock += 1n; // advance to avoid duplicate
  }, pollingIntervalMs);

  return unwatch;
}
