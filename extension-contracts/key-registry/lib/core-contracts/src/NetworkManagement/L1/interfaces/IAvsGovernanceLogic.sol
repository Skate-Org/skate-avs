// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.25;

/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 * @notice Depending on the application, it may be necessary to add reentrancy gaurds to hooks
 */
interface IAvsGovernanceLogic {
    function beforeOperatorRegistered(address _operator, uint256 _votingPower, uint256[4] calldata _blsKey, address _rewardsReceiver) external;
    function afterOperatorRegistered(address _operator, uint256 _votingPower, uint256[4] calldata _blsKey, address _rewardsReceiver) external;
    function beforeOperatorUnregistered(address _operator) external;
    function afterOperatorUnregistered(address _operator) external;
}