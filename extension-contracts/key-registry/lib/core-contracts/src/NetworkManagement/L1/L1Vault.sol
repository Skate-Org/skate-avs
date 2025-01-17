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

import "openzeppelin-contracts-upgradeable/contracts/access/AccessControlUpgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";
import {ReentrancyGuardUpgradeable} from "openzeppelin-contracts-upgradeable/contracts/utils/ReentrancyGuardUpgradeable.sol";
import "@othentic/NetworkManagement/Common/VaultStorage.sol";
import {Vault} from "@othentic/NetworkManagement/Common/Vault.sol";
import "@othentic/NetworkManagement/Common/RolesLibrary.sol";
/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */

contract L1Vault is Vault {
    
    function setAvsGovernance(address _avsGovernance) external onlyRole(RolesLibrary.AVS_FACTORY_ROLE) {
        _getStorage().ownerVault = _avsGovernance;
        _grantRole(RolesLibrary.AVS_GOVERNANCE, _avsGovernance);
    }
    
    function withdrawRewards(address _operator, uint256 _lastPayedTask, uint256 _feeToClaim) external nonReentrant onlyRole(RolesLibrary.AVS_GOVERNANCE) returns (bool _success) {
        return super._withdrawRewards(_operator, _lastPayedTask, _feeToClaim);
    }

    function getAvsGovernance() external view returns (address avsGovernance) {
        return _getStorage().ownerVault;
    }
}
