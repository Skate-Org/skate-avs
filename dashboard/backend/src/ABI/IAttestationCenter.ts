import { parseAbi, parseAbiParameters } from "viem";

export const IAttestationCenter_ABI = parseAbi([
  ////////////////////////////////////////
  /////////// EVENT signature ////////////
  "event TaskSubmitted(address operator, uint32 taskNumber, string proofOfTask, bytes data, uint16 taskDefinitionId)",
  "event TaskRejected(address operator, uint32 taskNumber, string proofOfTask, bytes data, uint16 taskDefinitionId)",
  ////////////////////////////////////////
  ////////////////////////////////////////
  ////////////////////////////////////////
  //////////// READ functions ////////////

  // OPERATORS
  "function operatorsIdsByAddress(address _operator) external view returns (uint256)",
  "function numOfOperators() external view returns (uint256)",
  "function taskNumber() external view returns (uint32)",
  "function baseRewardFee() external view returns (uint256)",
  "function numOfOperators() external view returns (uint256)",
  "function votingPower(address _operator) external view returns (uint256)",
  "function getTaskDefinitionMinimumVotingPower(uint16 _taskDefinitionId) external view returns (uint256)",


  // NOTE: can't parse enum, use uint8
  "struct PaymentDetails {address operator; uint256 lastPaidTaskNumber; uint256 feeToClaim; uint8 paymentStatus;}",
  "function getOperatorPaymentDetail(uint256 _operatorId) external view returns (PaymentDetails memory)",
  ////////////////////////////////////////
  ////////////////////////////////////////
] as const);

export const IAttestationCenter_SubmittedDataABI = parseAbiParameters([
  "AvsTask[] verifiedAvsTasks",
  "struct AvsTask { uint256 taskId; bytes32 appAddress; bytes taskCalldata; bytes32 user; uint256 chainId; uint256 vmType; }",
] as const);
