import { parseAbi } from "viem";

export const AvsTreasury_ABI = parseAbi([
  "function depositERC20(uint256 _amount) external",
] as const);
