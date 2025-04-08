import { parseAbi } from "viem";

export const AvsGovernance_ABI = parseAbi([
  ////////////////////////////////////////
  //////////// READ functions ////////////

  // AVS INFO
  "function getIsAllowlisted() external view returns (bool)",
  "function getRestakeableStrategies() external view returns (address[] memory)",
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

  ////////////////////////////////////////
  /////////// WRITE functions ////////////
  "function setIsAllowlisted(bool _isAllowlisted) external", // NOTE: Only Roles.AVS_GOVERNANCE_MULTISIG
  "function setNumOfOperatorsLimit(uint256 _newLimitOfNumOfOperators)",

  "function updateAVSMetadataURI(string calldata metadataURI) external", // NOTE: Only Roles.AVS_GOVERNANCE_MULTISIG

  "function setStakingContractMultiplier(VotingPowerMultiplier calldata _votingPowerMultiplier) external", // NOTE: Only Roles.MULTIPLIER_SYNCER
  "function setStakingContractMultiplierBatch(VotingPowerMultiplier[] calldata _votingPowerMultipliers) external", // NOTE: Only Roles.MULTIPLIER_SYNCER
  `struct VotingPowerMultiplier { address stakingContract; uint256 multiplier; uint8 sharedSecurityProvider; }`,

  "function setSupportedStakingContracts(StakingContractInfo[] memory _stakingContractsDetails) external",
  "struct StakingContractInfo { address stakingContract; uint8 sharedSecurityProvider;}",

  "function registerAsAllowedOperator(uint256[4] calldata _blsKey, bytes calldata _authToken, address _rewardsReceiver, SignatureWithSaltAndExpiry memory _operatorSignature, Signature calldata _blsRegistrationSignature) external",
  `struct SignatureWithSaltAndExpiry { bytes signature; bytes32 salt; uint256 expiry; }`,
  `struct Signature { uint256[2] signature; }`,

  "function setAllowlistSigner(address _allowlistSigner) external",
  "function setAvsGovernanceMultiplierSyncer(address _newAvsGovernanceMultiplierSyncer)"
  ////////////////////////////////////////
  ////////////////////////////////////////
] as const);
