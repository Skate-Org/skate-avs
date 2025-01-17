// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.25;

import "@othentic/NetworkManagement/L1/interfaces/IAvsGovernance.sol";

/*______     __      __                              __      __ 
 /      \   /  |    /  |                            /  |    /  |
/$$$$$$  | _$$ |_   $$ |____    ______   _______   _$$ |_   $$/   _______ 
$$ |  $$ |/ $$   |  $$      \  /      \ /       \ / $$   |  /  | /       |
$$ |  $$ |$$$$$$/   $$$$$$$  |/$$$$$$  |$$$$$$$  |$$$$$$/   $$ |/$$$$$$$/ 
$$ |  $$ |  $$ | __ $$ |  $$ |$$    $$ |$$ |  $$ |  $$ | __ $$ |$$ |
$$ \__$$ |  $$ |/  |$$ |  $$ |$$$$$$$$/ $$ |  $$ |  $$ |/  |$$ |$$ \_____ 
$$    $$/   $$  $$/ $$ |  $$ |$$       |$$ |  $$ |  $$  $$/ $$ |$$       |
 $$$$$$/     $$$$/  $$/   $$/  $$$$$$$/ $$/   $$/    $$$$/  $$/  $$$$$$$/
*/

/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
interface IOthenticRegistry {

  event OperatorOptIn(address operator, uint256 shares, uint32 serveUntilBlock);
  event OperatorFreezed(uint256 avsId, address operator);
  event AvsRegistered(uint256 id, address avsGovernance);
  event AvsOptIn(address avsGovernance, string avsName);

  error InvalidBlockId();

  function getOperatorRestakedStrategies(address _operator, address[] memory _allStrategies) external view returns (address[] memory);
  function numOfShares(address _operator, address _strategy) external view returns (uint256 amount);  
  function getOperatorShares(address _operator, address[] memory _strategies) external view returns (uint256);
  function getAvsGovernance(uint256 _id) external view returns (address avsGovernance);
  function getAvsGovernanceId(address _avsGovernance) external view returns (uint256 id);
  function freezeOperator(address _operator) external;
  function approveAvs(address _avsGovernance) external returns (uint256 id);
  function registerAvs(string memory _avsName) external;
  function isValidNumOfShares(address _operator, IAvsGovernance.StrategyShares[] calldata _minSharesPerStrategyList) external view returns (bool);
  function getVotingPower(address _operator, IAvsGovernance.StrategyMultiplier[] calldata _strategyMultipliers) external view returns (uint256);
  function getDefaultStrategies(uint _chainid) external pure returns (address[] memory);
}