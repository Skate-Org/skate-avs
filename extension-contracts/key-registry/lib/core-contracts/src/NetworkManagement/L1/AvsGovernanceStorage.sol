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

import { IMessageHandler } from "@othentic/NetworkManagement/Common/interfaces/IMessageHandler.sol";
import { IVault } from "@othentic/NetworkManagement/Common/interfaces/IVault.sol";
import { IOthenticRegistry } from "@othentic/NetworkManagement/L1/interfaces/IOthenticRegistry.sol";
import { IAvsGovernanceLogic } from "@othentic/NetworkManagement/L1/interfaces/IAvsGovernanceLogic.sol";
import { IAVSDirectory } from "@eigenlayer/contracts/interfaces/IAVSDirectory.sol";
import { IAvsGovernance } from "@othentic/NetworkManagement/L1/interfaces/IAvsGovernance.sol";

struct AvsGovernanceStorageData {
    uint24 slashingRate;
    uint256 numOfActiveOperators;
    IMessageHandler messageHandler;
    IOthenticRegistry othenticRegistry;
    IVault vault;
    IAVSDirectory avsDirectoryContract;
    bool isAllowlisted;
    address allowlistSigner;
    mapping(address => uint256) isOperatorRegistered; // We are using uint256 for backwards compatibility
    IAvsGovernanceLogic avsGovernanceLogic;
    address[] strategies;
    string avsName;
    uint256 rewardsReceiverModificationDelay;
    mapping(address => bool) isRequestPaymentPaused;
    mapping(address => address) rewardsReceiver;
    mapping(address => IAvsGovernance.RewardsReceiverModificationDetails) rewardsReceiverModificationDetails;
    uint256 numOfOperatorsLimit;
    uint256 minVotingPower;
    uint256 maxEffectiveBalance;
    mapping(address => uint256) minSharesPerStrategy;
    mapping(address => uint256) multipliers;
    address avsGovernanceMultiplierSyncer;
    address blsAuthSingleton; 
}

library AvsGovernanceStorage {
    uint256 constant private STORAGE_POSITION = uint256(keccak256("storage.avs.governance")) - 1;

    function load() internal pure returns (AvsGovernanceStorageData storage sd) {
        uint256 position = STORAGE_POSITION;
        assembly {
            sd.slot := position
        }
    }
}