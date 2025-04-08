import { ByteArray, encodeAbiParameters, Hex, keccak256, parseAbiParameters } from "viem";
import { SkateTask } from "../abi/IMessageBox";

type MerkleTreeResult = ReturnType<typeof buildMerkleTree>;

export type AvsProofData = {
  proofOfTask: string;
  data: `0x${string}`;
  merkleTree: MerkleTreeResult;
  taskDefinitionId: number;
};

// Structure for the value in the new data mapping
export type TaskData = {
  taskHash: `0x${string}`;
  merkleLeafIndex: number;
};

export type TaskDataMap = {
  [key: number]: {
    taskHash: `0x${string}`;
    merkleLeafIndex: number;
  };
};
/**
 *  NOTE: Constraints for task bundle
 *  1/ Must share the same destination chainId/vmType
 *  2/ Must not expired [expiry time to be include in task]
 *
 * ---
 *  TODO: Upgrades required for this workflow
 *  1/ Othentic upgrade AVS to use bls12-381 on Pectra upgrade
 *  2/ Custom hook on Othentic CLI to support aggregator using multicall:
 *     a) Multicall a batch of AVS's `submitTask` **group by destination chainId/vmType**
 *     b) Support Othentic CLI aggregator connection with multi-performers
 **/
export function constructProofFromTaskBundle(skateTaskBundle: SkateTask[]): AvsProofData {
  if (skateTaskBundle.length == 0) {
    throw new Error("Empty task bundle!");
  }

  // 1. Generate the leaf hashes for the Merkle tree
  const taskHashes = skateTaskBundle.map(hashSkateTask);

  // 2. Build the Merkle tree using the generated hashes
  const merkle = buildMerkleTree(taskHashes);

  // 3. Create the mapping for the 'data' field
  const taskDataMap: TaskDataMap = {};
  let destChainId: null | bigint = null;
  skateTaskBundle.forEach((task, index) => {
    if (!destChainId) {
      destChainId = BigInt(task.chainId);
    }
    // Get the corresponding hash from the taskHashes array
    const taskHash = taskHashes[index];
    // The index in the original array is the leaf index in the Merkle tree
    const merkleLeafIndex = index;

    taskDataMap[task.taskId] = {
      taskHash: taskHash,
      merkleLeafIndex: merkleLeafIndex,
    };
  });

  // 4. Define other necessary fields
  const proofOfTask = merkle.root; // The Merkle root serves as the proof of the entire bundle
  const TASK_DEFINITION_ID = 0; // Static value as per original code
  destChainId = destChainId!;

  // 5. Return the structured proof data
  return {
    proofOfTask: proofOfTask,
    data: encodeTaskDataMapForSolidity(taskDataMap, destChainId), // Assign the newly created mapping here
    merkleTree: merkle, // Include the full Merkle tree result (root, layers, proofs)
    taskDefinitionId: TASK_DEFINITION_ID,
  };
}

/**
 * Encodes the TaskDataMap into ABI-encoded bytes suitable for Solidity.
 * Represents the data as three parallel arrays: taskIds, taskHashes, merkleLeafIndices.
 *
 * @param taskDataMap The mapping of task ID strings to TaskData objects.
 * @returns A hex string ('0x...') representing the ABI-encoded arrays.
 */
export function encodeTaskDataMapForSolidity(taskDataMap: TaskDataMap, destChainId: bigint): Hex {
  const taskIds: bigint[] = [];
  const taskHashes: Hex[] = []; // Array of bytes32 hex strings
  const merkleLeafIndices: bigint[] = [];
  // Iterate through the map and populate the parallel arrays
  for (const taskId in taskDataMap) {
    // Ensure it's an own property, not from the prototype chain
    if (Object.prototype.hasOwnProperty.call(taskDataMap, taskId)) {
      const taskData = taskDataMap[taskId];

      // Convert keys and values to the expected types for ABI encoding
      taskIds.push(BigInt(taskId)); // Solidity uint256 maps to bigint
      taskHashes.push(taskData.taskHash); // Assume taskHash is already a bytes32 hex string
      merkleLeafIndices.push(BigInt(taskData.merkleLeafIndex)); // Solidity uint256 maps to bigint
    }
  }

  // Define the ABI parameter types for the parallel arrays
  // NOTE: Ensure 'bytes32[]' matches the actual type of your task hashes.
  // If they are variable length, use 'bytes[]'.
  const paramTypes = parseAbiParameters(
    "uint256 destChainId, uint256[] taskIds, bytes32[] taskHashes, uint256[] merkleLeafIndices",
  );

  // Encode the arrays using viem's encodeAbiParameters
  const encodedData = encodeAbiParameters(paramTypes, [destChainId, taskIds, taskHashes, merkleLeafIndices]);

  return encodedData; // This is the '0x...' hex string
}

// Function to hash a single SkateTask
export function hashSkateTask(task: SkateTask) {
  const encodedFields = encodeAbiParameters(
    parseAbiParameters(
      "uint256 taskId, bytes32 appAddress, bytes taskCalldata, bytes32 user, uint256 chainId, uint256 vmType, bytes32 tx_hash" as const,
    ),
    [
      BigInt(task.taskId),
      task.appAddress,
      task.taskCalldata,
      task.user,
      BigInt(task.chainId),
      BigInt(task.vmType),
      task.tx_hash,
    ],
  );
  return keccak256(encodedFields);
}

// Function to build a Merkle tree from hashes
export function buildMerkleTree(
  hashes: `0x${string}`[],
  hashFunction: (input: Hex | ByteArray) => `0x${string}` = keccak256,
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
  hashFunction: (input: Hex | ByteArray) => `0x${string}` = keccak256,
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
