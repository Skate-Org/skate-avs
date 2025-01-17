import { parseAbi } from "viem";

/**
 * Source: https://github.com/Layr-Labs/eigenlayer-contracts/blob/dev/src/contracts/interfaces/IStrategy.sol
 * Deployments: https://github.com/Layr-Labs/eigenlayer-contracts/tree/dev?tab=readme-ov-file#deployments
 */
export const IEigenLayerStrategy_ABI = parseAbi([
  ////////////////////////////////////////
  //////////// READ functions ////////////
  "function shares(address user) external view returns (uint256)",
  ////////////////////////////////////////
  ////////////////////////////////////////

  ////////////////////////////////////////
  /////////// WRITE functions ////////////
  ////////////////////////////////////////
  ////////////////////////////////////////
] as const);
