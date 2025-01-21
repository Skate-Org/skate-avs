export * from "./log";
import { ByteArray, encodeAbiParameters, Hex, keccak256, parseAbiParameters } from "viem";
import { SkateTask } from "./log";

export type AvsProofData = {
  proofOfTask: string;
  data: `0x${string}`;
  merkleTree: ReturnType<typeof buildMerkleTree>;
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
  const proofOfTask = merkle.root;
  const TASK_DEFINITION_ID = 0;

  return {
    proofOfTask,
    data: merkle.root,
    merkleTree: merkle,
    taskDefinitionId: TASK_DEFINITION_ID
  };
}

// Function to hash a single SkateTask
export function hashSkateTask(task: SkateTask) {
  const encodedFields = encodeAbiParameters(
    parseAbiParameters("uint256 taskId, bytes32 appAddress, bytes taskCalldata, bytes32 user, uint256 chainId, uint256 vmType, bytes32 tx_hash" as const),
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
export function buildMerkleTree(
  hashes: `0x${string}`[],
  hashFunction: (input: Hex | ByteArray) => `0x${string}` = keccak256
) {
  if (hashes.length === 0) {
    throw new Error("Cannot build a Merkle tree with no hashes.");
  }

  let layers: `0x${string}`[][] = [hashes];
  const proofs: { [leafIndex: number]: [`0x${string}`, boolean][] } = {}; // Proofs for each leaf

  while (layers[layers.length - 1].length > 1) {
    const previousLayer = layers[layers.length - 1];
    const nextLayer: `0x${string}`[] = [];

    for (let i = 0; i < previousLayer.length; i += 2) {
      const left = previousLayer[i];
      const right = previousLayer[i + 1] || previousLayer[i]; // Handle odd number of nodes by duplicating the last node
      const combinedHash = hashFunction(new TextEncoder().encode(left + right));
      nextLayer.push(combinedHash);
    }

    layers.push(nextLayer);
  }

  // Traverse the tree to ensure proofs for all leaves are complete
  const treeHeight = layers.length - 1;
  for (let i = 0; i < hashes.length; i++) {
    let currentIndex = i;
    proofs[i] = [];
    for (let level = 0; level < treeHeight; level++) {
      const layer = layers[level];
      const isLeftNode = currentIndex % 2 === 0;
      const siblingIndex = isLeftNode ? currentIndex + 1 : currentIndex - 1;

      if (isLeftNode) {
        if (siblingIndex < layer.length) {
          const siblingHash = layer[siblingIndex];
          proofs[i].push([siblingHash, true]);
        } else {
          // NOTE: This level have odd nodes
          proofs[i].push([layer[currentIndex], true]);
        }
      } else {
        const siblingHash = layer[siblingIndex];
        proofs[i].push([siblingHash, false]);
      }

      currentIndex = Math.floor(currentIndex / 2);
    }
  }

  const root = layers[layers.length - 1][0];

  return { root, layers, proofs };
}

export function verifyMerkleRoot(
  leaf: `0x${string}`,
  proof: [`0x${string}`, boolean][],
  root: `0x${string}`,
  hashFunction: (input: Hex | ByteArray) => `0x${string}` = keccak256
): boolean {
  let computedHash = leaf;

  for (const proofElement of proof) {
    const [hash, isLeft] = proofElement;
    if (isLeft) {
      computedHash = hashFunction(new TextEncoder().encode(computedHash + hash));
    } else {
      computedHash = hashFunction(new TextEncoder().encode(hash + computedHash));
    }
  }

  return computedHash === root;
}

