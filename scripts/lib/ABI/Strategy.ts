import { parseAbi } from "viem";

export const Strategy_ABI = parseAbi([
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
