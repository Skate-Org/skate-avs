// SPDX-License-Identifier: BSL1.1
pragma solidity ^0.8.25;

import {DelegateKeyRegistryStorage} from "./DelegateKeyRegistryStorage.sol";
import {IDelegateKeyRegistry} from "./interfaces/IDelegateKeyRegistry.sol";
import {AccessControlUpgradeable} from "openzeppelin-contracts-upgradeable/contracts/access/AccessControlUpgradeable.sol";

// NOTE: Flows
// I/ Key registration
//  1. Operator select delegate key from available set OR request to create a new delegate key
//  2. Operator sign over that packed `DelegateKey` struct
//  3. Updater send update to the contract
//  4. Contract disperse updated key information to (related) Skate Gateway (Cross-chain messaging via Axelar/LZ)
// II/ Key removal
//  Similar to I/, operator sign a request to remove some specific key
// III/ 
contract DelegateKeyRegistry is AccessControlUpgradeable, IDelegateKeyRegistry {

}
