import { parseAbi } from "viem";

export const AttestationCenter_ABI = parseAbi([
  ////////////////////////////////////////
  //////////// READ functions ////////////

  // OPERATORS
  "function operatorsIdsByAddress(address _operator) external view returns (uint256)",
  "function numOfActiveOperators() external view returns (uint256)",

  // NOTE: can't parse enum, use uint8
  "struct PaymentDetails {address operator; uint256 lastPaidTaskNumber; uint256 feeToClaim; uint8 paymentStatus;}",
  "function getOperatorPaymentDetail(uint256 _operatorId) external view returns (PaymentDetails memory)",
  ////////////////////////////////////////
  ////////////////////////////////////////

  ////////////////////////////////////////
  /////////// WRITE functions ////////////
  ////////////////////////////////////////
  ////////////////////////////////////////
] as const);
