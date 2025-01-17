import { parseAbi } from "viem";

export const KernelPolymarket_ABI = parseAbi([
  ////////////////////////////////////////
  //////////// READ functions ////////////
  "function getSafeByUser(uint256 vmType, bytes32 user) external view returns (address addr)",

  ////////////////////////////////////////
  ////////////////////////////////////////
] as const);
