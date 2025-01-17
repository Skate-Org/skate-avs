export * from "./log";
import { encodeAbiParameters, keccak256, parseAbiParameters } from "viem";
import { SkateTask } from "./log";

// TODO: Change the AvsTask structure and connect with Indexer to make sure:
//  - sufficient off-chain info for merkle re-construction of each tasks: bundled info vs. individual task info
//  - mapping avsTask <-> skateTasks
export type AvsProofData = {
  proofOfTask: string;
  data: `0x${string}`;
  merkleTree: `0x${string}`[][];
  taskDefinitionId: number;
};

export function constructProofFromTaskBundle(skateTaskBundle: SkateTask[]): AvsProofData {
  const taskHashes = skateTaskBundle.map(hashSkateTask);
  const merkle = buildMerkleTree(taskHashes);

  // TODO: Store the merkle layers in public storage 
  // then expose via API, enabling retrieval by:
  //  - Root hash
  //  - AVS Task ID
  //  - Skate Kernel Task ID
  const proofOfTask = "<SOME_URI>";
  const TASK_DEFINITION_ID = 0;

  return {
    proofOfTask,
    data: merkle.root,
    merkleTree: merkle.layers,
    taskDefinitionId: TASK_DEFINITION_ID
  }
}

// Function to hash a single SkateTask
export function hashSkateTask(task: SkateTask) {
  const encodedFields = encodeAbiParameters(
    parseAbiParameters("uint256 taskId, address appAddress, bytes taskCalldata, address user, uint256 chainId, uint256 vmType, bytes32 tx_hash"),
    [
      BigInt(task.taskId),
      task.appAddress,
      task.taskCalldata,
      task.user,
      BigInt(task.chainId),
      BigInt(task.vmType),
      task.tx_hash
    ]
  );
  return keccak256(encodedFields);
}

// Function to build a Merkle tree from hashes
export function buildMerkleTree(hashes: `0x${string}`[]): { root: `0x${string}`; layers: `0x${string}`[][] } {
  if (hashes.length === 0) {
    throw new Error("Cannot build a Merkle tree with no hashes.");
  }

  let layers: `0x${string}`[][] = [hashes];

  while (layers[layers.length - 1].length > 1) {
    const previousLayer = layers[layers.length - 1];
    const nextLayer: `0x${string}`[] = [];

    for (let i = 0; i < previousLayer.length; i += 2) {
      const left = previousLayer[i];
      const right = previousLayer[i + 1] || previousLayer[i]; // Handle odd number of nodes by duplicating the last node
      const combinedHash = keccak256(new TextEncoder().encode(left + right));
      nextLayer.push(combinedHash);
    }

    layers.push(nextLayer);
  }

  return { root: layers[layers.length - 1][0], layers };
}
