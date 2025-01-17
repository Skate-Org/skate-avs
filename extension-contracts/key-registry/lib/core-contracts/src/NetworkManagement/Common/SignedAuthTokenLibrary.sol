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

import { ECDSA } from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

library SignedAuthTokenLibrary {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    function verifyAuthTokenForAddress(bytes memory _authToken, address _avsGovernanceAddress, address _address, address _signer) internal pure returns (bool) {
        return getAddress(_avsGovernanceAddress, _address, _authToken) == _signer;
    }

    function _hash(address _avsGovernanceAddress,address _address) internal pure returns (bytes32) {
        return keccak256(abi.encode(_avsGovernanceAddress, _address));
    }

    function _recover(bytes32 hash, bytes memory token) internal pure returns (address) {
        return hash.toEthSignedMessageHash().recover(token);
    }

    function getAddress(address _avsGovernanceAddress, address _address, bytes memory _authToken) internal pure returns (address) {
        return _recover(_hash(_avsGovernanceAddress, _address), _authToken);
    }
}
