import { parseAbi, parseAbiParameters } from "viem";

export const AvsAttestationCenter_ABI = parseAbi([
  "event TaskSubmitted(address operator, uint32 taskNumber, string proofOfTask, bytes data, uint16 taskDefinitionId)",
  "event TaskRejected(address operator, uint32 taskNumber, string proofOfTask, bytes data, uint16 taskDefinitionId)",
] as const);

export const AvsAttestationCenter_SubmittedDataABI = parseAbiParameters([
  "AvsTask[] verifiedAvsTasks",
  "struct AvsTask { uint256 taskId; bytes32 appAddress; bytes taskCalldata; bytes32 user; uint256 chainId; uint256 vmType; }",
] as const);
