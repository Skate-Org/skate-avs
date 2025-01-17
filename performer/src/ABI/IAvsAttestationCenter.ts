import { parseAbiParameters } from "viem";

export const AvsAttestationCenter_SubmittedDataABI = parseAbiParameters([
  "AvsTask[] verifiedAvsTasks",
  "struct AvsTask { uint256 taskId; bytes32 appAddress; bytes taskCalldata; bytes32 user; uint256 chainId; uint256 vmType; }",
] as const);
