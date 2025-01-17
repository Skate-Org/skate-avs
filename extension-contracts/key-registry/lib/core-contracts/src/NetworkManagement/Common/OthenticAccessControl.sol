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

import {AccessControlUpgradeable} from "openzeppelin-contracts-upgradeable/contracts/access/AccessControlUpgradeable.sol";
import { RolesLibrary } from "@othentic/NetworkManagement/Common/RolesLibrary.sol";

/**
 * @author Othentic Labs LTD.
 */
abstract contract OthenticAccessControl is AccessControlUpgradeable {

    // INITIALIZER
    function __OthenticAccessControl_init(address _avsGovernanceMultisigOwner, address _operationsMultisig, address _communityMultisig) internal onlyInitializing {
        __AccessControl_init();
        _grantRole(RolesLibrary.OPERATIONS_MULTISIG, _operationsMultisig);
        _grantRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG, _avsGovernanceMultisigOwner);
        _grantRole(RolesLibrary.COMMUNITY_MULTISIG, _communityMultisig);
    }
     
}
