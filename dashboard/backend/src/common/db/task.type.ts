export type KernelTask = TaskKey & TaskFields;
export type TaskKey = {
  taskId: number;
  messageBoxAddress: string;
};

export type TaskFields = {
  appAddress: string;
  calldata: string;
  user: string;
  chainId: string;
  kernelTxHash: string;
  kernelBlock: number;
  vmType: number;
  taskDefinitionId: number;
  avsVerified: boolean;
  avsTxHash?: string;
  aggregator?: string; // address of the AVS aggregator
};

export function mapItemToKernelTask(item: any): KernelTask {
  return {
    taskId: Number(item.taskId),
    messageBoxAddress: item.messageBoxAddress,
    appAddress: item.appAddress,
    kernelBlock: Number(item.kernelBlock),
    calldata: item.calldata,
    kernelTxHash: item.kernelTxHash,
    user: item.user,
    chainId: item.chainId,
    vmType: Number(item.vmType),
    avsVerified: !!item.avsVerified,
    taskDefinitionId: Number(item.taskDefinitionId),
    aggregator: item.aggregator ?? null,
    avsTxHash: item.avsTxHash ?? null,
  };
}
