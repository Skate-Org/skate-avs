// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.25;

library Roles {
    bytes4 internal constant UPDATER = bytes4(keccak256("skate.avs.delegate.key.registry.updater"));
}
