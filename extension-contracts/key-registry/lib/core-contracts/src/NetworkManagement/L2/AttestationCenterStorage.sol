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

import "@othentic/NetworkManagement/Common/interfaces/IOBLS.sol";
import "@othentic/NetworkManagement/Common/interfaces/IMessageHandler.sol";
import "@othentic/NetworkManagement/L2/interfaces/IAvsLogic.sol";
import "@othentic/NetworkManagement/L2/interfaces/IBeforePaymentsLogic.sol";
import "@othentic/NetworkManagement/L2/TaskDefinitionLibrary.sol";
import "@othentic/NetworkManagement/L2/interfaces/IAttestationCenter.sol";
import "@othentic/NetworkManagement/L2/interfaces/IFeeCalculator.sol";
import "@othentic/NetworkManagement/Common/interfaces/IVault.sol";

struct AttestationCenterStorageData {

    uint32 taskNumber;
    uint256 baseRewardFee; //default reward fee for attesters
    uint256 numOfTotalOperators;
    IOBLS obls;
    IMessageHandler messageHandler;
    IAvsLogic avsLogic; 
    TaskDefinitions taskDefinitions;
    mapping(bytes32 => bool) signedTasks;
    mapping(address => uint256) operatorsIdsByAddress; 
    mapping(uint256 => IAttestationCenter.PaymentDetails) operators; 
    uint256 numOfActiveOperators;
    IFeeCalculator feeCalculator;
    mapping(address => address) rewardsReceiver;
    bool isRewardsOnL2;
    IVault vault;
    IBeforePaymentsLogic beforePaymentsLogic;
}

library AttestationCenterStorage {
    uint256 constant private STORAGE_POSITION = uint256(keccak256("storage.attestation.center")) - 1;

    function load() internal pure returns (AttestationCenterStorageData storage sd) {
        uint256 position = STORAGE_POSITION;
        assembly {
            sd.slot := position
        }
    }
}