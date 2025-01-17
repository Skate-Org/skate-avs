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
import { ISignatureUtils } from "@eigenlayer/contracts/interfaces/ISignatureUtils.sol";
import { BLSAuthLibrary } from "@othentic/NetworkManagement/Common/BLSAuthLibrary.sol";
import { IAccessControl } from "openzeppelin-contracts/contracts/access/IAccessControl.sol";
/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
interface IAvsGovernance is IAccessControl {

    struct StrategyMultiplier {
      address strategy;
      uint256 multiplier;
    }

    struct StrategyShares {
      address strategy;
      uint256 shares;
    }

    struct Operator {
        uint256[4] blsKey;
        uint256 numOfShares;
        bool isAllowlisted;
        bool isActive;
    }

    struct PaymentRequestMessage {
        address operator;
        uint256 feeToClaim;
    }

    struct RewardsReceiverModificationDetails {
        address newRewardsReceiver;
        uint256 modificationDelay;
    }

    struct InitializationParams {
        address avsGovernanceMultisigOwner;
        address operationsMultisig;
        address communityMultisig;
        address othenticRegistry;
        address messageHandler;
        address vault;
        address avsDirectoryContract;
        address allowlistSigner;
        string avsName;
        address blsAuthSingleton; 
    }

    event SetToken(address token);
    event SetRewardsReceiverModificationDelay(uint256 modificationDelay);
    event SetAvsGovernanceLogic(address avsGovernanceLogic);
    event SetAvsGovernanceMultisig(address newAvsGovernanceMultisig);
    event SetIsAllowlisted(bool isAllowlisted);
    event SetMessageHandler(address newMessageHandler);
    event SetOthenticRegistry(address othenticRegistry);
    event SetAllowlistSigner(address allowlistSigner);
    event SetSupportedStrategies(address[] strategies);
    event SetAvsName(string avsName);
    event QueuedRewardsReceiverModification(address operator, address receiver, uint256 delay);
    event SetRewardsReceiver(address operator, address receiver);
    event OperatorRegistered(address indexed operator, uint256[4] blsKey);
    event OperatorUnregistered(address operator);
    event SetAvsGovernanceMultiplierSyncer(address avsGovernanceMultiplierSyncer);
    event SetStrategyMultiplier(address strategy, uint256 multiplier);
    event MinVotingPowerSet(uint256 minVotingPower);
    event MinSharesPerStrategySet(address strategy, uint256 minShares); 
    event MaxEffectiveBalanceSet(uint256 maxEffectiveBalance);
    event BLSAuthSingletonSet(address blsAuthSingleton);
    
    /**
     * @dev Emitted when numOfOperatorsLimit is updated.
     * @notice Number of operators limit can not be set below the number of active operators.
     * @param newLimitOfNumOfOperators The updated number of oprators limit.
     */
    event SetNumOfOperatorsLimit(uint256 newLimitOfNumOfOperators);

    error Unauthorized(string message);
    /** @notice Number of operators limit can not be set below the number of active operators.
     *  @dev Restricted use to AVS_GOVERNANCE_MULTISIG role.
     *  @param numOfOperatorsLimit Current number of operators limit.
     *  @param numOfActiveOperators (Can not be set below the number of active operators).
     */
    error NumOfActiveOperatorsIsGreaterThanNumOfOperatorLimit(uint256 numOfOperatorsLimit, uint256 numOfActiveOperators);
    /** Operator Number is has reached the defined limit. Consider contacting the AVS admin to increase the limit.
     *  @param numOfOperatorsLimit Number of operators limit (AvsGovernanceStorageData.numOfOperatorsLimit).
     */
    error NumOfOperatorsLimitReached(uint256 numOfOperatorsLimit);
    error OperatorNotRegistered();
    error OperatorAlreadyRegistered();
    error InvalidBlsRegistrationSignature();
    error InvalidRewardsReceiver();
    error AllowlistDisabled();
    error AllowlistEnabled();
    error InvalidAllowlistAuthToken();
    error ModificationDelayNotPassed();
    error InvalidSlashingRate();
    error InvalidStrategy();
    error AccessControlInvalidMultiplierSyncer();
    error InvalidMultiplierNotSet();
    error NotEnoughVotingPower();

    function isOperatorRegistered(address operator) external view returns (bool);
    function numOfActiveOperators() external view returns (uint256);

    //@obsolete - need to use numOfActiveOperators
    function numOfOperators() external view returns (uint256);
    /**
     * @dev Increases the limit of number of operators of the AVS.
     * @dev Restricted use to AVS_GOVERNANCE_MULTISIG role.
     * @notice Number of operators limit can not be set below the number of active operators.
     * @param newLimitOfNumOfOperators Updated number of operators limit.
     */
    function setNumOfOperatorsLimit(uint256 newLimitOfNumOfOperators) external;
    function avsName() external view returns (string memory);
    function vault() external view returns (address);
    function getIsAllowlisted() external view returns (bool);
    function getRewardsReceiver(address operator) external view returns (address);
    function strategies() external view returns (address[] memory);
    function strategyMultiplier(address _strategy) external view returns (uint256);
    function registerAsOperator(uint256[4] calldata _blsKey, address _rewardsReceiver, ISignatureUtils.SignatureWithSaltAndExpiry memory _operatorSignature, BLSAuthLibrary.Signature calldata _blsRegistrationSignature) external;
    function registerAsAllowedOperator(uint256[4] calldata _blsKey, bytes calldata _authToken, address _rewardsReceiver, ISignatureUtils.SignatureWithSaltAndExpiry memory _operatorSignature, BLSAuthLibrary.Signature calldata _blsRegistrationSignature) external;
    function queueRewardsReceiverModification(address _rewardsReceiver) external;
    function completeRewardsReceiverModification() external;
    function withdrawRewards(address _operator, uint256 _lastPayedTask, uint256 _feeToClaim) external;
    function withdrawBatchRewards(PaymentRequestMessage[] memory _operators, uint256 _lastPayedTask) external;
    function transferAvsGovernanceMultisig(address _newAvsGovernanceMultisig) external;
    // @obsolete - use votingPower
    function numOfShares(address _operator) external view returns (uint256);
    function votingPower(address _operator) external view returns (uint256);
    function getDefaultStrategies() external view returns (address[] memory);
    function getNumOfOperatorsLimit() external view returns (uint256 numOfOperatorsLimitView);
    function setMinSharesForStrategy(address _strategy, uint256 _minNumOfShares) external;
    // IServiceManager interface
    function updateAVSMetadataURI(string memory _metadataURI) external;
    function getOperatorRestakedStrategies(address operator) external view returns (address[] memory);
    function getRestakeableStrategies() external view returns (address[] memory);
    function avsDirectory() external view returns (address);
}