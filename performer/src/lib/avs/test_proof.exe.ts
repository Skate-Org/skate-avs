import { keccak256 } from "viem";
import { buildMerkleTree, verifyMerkleRoot } from "./proof";

async function main() {
  const items: `0x${string}`[] = ["0x1", "0x2", "0x3", "0x4", "0x5", "0x6", "0x7"];
  const hashes = items.map(i => keccak256(i));

  const { root, layers, proofs } = buildMerkleTree(hashes);
  console.log(layers);
  console.log(proofs);


  const leaves = hashes;
  for (const [leafId, proof] of Object.entries(proofs)) {
    const isVerified = verifyMerkleRoot(leaves[Number(leafId)], proof, root);
    console.log("Is verified", isVerified);
  }
}

main()
