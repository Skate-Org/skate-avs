import { parseAbi } from "viem";

/**
 * Source: 
 * Deployments: 
 */
export const IAvsGovernance_ABI = parseAbi([
  ////////////////////////////////////////
  //////////// READ functions ////////////

  // AVS INFO
  "function getIsAllowlisted() external view returns (bool)",
  "function strategies() external view returns (address[] memory)",
  "function numOfActiveOperators() external view returns (uint256)",
  "function avsDirectory() external view returns (address)",
  "function avsName() external view returns (string memory)",
  "function vault() external view returns (address)",
  "function getNumOfOperatorsLimit() external view returns (uint256 numOfOperatorsLimitView)",
  "function minSharesForStrategy(address _strategy) external view returns (uint256)",
  "function strategyMultiplier(address _strategy) external view returns (uint256)",

  // OPERATORS
  "function getOperatorRestakedStrategies(address operator) external view returns (address[] memory)",
  "function getRewardsReceiver(address operator) external view returns (address)",
  "function numOfShares(address _operator) external view returns (uint256)",
  "function votingPower(address _operator) external view returns (uint256)",
  ////////////////////////////////////////
  ////////////////////////////////////////
] as const);
