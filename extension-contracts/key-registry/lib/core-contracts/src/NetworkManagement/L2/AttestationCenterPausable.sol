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
import "@othentic/NetworkManagement/Common/PausableFlows.sol";


contract AttestationCenterPausable is PausableFlows {

    // INITIALIZER
function __AttestationCenterPausable_init(address _avsGovernanceMultisigOwner, address _operationsMultisig, address _communityMultisig) internal onlyInitializing {
        __AccessControl_init();
        _grantAttestationCenterRoles(_avsGovernanceMultisigOwner, _operationsMultisig, _communityMultisig);
        renounceRole(DEFAULT_ADMIN_ROLE, address(msg.sender));
    }

    function _grantAttestationCenterRoles(address _avsGovernanceMultisigOwner, address _operationsMultisig, address _communityMultisig) private {
        _getPausableFlowsStorage().flowsPauseStates[PauserRolesLibrary.PAYMENT_REQUEST_FLOW] = true;
        _getPausableFlowsStorage().flowsPauseStates[PauserRolesLibrary.BATCH_PAYMENT_REQUEST_FLOW] = true;

        _grantRole(PauserRolesLibrary.PAYMENT_REQUEST_FLOW, _avsGovernanceMultisigOwner);
        _grantRole(PauserRolesLibrary.PAYMENT_REQUEST_FLOW, _operationsMultisig);
        
        _grantRole(PauserRolesLibrary.BATCH_PAYMENT_REQUEST_FLOW, _avsGovernanceMultisigOwner);
        _grantRole(PauserRolesLibrary.BATCH_PAYMENT_REQUEST_FLOW, _operationsMultisig);
        
        _grantRole(PauserRolesLibrary.SET_AVS_LOGIC_FLOW, _avsGovernanceMultisigOwner);
        _grantRole(PauserRolesLibrary.SET_AVS_LOGIC_FLOW, _communityMultisig);
        _grantRole(PauserRolesLibrary.SET_AVS_LOGIC_FLOW, _operationsMultisig);

        _grantRole(PauserRolesLibrary.CREATE_NEW_TASK_DEFINITION_FLOW, _avsGovernanceMultisigOwner);
        _grantRole(PauserRolesLibrary.CREATE_NEW_TASK_DEFINITION_FLOW, _operationsMultisig);
        _grantRole(PauserRolesLibrary.CREATE_NEW_TASK_DEFINITION_FLOW, _communityMultisig);
        
        _grantRole(PauserRolesLibrary.TASKS_SUBMISSION_FLOW, _avsGovernanceMultisigOwner);
        _grantRole(PauserRolesLibrary.TASKS_SUBMISSION_FLOW, _operationsMultisig);
        _grantRole(PauserRolesLibrary.TASKS_SUBMISSION_FLOW, _communityMultisig);
    } 
}
