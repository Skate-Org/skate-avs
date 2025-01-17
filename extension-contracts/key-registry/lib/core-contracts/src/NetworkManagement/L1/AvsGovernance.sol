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

import { AccessControlUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/access/AccessControlUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/utils/ReentrancyGuardUpgradeable.sol";
import { IMessageHandler } from "@othentic/NetworkManagement/Common/interfaces/IMessageHandler.sol";
import { IAvsGovernance } from "@othentic/NetworkManagement/L1/interfaces/IAvsGovernance.sol";
import { IOthenticRegistry } from "@othentic/NetworkManagement/L1/interfaces/IOthenticRegistry.sol";
import { IVault } from "@othentic/NetworkManagement/Common/interfaces/IVault.sol";
import { AvsGovernancePausable } from "@othentic/NetworkManagement/L1/AvsGovernancePausable.sol";
import { ISignatureUtils } from "@eigenlayer/contracts/interfaces/ISignatureUtils.sol";
import { AvsGovernanceStorage, AvsGovernanceStorageData } from "@othentic/NetworkManagement/L1/AvsGovernanceStorage.sol";
import { IAvsGovernanceLogic } from "@othentic/NetworkManagement/L1/interfaces/IAvsGovernanceLogic.sol";
import { MessagesLibrary } from "@othentic/NetworkManagement/Common/MessagesLibrary.sol";
import { RolesLibrary } from "@othentic/NetworkManagement/Common/RolesLibrary.sol";
import { PauserRolesLibrary } from "@othentic/NetworkManagement/Common/PauserRolesLibrary.sol";
import { SignedAuthTokenLibrary } from "@othentic/NetworkManagement/Common/SignedAuthTokenLibrary.sol";
import { BLSAuthLibrary } from "@othentic/NetworkManagement/Common/BLSAuthLibrary.sol";
import { IBLSAuthSingleton } from "@othentic/NetworkManagement/Common/interfaces/IBLSAuthSingleton.sol";
import { IAVSDirectory } from "@eigenlayer/contracts/interfaces/IAVSDirectory.sol";

/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
contract AvsGovernance is IAvsGovernance, AvsGovernancePausable, ReentrancyGuardUpgradeable {
    using SignedAuthTokenLibrary for bytes;
    // MODIFIERS

    modifier onlyRegisteredOperator() {
        if (_getStorage().isOperatorRegistered[msg.sender] == 0) revert OperatorNotRegistered();
        _;
    }

    modifier onlyUnregisteredOperator() {
        if (_getStorage().isOperatorRegistered[msg.sender] != 0) revert OperatorAlreadyRegistered();
        _;
    }

    // EXTERNAL FUNCTIONS
    function initialize(InitializationParams calldata _initializationParams) public virtual initializer {
        _initialize(_initializationParams);
    }

    function _initialize(InitializationParams calldata _initializationParams) internal onlyInitializing {
        require(
                _initializationParams.avsGovernanceMultisigOwner != address(0) &&
                _initializationParams.operationsMultisig != address(0) &&
                _initializationParams.communityMultisig != address(0) &&
                _initializationParams.othenticRegistry != address(0) &&
                _initializationParams.messageHandler != address(0) &&
                _initializationParams.vault != address(0) &&
                _initializationParams.avsDirectoryContract != address(0) &&
                _initializationParams.allowlistSigner != address(0),
            "AvsGovernance: Invalid input"
        );
        address _avsGovernanceMultisigOwner = _initializationParams.avsGovernanceMultisigOwner;
        address _operationsMultisig = _initializationParams.operationsMultisig;
        address _communityMultisig = _initializationParams.communityMultisig;
        address _messageHandler = _initializationParams.messageHandler;
        string calldata _avsName = _initializationParams.avsName;
        IOthenticRegistry _othenticRegistry = IOthenticRegistry(_initializationParams.othenticRegistry);
        // [REMOVE_OTHENTIC_ACCESS_CONTROL] - replace with grant roles by permission rather than entity 
        __OthenticAccessControl_init(_avsGovernanceMultisigOwner, _operationsMultisig, _communityMultisig);
        __AvsGovernancePausable_init(_avsGovernanceMultisigOwner, _operationsMultisig, _communityMultisig);
        __ReentrancyGuard_init();
        AvsGovernanceStorageData storage _sd = _getStorage();
        _sd.othenticRegistry = _othenticRegistry;
        _sd.messageHandler = IMessageHandler(_messageHandler);
        _grantRole(RolesLibrary.MESSAGE_HANDLER, _messageHandler);
        _sd.vault = IVault(_initializationParams.vault);
        _sd.allowlistSigner = _initializationParams.allowlistSigner;
        _sd.rewardsReceiverModificationDelay = 7 days;
        _sd.avsDirectoryContract = IAVSDirectory(_initializationParams.avsDirectoryContract);
        _sd.numOfOperatorsLimit = 100;
        _sd.blsAuthSingleton = _initializationParams.blsAuthSingleton;
        _setAvsName(_sd, _avsName);
        _othenticRegistry.registerAvs(_avsName);
        _setSupportedStrategies(_sd, _getDefaultStrategies(_sd)); 
    }

    // -------------------- Operators Interface -------------------- //

    function registerAsAllowedOperator(
        uint256[4] calldata _blsKey, 
        bytes calldata _authToken, 
        address _rewardsReceiver,
        ISignatureUtils.SignatureWithSaltAndExpiry memory _operatorSignature,
        BLSAuthLibrary.Signature calldata _blsRegistrationSignature
    ) external onlyUnregisteredOperator whenFlowNotPaused(PauserRolesLibrary.REGISTRATION_FLOW) nonReentrant {
        AvsGovernanceStorageData storage _sd = _getStorage();
        if (!_sd.isAllowlisted) revert AllowlistDisabled();
        if (!_authToken.verifyAuthTokenForAddress(address(this), msg.sender, _sd.allowlistSigner)) revert InvalidAllowlistAuthToken();
        if (_rewardsReceiver == address(0)) revert InvalidRewardsReceiver();
        _setRewardsReceiver(_sd, _rewardsReceiver);
        _registerAsOperator(_sd, msg.sender, _blsKey, _blsRegistrationSignature, _rewardsReceiver);
        _sd.avsDirectoryContract.registerOperatorToAVS(msg.sender, _operatorSignature);
    }

    function registerAsOperator(
        uint256[4] calldata _blsKey, 
        address _rewardsReceiver,
        ISignatureUtils.SignatureWithSaltAndExpiry memory _operatorSignature,
        BLSAuthLibrary.Signature calldata _blsRegistrationSignature
    ) external onlyUnregisteredOperator whenFlowNotPaused(PauserRolesLibrary.REGISTRATION_FLOW) nonReentrant {
        AvsGovernanceStorageData storage _sd = _getStorage();
        if (_sd.isAllowlisted) revert AllowlistEnabled();
        if (_rewardsReceiver == address(0)) revert InvalidRewardsReceiver();
        _setRewardsReceiver(_sd, _rewardsReceiver);
        _registerAsOperator(_sd, msg.sender, _blsKey, _blsRegistrationSignature, _rewardsReceiver);
        _sd.avsDirectoryContract.registerOperatorToAVS(msg.sender, _operatorSignature);
    }

    function unregisterAsOperator() external onlyRegisteredOperator whenFlowNotPaused(PauserRolesLibrary.REGISTRATION_FLOW) nonReentrant {
        AvsGovernanceStorageData storage _sd = _getStorage();
        _unregisterAsOperator(msg.sender);
        _sd.avsDirectoryContract.deregisterOperatorFromAVS(msg.sender);
    }

    // only supported on L1 
    function queueRewardsReceiverModification(address _newRewardsReceiver) external onlyRegisteredOperator whenFlowNotPaused(PauserRolesLibrary.OPERATOR_SET_REWARDS_RECEIVER_FLOW) {
        if (_newRewardsReceiver == address(0)) revert InvalidRewardsReceiver();
        AvsGovernanceStorageData storage _sd = _getStorage();
        _sd.isRequestPaymentPaused[msg.sender] = true;
        uint256 _modificationDelay = block.timestamp + _sd.rewardsReceiverModificationDelay;
        _sd.rewardsReceiverModificationDetails[msg.sender] = RewardsReceiverModificationDetails(_newRewardsReceiver, _modificationDelay);
        emit QueuedRewardsReceiverModification(msg.sender, _newRewardsReceiver, _modificationDelay);
    }

    function completeRewardsReceiverModification() external onlyRegisteredOperator {
        AvsGovernanceStorageData storage _sd = _getStorage();
        if (block.timestamp < _sd.rewardsReceiverModificationDetails[msg.sender].modificationDelay) revert ModificationDelayNotPassed();
        _setRewardsReceiver(_sd, _sd.rewardsReceiverModificationDetails[msg.sender].newRewardsReceiver);
        _sd.isRequestPaymentPaused[msg.sender] = false;
        _sd.rewardsReceiverModificationDetails[msg.sender] = RewardsReceiverModificationDetails(address(0), 0); 
    }

    function getIsAllowlisted() external view returns (bool) {
        return _getStorage().isAllowlisted;
    }

    function getRewardsReceiver(address _operator) external view returns (address) {
        return _getStorage().rewardsReceiver[_operator];
    }

    function avsName() external view returns (string memory) {
        return _getStorage().avsName;
    }

    function vault() external view returns (address) {
        return address(_getStorage().vault);
    }

    function minSharesForStrategy(address _strategy) external view returns (uint256) {
        return _getStorage().minSharesPerStrategy[_strategy];
    }

    function minVotingPower() external view returns (uint256) {
      return _getStorage().minVotingPower;
    }

    function maxEffectiveBalance() external view returns (uint256) {
        return _getStorage().maxEffectiveBalance;
    }

    function strategies() external view returns (address[] memory) {
        return _getStorage().strategies;
    }

    function strategyMultiplier(address _strategy) external view returns (uint256) {
        return _getStorage().multipliers[_strategy];
    }

    function votingPower(address _operator) external view returns (uint256) {
        AvsGovernanceStorageData storage _sd = _getStorage();      
         (/*IAvsGovernance.StrategyShares[] memory _minSharesPerStrategyList*/,
         IAvsGovernance.StrategyMultiplier[] memory _strategyMultipliers) = _getListOfMinSharesPerStrategyAndMultipliers(_sd);       
        return _getVotingPower(_sd, _operator, _strategyMultipliers);
    }

    // -------------------- Layer 2 Interface -------------------- //

    /// @dev Can only be called by AttestationCenter::requestPayment using MessageHandler, pauseFlow protection is enforced on AttestationCenter.  
    function withdrawRewards(address _operator, uint256 _lastPayedTask, uint256 _feeToClaim) external onlyRole(RolesLibrary.MESSAGE_HANDLER)  {
        AvsGovernanceStorageData storage _sd = _getStorage();
        if(_sd.isRequestPaymentPaused[_operator]) {
            _triggerL2Clearance(_sd, _operator, _lastPayedTask, 0);
        } else {
            IVault _vault = _sd.vault;
            address _rewardsReceiver = _sd.rewardsReceiver[_operator];
            bool _success = _withdrawRewards(_operator, _rewardsReceiver, _lastPayedTask, _feeToClaim, _vault);
            if(!_success) _feeToClaim = 0;
            _triggerL2Clearance(_sd, _operator, _lastPayedTask, _feeToClaim);
        }
    }

    /// @dev Can only be called by AttestationCenter::requestPayment using MessageHandler, pauseFlow protection is enforced on AttestationCenter.  
    function withdrawBatchRewards(PaymentRequestMessage[] memory _operators, uint256 _lastPayedTask) external onlyRole(RolesLibrary.MESSAGE_HANDLER) {
        AvsGovernanceStorageData storage _sd = _getStorage();
        IVault _vault = _sd.vault;
        PaymentRequestMessage memory _paymentRequestMessage;
        for(uint256 i = 0; i<_operators.length; i++) {
            _paymentRequestMessage = _operators[i];
            address _operator = _paymentRequestMessage.operator;
            if(_operator == address(0)) break;
            address _rewardsReceiver = _sd.rewardsReceiver[_operator];
            bool _success = _withdrawRewards(_operator, _rewardsReceiver, _lastPayedTask, _paymentRequestMessage.feeToClaim, _vault);
            if(!_success) _operators[i].feeToClaim = 0;
        }
        _triggerL2BatchClearance(_sd, _operators, _lastPayedTask);
    }

    function isOperatorRegistered(address operator) external view returns (bool) {
        return _getStorage().isOperatorRegistered[operator] != 0;
    }

    function numOfActiveOperators() external view returns (uint256) {
        return _getStorage().numOfActiveOperators;
    }

    //@obsolete - need to use numOfActiveOperators
    function numOfOperators() external view returns (uint256){
        return _getStorage().numOfActiveOperators;
    }

    // -------------------- AvsGovernance Multisig Interface -------------------- //
   
    /// @inheritdoc IAvsGovernance
    function setNumOfOperatorsLimit(uint256 _newLimitOfNumOfOperators) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        AvsGovernanceStorageData storage _sd = _getStorage();
        uint256 _numOfActiveOperators = _sd.numOfActiveOperators;
        if (_numOfActiveOperators > _newLimitOfNumOfOperators) revert NumOfActiveOperatorsIsGreaterThanNumOfOperatorLimit(_numOfActiveOperators, _newLimitOfNumOfOperators);
        _sd.numOfOperatorsLimit = _newLimitOfNumOfOperators;
        emit SetNumOfOperatorsLimit(_newLimitOfNumOfOperators);
    }

    function depositERC20(uint256 _amount) external {
        _getStorage().vault.depositERC20(msg.sender, _amount);
    }

    function setAvsName(string calldata _avsName) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _setAvsName(_getStorage(), _avsName);
    }

    function setRewardsReceiverModificationDelay(uint256 _rewardsReceiverModificationDelay) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _getStorage().rewardsReceiverModificationDelay = _rewardsReceiverModificationDelay;
        emit SetRewardsReceiverModificationDelay(_rewardsReceiverModificationDelay);
    }
    
    function transferAvsGovernanceMultisig(address _newAvsGovernanceMultisig) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _revokeRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG, msg.sender);
        _grantRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG, _newAvsGovernanceMultisig);
        emit SetAvsGovernanceMultisig(_newAvsGovernanceMultisig);
    }

    function setIsAllowlisted(bool _isAllowlisted) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _getStorage().isAllowlisted = _isAllowlisted;
        emit SetIsAllowlisted(_isAllowlisted);
    }

    function setAvsGovernanceLogic(IAvsGovernanceLogic _avsGovernanceLogic) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) whenFlowNotPaused(PauserRolesLibrary.SET_AVS_LOGIC_FLOW) {
        _getStorage().avsGovernanceLogic = _avsGovernanceLogic;
        emit SetAvsGovernanceLogic(address(_avsGovernanceLogic));
    }

    function setAvsGovernanceMultiplierSyncer(address _newAvsGovernanceMultiplierSyncer) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {       
        AvsGovernanceStorageData storage _sd = _getStorage();
        _revokeRole(RolesLibrary.MULTIPLIER_SYNCER, _sd.avsGovernanceMultiplierSyncer);
        _grantRole(RolesLibrary.MULTIPLIER_SYNCER, _newAvsGovernanceMultiplierSyncer);
        _sd.avsGovernanceMultiplierSyncer = _newAvsGovernanceMultiplierSyncer;
        emit SetAvsGovernanceMultiplierSyncer(_newAvsGovernanceMultiplierSyncer);
    }

    function setSupportedStrategies(address[] calldata _strategies) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) whenFlowNotPaused(PauserRolesLibrary.SET_SUPPORTED_STRATEGIES_FLOW){
        _setSupportedStrategies(_getStorage(), _strategies);
    }

    function setMinVotingPower(uint256 _minVotingPower) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _getStorage().minVotingPower = _minVotingPower;
        emit MinVotingPowerSet(_minVotingPower);
    }

    function setMaxEffectiveBalance(uint256 _maxBalance) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _getStorage().maxEffectiveBalance = _maxBalance;
        emit MaxEffectiveBalanceSet(_maxBalance);
    }
    
    function setMinSharesForStrategy(address _strategy, uint256 _minShares) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        AvsGovernanceStorageData storage _sd = AvsGovernanceStorage.load();
        bool _strategyFound = false;
        for (uint256 i = 0; i < _sd.strategies.length; i++) {
            if (_sd.strategies[i] == _strategy) {
                _strategyFound = true;
                break;
            }
        }
        if (!_strategyFound) revert InvalidStrategy(); 
        _sd.minSharesPerStrategy[_strategy] =  _minShares;
        emit MinSharesPerStrategySet(_strategy, _minShares);
    }

    // -------------------- Operations Multisig Interface -------------------- //

    function transferMessageHandler(address _newMessageHandler) external onlyRole(RolesLibrary.OPERATIONS_MULTISIG) {       
        AvsGovernanceStorageData storage _sd = _getStorage();
        _revokeRole(RolesLibrary.MESSAGE_HANDLER, address(_sd.messageHandler));
        _grantRole(RolesLibrary.MESSAGE_HANDLER, _newMessageHandler);
        _sd.messageHandler = IMessageHandler(_newMessageHandler);
        emit SetMessageHandler(_newMessageHandler);
    }

    function setOthenticRegistry(IOthenticRegistry _othenticRegistry) external onlyRole(RolesLibrary.OPERATIONS_MULTISIG) {
        _getStorage().othenticRegistry = _othenticRegistry;
        emit SetOthenticRegistry(address(_othenticRegistry));
    }

    function setAllowlistSigner(address _allowlistSigner) external onlyRole(RolesLibrary.OPERATIONS_MULTISIG) {
        _getStorage().allowlistSigner = _allowlistSigner;
        emit SetAllowlistSigner(_allowlistSigner);
    }

    function setBLSAuthSingleton(address _blsAuthSingleton) external onlyRole(RolesLibrary.OPERATIONS_MULTISIG) {
        _getStorage().blsAuthSingleton = _blsAuthSingleton;
        emit BLSAuthSingletonSet(_blsAuthSingleton); 
    }

    // -------------------- Avs Governance Multiplier Syncer Interface -------------------- /// 
    
    function setStrategyMultiplier(StrategyMultiplier calldata _strategyMultiplier) external onlyRole(RolesLibrary.MULTIPLIER_SYNCER) {
        _setStrategyMultiplier(_getStorage(), _strategyMultiplier);
    }

    function setStrategyMultiplierBatch(StrategyMultiplier[] calldata _strategyMultipliers) external onlyRole(RolesLibrary.MULTIPLIER_SYNCER) {
        AvsGovernanceStorageData storage _sd = _getStorage();
        for(uint i = 0; i < _strategyMultipliers.length; i++) {
            _setStrategyMultiplier(_sd, _strategyMultipliers[i]);
        }
    }

    // -------------------- IServiceManager Interface -------------------- //

    function updateAVSMetadataURI(string calldata metadataURI) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _getStorage().avsDirectoryContract.updateAVSMetadataURI(metadataURI);
    } 

    function getDefaultStrategies() external view returns (address[] memory) {
        return _getDefaultStrategies(_getStorage());
    }

    function getOperatorRestakedStrategies(address _operator) external view returns (address[] memory) {
        AvsGovernanceStorageData storage _sd = _getStorage();      
        return _sd.othenticRegistry.getOperatorRestakedStrategies(_operator, _sd.strategies);
    }

    function getNumOfOperatorsLimit() external view returns (uint256 numOfOperatorsLimitView) {
        return _getStorage().numOfOperatorsLimit;
    }
    
    // @obsolete - use votingPower instead
    function numOfShares(address _operator) external view returns (uint256) {
        AvsGovernanceStorageData storage _sd = _getStorage();      
        return _sd.othenticRegistry.getOperatorShares(_operator, _sd.strategies);
    }

    function getRestakeableStrategies() external view returns (address[] memory) {
        return _getStorage().strategies;
    }

    function avsDirectory() external view returns (address) {
        return address(_getStorage().avsDirectoryContract);
    }

    // =============================================================== //

    // INTERNAL FUNCTIONS

    function _getStorage() internal pure returns (AvsGovernanceStorageData storage _sd) {
        return AvsGovernanceStorage.load();
    }

    function _getListOfMinSharesPerStrategyAndMultipliers(AvsGovernanceStorageData storage _sd) internal view returns (IAvsGovernance.StrategyShares[] memory, IAvsGovernance.StrategyMultiplier[] memory) {
        address[] memory _strategies = _sd.strategies;
        IAvsGovernance.StrategyShares[] memory _minSharesPerStrategyList = new IAvsGovernance.StrategyShares[](_strategies.length); 
        IAvsGovernance.StrategyMultiplier[] memory _strategyMultipliers = new IAvsGovernance.StrategyMultiplier[](_strategies.length); 

        for (uint256 i = 0; i < _strategies.length;) {
            address _strategy = _strategies[i];      
            _minSharesPerStrategyList[i] = IAvsGovernance.StrategyShares(_strategy, _sd.minSharesPerStrategy[_strategy]);
            uint256 _multiplier = _sd.multipliers[_strategy];
            if (_multiplier == 0) {
                _multiplier = 1;
            }
            _strategyMultipliers[i] = IAvsGovernance.StrategyMultiplier(_strategy, _multiplier);
            unchecked {++i;}
        }
        return (_minSharesPerStrategyList, _strategyMultipliers);
    }

    function _registerAsOperator(AvsGovernanceStorageData storage _sd, address _operator, uint256[4] calldata _blsKey, BLSAuthLibrary.Signature memory _blsRegistrationSignature, address _rewardsReceiver) internal {
        uint256 _numOfOperatorsLimit = _sd.numOfOperatorsLimit;
        if (_sd.numOfActiveOperators >= _numOfOperatorsLimit) revert NumOfOperatorsLimitReached(_numOfOperatorsLimit);
        if (!IBLSAuthSingleton(_sd.blsAuthSingleton).isValidSignature(_blsRegistrationSignature, _operator, address(this), _blsKey)) revert InvalidBlsRegistrationSignature();

        IAvsGovernanceLogic _avsGovernanceLogic = _sd.avsGovernanceLogic;
        bool _isAvsGovernanceLogicSet = address(_avsGovernanceLogic) != address(0);
        (IAvsGovernance.StrategyShares[] memory _minSharesPerStrategyList,
         IAvsGovernance.StrategyMultiplier[] memory _strategyMultipliers) = _getListOfMinSharesPerStrategyAndMultipliers(_sd);
        uint256 _votingPower = _getVotingPower(_sd, _operator, _strategyMultipliers);

        {
            bool _isActive = (_votingPower >= _sd.minVotingPower) && _sd.othenticRegistry.isValidNumOfShares(_operator, _minSharesPerStrategyList);
            if (!_isActive) revert NotEnoughVotingPower();
            if (_isAvsGovernanceLogicSet) {
                _avsGovernanceLogic.beforeOperatorRegistered(_operator, _votingPower, _blsKey, _rewardsReceiver);
            }
            _triggerL2OperatorRegistration(_sd, _operator, _votingPower, _blsKey, _rewardsReceiver);
            ++_sd.numOfActiveOperators;
            _sd.isOperatorRegistered[_operator] = 1;
        }

        if (_isAvsGovernanceLogicSet) {
            _avsGovernanceLogic.afterOperatorRegistered(_operator, _votingPower, _blsKey, _rewardsReceiver);
        }
        emit OperatorRegistered(_operator, _blsKey);
    }

    function _unregisterAsOperator(address _operator) internal {
        AvsGovernanceStorageData storage _sd = _getStorage();
        IAvsGovernanceLogic _avsGovernanceLogic = _sd.avsGovernanceLogic;
        bool _isAvsGovernanceLogicSet = address(_avsGovernanceLogic) != address(0);
        if (_isAvsGovernanceLogicSet) {
            _avsGovernanceLogic.beforeOperatorUnregistered(_operator);
        }

        _triggerL2Unregister(_sd, _operator);
        --_sd.numOfActiveOperators;
        _sd.isOperatorRegistered[_operator] = 0;

        if (_isAvsGovernanceLogicSet) {
            _avsGovernanceLogic.afterOperatorUnregistered(_operator);
        }
        emit OperatorUnregistered(_operator);
    }

    function _triggerL2OperatorRegistration(AvsGovernanceStorageData storage _sd, address _operator, uint256 _votingPower, uint256[4] calldata _blsKey, address _rewardsReceiver) internal {
        bytes memory _registerOperatorMessage = MessagesLibrary.BuildRegisterOperatorMessage(_operator, _votingPower, _blsKey, _rewardsReceiver);
        _sd.messageHandler.sendMessage(_registerOperatorMessage);
    }

    function _triggerL2Unregister(AvsGovernanceStorageData storage _sd, address _operator) internal {
        bytes memory _unRegisterMessage = MessagesLibrary.BuildUnregisterRequestMessage(_operator);
       _sd.messageHandler.sendMessage(_unRegisterMessage);
    }

    function _triggerL2Clearance(AvsGovernanceStorageData storage _sd, address _operator, uint256 _lastPayedTask, uint256 _feeToClaim) internal {
        bytes memory _clearMessage = MessagesLibrary.BuildClearRequestMessage(_operator, _lastPayedTask, _feeToClaim);
        _sd.messageHandler.sendMessage(_clearMessage);
    }

    function _triggerL2BatchClearance(AvsGovernanceStorageData storage _sd, PaymentRequestMessage[] memory _operators, uint256 _lastPayedTask) internal {
        bytes memory _clearMessage = MessagesLibrary.BuildBatchClearRequestMessage(abi.encode(_operators), _lastPayedTask);
        _sd.messageHandler.sendMessage(_clearMessage);
    }

    function _setSupportedStrategies(AvsGovernanceStorageData storage _sd, address[] memory _strategies) internal {
        delete _sd.strategies;
        for (uint256 i = 0; i < _strategies.length;) {
            address _strategy = _strategies[i];
            if (_strategy == address(0)) revert InvalidStrategy();
            _sd.strategies.push(_strategy);
            unchecked {
                ++i;
            }
        }
        emit SetSupportedStrategies(_strategies);
    }

    // PRIVATE FUNCTIONS

    function _getVotingPower(AvsGovernanceStorageData storage _sd, address _operator, IAvsGovernance.StrategyMultiplier[] memory _strategyMultipliers) private view returns (uint256) {
        uint256 _maxEffBalance = _sd.maxEffectiveBalance;
        uint256 _votingPower = _sd.othenticRegistry.getVotingPower(_operator, _strategyMultipliers);
        if (_votingPower > _maxEffBalance && _maxEffBalance > 0) {
            _votingPower = _maxEffBalance;
        }
        return _votingPower;
    }

    function _getDefaultStrategies(AvsGovernanceStorageData storage _sd) private view returns (address[] memory) {
        return _sd.othenticRegistry.getDefaultStrategies(block.chainid);
    }

    function _withdrawRewards(address _operator, address _rewardsReceiver, uint256 _lastPayedTask, uint256 _feeToClaim, IVault _vault) private returns (bool _success) {
        if(_rewardsReceiver != address(0)) {
            _success = _vault.withdrawRewards(_rewardsReceiver, _lastPayedTask, _feeToClaim);
        } else {
            ///TODO: This is temporary and all existing operator must set a rewards receiver address.
            _success = _vault.withdrawRewards(_operator, _lastPayedTask, _feeToClaim);
        }
    }

    function _setStrategyMultiplier(AvsGovernanceStorageData storage _sd, StrategyMultiplier calldata _strategyMultiplier) private {
        _sd.multipliers[_strategyMultiplier.strategy] = _strategyMultiplier.multiplier;
        emit SetStrategyMultiplier(_strategyMultiplier.strategy, _strategyMultiplier.multiplier);
    }

    function _setRewardsReceiver(AvsGovernanceStorageData storage _sd, address _rewardsReceiver) private {
        _sd.rewardsReceiver[msg.sender] = _rewardsReceiver;
        emit SetRewardsReceiver(msg.sender, _rewardsReceiver);
    }

    function _setAvsName(AvsGovernanceStorageData storage _sd, string calldata _avsName) private {
        _sd.avsName = _avsName;
        emit SetAvsName(_avsName);
    }
}
