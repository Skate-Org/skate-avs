import { Log } from "viem";
import { IMessageBox_Shuffle_ABI, IMessageBox_Polymarket_ABI, IMessageBox_AMM_ABI } from ".";

export type PolymarketTaskLog = Log<bigint, number, false, (typeof IMessageBox_Polymarket_ABI)[0], true>;
export type ShuffleTaskLog = Log<bigint, number, false, (typeof IMessageBox_Shuffle_ABI)[0], true>;
export type AmmTaskLog = Log<bigint, number, false, (typeof IMessageBox_AMM_ABI)[0], true>;

export type SkateTask = {
  taskId: number;
  appAddress: `0x${string}`;
  taskCalldata: `0x${string}`;
  user: `0x${string}`;
  chainId: string;
  vmType: number;
  tx_hash: `0x${string}`;
};

function decodeLog(log: ShuffleTaskLog | PolymarketTaskLog | AmmTaskLog): SkateTask {
  const { taskId, task } = log.args;
  const chainId = "chainId" in task ? task.chainId : task.destChainId;
  const vmType = "vmType" in task ? Number(task.vmType) : Number(task.srcVmType);

  return {
    taskId: Number(taskId),
    appAddress: task.appAddress,
    taskCalldata: task.taskCalldata,
    user: task.user,
    chainId: chainId.toString(),
    vmType: vmType,
    tx_hash: log.transactionHash,
  };
}

export function decodeEventLogs(taskSubmittedLogs: PolymarketTaskLog[] | ShuffleTaskLog[]): SkateTask[] {
  const decodedLogs = taskSubmittedLogs.map(decodeLog);
  return decodedLogs;
}
