import { encodeAbiParameters, Log } from "viem";
import { IMessageBox_ABI } from "../../ABI/IMessageBox";

export type TaskSubmitted_Log = Log<bigint, number, false, (typeof IMessageBox_ABI)[0], true>;
export type SkateTask = ReturnType<typeof decodeLog>;

function decodeLog(log: TaskSubmitted_Log) {
  const { taskId, task } = log.args;
  return {
    taskId: Number(taskId),
    appAddress: task.appAddress,
    taskCalldata: task.taskCalldata,
    user: task.user,
    chainId: task.chainId.toString(),
    vmType: Number(task.vmType),
    tx_hash: log.transactionHash,
  };
}

export function decodeEventLogs(taskSubmittedLogs: TaskSubmitted_Log[]): SkateTask[] {
  const decodedLogs = taskSubmittedLogs.map(decodeLog);
  return decodedLogs;
}
