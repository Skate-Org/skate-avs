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

import "@othentic/NetworkManagement/Common/PauserRolesLibrary.sol";
import "@othentic/NetworkManagement/Common/RolesLibrary.sol";
import "@othentic/NetworkManagement/Common/PausableFlows.sol";

contract AvsGovernancePausable is PausableFlows {
    
    // INITIALIZER
    function __AvsGovernancePausable_init(address _avsGovernanceMultisigOwner, address _operationsMultisig, address _communityMultisig) internal onlyInitializing {
        __AccessControl_init();
        _grantAvsGovernanceRoles(_avsGovernanceMultisigOwner, _operationsMultisig, _communityMultisig);
        renounceRole(DEFAULT_ADMIN_ROLE, address(msg.sender));
    }

    function _grantAvsGovernanceRoles(address _avsGovernanceMultisigOwner, address _operationsMultisig, address _communityMultisig) private {
        _grantRole(PauserRolesLibrary.REGISTRATION_FLOW, _avsGovernanceMultisigOwner);
        _grantRole(PauserRolesLibrary.REGISTRATION_FLOW, _operationsMultisig);
        _grantRole(PauserRolesLibrary.REGISTRATION_FLOW, _communityMultisig);
        _grantRole(PauserRolesLibrary.OPERATOR_SET_REWARDS_RECEIVER_FLOW, _avsGovernanceMultisigOwner);
        _grantRole(PauserRolesLibrary.OPERATOR_SET_REWARDS_RECEIVER_FLOW, _operationsMultisig);
        _grantRole(PauserRolesLibrary.SET_SUPPORTED_STRATEGIES_FLOW, _avsGovernanceMultisigOwner);
        _grantRole(PauserRolesLibrary.SET_SUPPORTED_STRATEGIES_FLOW, _operationsMultisig);
        _grantRole(PauserRolesLibrary.SET_SUPPORTED_STRATEGIES_FLOW, _communityMultisig);
        _grantRole(PauserRolesLibrary.SET_AVS_LOGIC_FLOW, _avsGovernanceMultisigOwner);
        _grantRole(PauserRolesLibrary.SET_AVS_LOGIC_FLOW, _communityMultisig);
        _grantRole(PauserRolesLibrary.SET_AVS_LOGIC_FLOW, _operationsMultisig);
    } 
}
