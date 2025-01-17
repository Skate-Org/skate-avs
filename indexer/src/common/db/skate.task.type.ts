export type SkateTask = SkateTaskKey & SkateTaskFields;
export type SkateTaskKey = {
  taskId: number;
  messageBoxAddress: string;
};

export type SkateTaskFields = {
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
  attesterIds?: string[];
  avsTaskId?: number;
  aggregator?: string; // address of the AVS aggregator (the one `submitTask`)
  performer?: string; // address of the AVS performer (the one index and send task to p2p network)
  avsProof?: string; // The proof CID from AVS
};

export function mapToSkateTask(item: any): SkateTask {
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
    avsTxHash: item.avsTxHash ?? null,
    avsTaskId: item.avsTaskId ? Number(item.avsTaskId) : null,
    aggregator: item.aggregator ?? null,
    performer: item.performer ?? null,
    avsProof: item.avsProof ?? null,
    attesterIds: item.attesterIds ?? null,
  };
}
