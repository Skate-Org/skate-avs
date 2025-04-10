export type AvsTask = AvsTaskKey & AvsTaskFields;
export type AvsTaskKey = {
  taskId: number;
  attestationCenterInfo: string;
};

export type AvsTaskFields = {
  taskDefinitionId: number;
  proofOfTask: string;
  txHash: string;
  indexedTimestamp: number;
  attesterIds: number[];
  skateTasks: {
    id: number;
    hash: string;
    merkleIndex: number;
  }[];
  destChainId: number;
  rewards?: { operatorId: number; baseRewardFee: string }[];
  // aggregator: string; // address of the AVS aggregator (the one `submitTask`)
  // performer: string; // address of the AVS performer (the one index and send task to p2p network)
};

export function mapToAvsTask(item: any): AvsTask {
  return {
    taskId: Number(item.taskId),
    attestationCenterInfo: item.attestationCenterInfo,
    taskDefinitionId: Number(item.taskDefinitionId),
    proofOfTask: item.proofOfTask,
    txHash: item.txHash,
    indexedTimestamp: Number(item.indexedTimestamp),
    attesterIds: item.attesterIds || [],
    skateTasks: item.skateTasks || [],
    destChainId: Number(item.destChainId),
    rewards: item.rewards || [],
    // aggregator: item.aggregator,
    // performer: item.performer,
  };
}
