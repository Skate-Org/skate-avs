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
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 * @notice Depending on the application, it may be necessary to add reentrancy gaurds to hooks
 */
 
import { IAttestationCenter } from "@othentic/NetworkManagement/L2/interfaces/IAttestationCenter.sol";

interface IFeeCalculator {

    struct FeeCalculatorData {
        IAttestationCenter.TaskInfo data;
        uint256 aggregatorId;
        uint256 performerId;
        uint256[] attestersIds;
    }

    struct FeePerId {
        uint256 index;
        uint256 fee;
    }

    function calculateBaseRewardFees(FeeCalculatorData calldata _feeCalculatorData) external returns (uint256 baseRewardFeeForAttesters, uint256 baseRewardFeeForAggregator, uint256 baseRewardFeeForPerformer);
    function calculateFeesPerId(FeeCalculatorData calldata _feeCalculatorData) external returns (FeePerId[] memory feesPerId);
    function isBaseRewardFee() external pure returns (bool);
}