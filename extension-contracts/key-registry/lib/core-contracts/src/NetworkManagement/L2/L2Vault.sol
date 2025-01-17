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

contract L2Vault is Vault  {
    
    function setAttestationCenter(address _attestationCenter) external onlyRole(RolesLibrary.AVS_FACTORY_ROLE) {
        _getStorage().ownerVault = _attestationCenter;
        _grantRole(RolesLibrary.ATTESTATION_CENTER, _attestationCenter);
    }

    function withdrawRewards(address _operator, uint256 _lastPayedTask, uint256 _feeToClaim) external nonReentrant onlyRole(RolesLibrary.ATTESTATION_CENTER) returns (bool _success) {
        return super._withdrawRewards(_operator, _lastPayedTask, _feeToClaim);
    }

    function getAttestationCenter() external view returns (address attestationCenter) {
        return _getStorage().ownerVault;
    }
}
