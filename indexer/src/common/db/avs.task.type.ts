export type AvsTask = AvsTaskKey & AvsTaskFields;
export type AvsTaskKey = {
  taskId: number;
};

export type AvsTaskFields = {
  taskDefinitionId: number;
  proofCid: string; // The proof CID from AVS
  txHash?: string;
  attesterIds?: string[];
  aggregator?: string; // address of the AVS aggregator (the one `submitTask`)
  performer?: string; // address of the AVS performer (the one index and send task to p2p network)
  isApproved: boolean;
};

export function mapToAvsTask(item: any): AvsTask {
  return {
    taskId: Number(item.taskId),
    taskDefinitionId: Number(item.taskDefinitionId),
    proofCid: item.proofCid ?? null,
    txHash: item.txHash ?? null,
    aggregator: item.aggregator ?? null,
    performer: item.performer ?? null,
    attesterIds: item.attesterIds ?? null,
    isApproved: !!item.isApproved,
  };
}
