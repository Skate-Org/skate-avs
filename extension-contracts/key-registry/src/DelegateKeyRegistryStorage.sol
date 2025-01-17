// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.25;
import {IAttestationCenter} from "@othentic-core/interfaces/IAttestationCenter.sol";

struct Target {
    uint256 vmType;
    uint256 chainId;
}

struct DelegateKey {
    bytes publicKey; // can be any standard, e.g. ECDSA, ED25519, etc.
    address delegator; // must be an operator on Skate AVS, can be the key owner themselves
    uint256 votingPower;
}

struct DelegateKeyStorageData {
    IAttestationCenter attestationCenter;
    // Mapping to index taskDefinitionID <-> target chain
    mapping(uint16 => Target) targetChainByTaskDefinitionId;
    mapping(uint256 => mapping(uint256 => uint16)) taskDefinitionIdByTargetChain; // vmType => chainId => TaskDefinitionId
    // Mapping to manage delegate keys
    mapping(uint16 => mapping(address => DelegateKey)) delegateKeysMap; // taskDefinitionId => operator => DelegateKey
    mapping(uint16 => uint256) totalVotingPowerByTaskDefinitionId;
}

library DelegateKeyRegistryStorage {
    uint256 private constant STORAGE_POSITION =
        uint256(keccak256("skate.avs.delegate.key.registry")) - 1;

    function load() internal pure returns (DelegateKeyStorageData storage sd) {
        uint256 position = STORAGE_POSITION;
        assembly {
            sd.slot := position
        }
    }
}
