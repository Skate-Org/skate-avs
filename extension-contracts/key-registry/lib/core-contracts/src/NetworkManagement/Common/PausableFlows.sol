// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.25;
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
 */

import "openzeppelin-contracts-upgradeable/contracts/access/AccessControlUpgradeable.sol";
import "@othentic/NetworkManagement/Common/PauserRolesLibrary.sol";
import "@othentic/NetworkManagement/Common/RolesLibrary.sol";
import "@othentic/NetworkManagement/Common/interfaces/IPausableFlows.sol";
import "@othentic/NetworkManagement/Common/PausableFlowsStorage.sol";

abstract contract PausableFlows is IPausableFlows, AccessControlUpgradeable {
    
    // MODIFIERS
    
    modifier whenFlowNotPaused(bytes4 _pausableFlow) {
        _revertIfFlowPaused(_pausableFlow);
        _;
    }

    modifier whenFlowPaused(bytes4 _pausableFlow) {
        _revertIfFlowUnpaused(_pausableFlow);
        _;
    }

    function __OthenticAccessControl_init(address _avsGovernanceMultisigOwner, address _operationsMultisig, address _communityMultisig) internal onlyInitializing {
        _grantRole(RolesLibrary.OPERATIONS_MULTISIG, _operationsMultisig);
        _grantRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG, _avsGovernanceMultisigOwner);
        _grantRole(RolesLibrary.COMMUNITY_MULTISIG, _communityMultisig);
    }


    // EXTERNAL FUNCTIONS

    function isFlowPaused(bytes4 _pausableFlow) external view returns (bool _isPaused) {
        return _getPausableFlowsStorage().flowsPauseStates[_pausableFlow];
    }

    function pause(bytes4 _pausableFlow) external whenFlowNotPaused(_pausableFlow) onlyRole(_pausableFlow){
        _pause(_pausableFlow);
    }

    function unpause(bytes4 _pausableFlow) external whenFlowPaused(_pausableFlow) onlyRole(_pausableFlow) {
        _unpause(_pausableFlow);
    }

    // INTERNAL FUNCTIONS 
    
    function _pause(bytes4 _pausableFlow) internal {
      PausableFlowsStorageData storage _sd = _getPausableFlowsStorage();
      if (_sd.flowsPauseStates[_pausableFlow]) revert PauseFlowIsAlreadyPaused();

      _sd.flowsPauseStates[_pausableFlow] = true;
      emit FlowPaused(_pausableFlow, msg.sender);
    }

    function _unpause(bytes4 _pausableFlow) internal  {
      PausableFlowsStorageData storage _sd = _getPausableFlowsStorage();
      if (!_sd.flowsPauseStates[_pausableFlow]) revert UnpausingFlowIsAlreadyUnpaused();

      _sd.flowsPauseStates[_pausableFlow] = false;
      emit FlowUnpaused(_pausableFlow, msg.sender);
    }

    function _revertIfFlowPaused(bytes4 _pausableFlow) internal view {
        if (_getPausableFlowsStorage().flowsPauseStates[_pausableFlow]) revert FlowIsCurrentlyPaused();
    }

    function _revertIfFlowUnpaused(bytes4 _pausableFlow) internal view {
        if (!_getPausableFlowsStorage().flowsPauseStates[_pausableFlow]) revert FlowIsCurrentlyUnpaused();
    }

    function _getPausableFlowsStorage() internal pure returns (PausableFlowsStorageData storage _sd) {
        return PausableFlowsStorage.load();
    }

}
