export type AvsTaskByAttester = AvsTaskByAttesterKey & AvsTaskByAttesterFields;
export type AvsTaskByAttesterKey = {
  attesterId: number;
  taskId: number;
};

export type AvsTaskByAttesterFields = {
  txHash: string;
  indexedTimestamp: number;
};

export function mapToAttesterAvsTask(item: any): AvsTaskByAttester {
  return {
    attesterId: Number(item.attesterId),
    taskId: Number(item.taskId),
    txHash: item.txHash,
    indexedTimestamp: Number(item.indexedTimestamp),
  };
}
