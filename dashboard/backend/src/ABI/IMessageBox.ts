import { parseAbi } from "viem";

export const IMessageBox_ABI = parseAbi([
  "event TaskSubmitted(uint256 taskId, Task task)",
  `struct Task { bytes32 appAddress; bytes taskCalldata; bytes32 user; uint256 chainId; uint256 vmType; }`,
] as const);
