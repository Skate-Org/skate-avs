import { Log } from "viem";
import { IMessageBox_ABI, IMessageBox_Legacy_ABI } from "../../ABI/IMessageBox";

export type LegacyTaskSubmitted_Log = Log<bigint, number, false, (typeof IMessageBox_Legacy_ABI)[0], true>;
export type TaskSubmitted_Log = Log<bigint, number, false, (typeof IMessageBox_ABI)[0], true>;
export type SkateTask = ReturnType<typeof decodeLog>;

function decodeLog(log: TaskSubmitted_Log | LegacyTaskSubmitted_Log) {
  const { taskId, task } = log.args;
  const chainId = "chainId" in task ? task.chainId : task.destChainId;

  return {
    taskId: Number(taskId),
    appAddress: task.appAddress,
    taskCalldata: task.taskCalldata,
    user: task.user,
    chainId: chainId.toString(),
    vmType: Number(task.vmType),
    tx_hash: log.transactionHash,
  };
}

export function decodeEventLogs(taskSubmittedLogs: LegacyTaskSubmitted_Log[] | TaskSubmitted_Log[]): SkateTask[] {
  const decodedLogs = taskSubmittedLogs.map(decodeLog);
  return decodedLogs;
}
