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
import "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

import "@othentic/NetworkManagement/Common/interfaces/IOBLS.sol";
import "@othentic/NetworkManagement/Common/interfaces/IMessageHandler.sol";
import "@othentic/NetworkManagement/Common/OthenticAccessControl.sol";

import "@othentic/NetworkManagement/L2/interfaces/IAttestationCenter.sol";
import "@othentic/NetworkManagement/L2/interfaces/IAvsLogic.sol";
import "@othentic/NetworkManagement/L2/interfaces/IBeforePaymentsLogic.sol";
import "@othentic/NetworkManagement/L2/interfaces/IFeeCalculator.sol";
import "@othentic/NetworkManagement/L2/TaskDefinitionLibrary.sol";
import "@othentic/NetworkManagement/L2/AttestationCenterStorage.sol";
import "@othentic/NetworkManagement/L2/AttestationCenterPausable.sol";

import { ReentrancyGuardUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/utils/ReentrancyGuardUpgradeable.sol";
import { MessagesLibrary } from "@othentic/NetworkManagement/Common/MessagesLibrary.sol";
import { RolesLibrary } from "@othentic/NetworkManagement/Common/RolesLibrary.sol";
import { PauserRolesLibrary } from "@othentic/NetworkManagement/Common/PauserRolesLibrary.sol";
import { BLSAuthLibrary } from "@othentic/NetworkManagement/Common/BLSAuthLibrary.sol";

/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
contract AttestationCenter is IAttestationCenter, AttestationCenterPausable, ReentrancyGuardUpgradeable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    using TaskDefinitionLibrary for TaskDefinitions;

    bytes32 private constant DOMAIN = keccak256("TasksManager");

    // INITIALIZER
    function initialize(address _avsGovernanceMultisigOwner, address _operationsMultisig, address _communityMultisig, address _messageHandler, address _obls, address _vault, bool _isRewardsOnL2) initializer public {
        _initialize(_avsGovernanceMultisigOwner, _operationsMultisig, _communityMultisig, _messageHandler, _obls, _vault, _isRewardsOnL2);
    }
     
    function _initialize(address _avsGovernanceMultisigOwner, address _operationsMultisig, address _communityMultisig, address _messageHandler, address _obls, address _vault, bool _isRewardsOnL2) internal onlyInitializing {
        require(_vault != address(0), "AttestationCenter: Invalid input");
        __OthenticAccessControl_init(_avsGovernanceMultisigOwner, _operationsMultisig, _communityMultisig);
        __AttestationCenterPausable_init(_avsGovernanceMultisigOwner, _operationsMultisig, _communityMultisig);
        __ReentrancyGuard_init();
        AttestationCenterStorageData storage _sd = _getStorage();
        _sd.numOfTotalOperators = 0;
        _sd.taskNumber = 1;
        _sd.baseRewardFee = 10 ** 19;
        _sd.obls = IOBLS(_obls);
        _sd.messageHandler = IMessageHandler(_messageHandler);
        _sd.isRewardsOnL2 = _isRewardsOnL2;
        _sd.vault = IVault(_vault);
        _grantRole(RolesLibrary.MESSAGE_HANDLER, _messageHandler);
    }
    
    // ------------------ Operators Interface ------------------

    // @obsolete - use submit task with struct
    // @dev - after this function is removed, memory can be converted to calldata
    function submitTask(TaskInfo calldata _taskInfo, bool _isApproved, bytes calldata _tpSignature, uint256[2] calldata _taSignature, uint256[] calldata _attestersIds) external whenFlowNotPaused(PauserRolesLibrary.TASKS_SUBMISSION_FLOW) nonReentrant {
        TaskSubmissionDetails memory _taskSubmissionDetails = TaskSubmissionDetails(_isApproved, _tpSignature, _taSignature, _attestersIds);
        _submitTask(_taskInfo, _taskSubmissionDetails); 
    }

    function submitTask(TaskInfo calldata _taskInfo, TaskSubmissionDetails calldata _taskSubmissionDetails) external whenFlowNotPaused(PauserRolesLibrary.TASKS_SUBMISSION_FLOW) nonReentrant {
        _submitTask(_taskInfo, _taskSubmissionDetails); 
    }

    function updateBlsKey(uint256[4] calldata _blsKey, BLSAuthLibrary.Signature calldata _authSignature) external {
        AttestationCenterStorageData storage _sd = _getStorage();
        address _operator = msg.sender;
        uint256 _operatorId = _getOperatorId(_sd, _operator);
        IOBLS _obls = _sd.obls;
        _obls.verifyAuthSignature(_authSignature, _operator, address(this), _blsKey);
        _obls.modifyOperatorBlsKey(_operatorId, _blsKey);
        emit OperatorBlsKeyUpdated(_operator, _blsKey);
    }

    function obls() external view returns (IOBLS) {
        return _getStorage().obls;
    }

    function vault() external view returns (address) {
        return address(_getStorage().vault);
    }

    function votingPower(address _operator) external view returns (uint256) {
        AttestationCenterStorageData storage _sd = _getStorage();
        uint256 _operatorId = _getOperatorId(_sd, _operator);
        return _sd.obls.votingPower(_operatorId);
    }

    function operatorsIdsByAddress(address _operator) external view returns (uint256) {
        return _getOperatorId(_getStorage(), _operator);
    }

    function taskNumber() external view returns (uint32) {
        return _getStorage().taskNumber;
    }

    function avsLogic() external view returns (IAvsLogic) {
        return _getStorage().avsLogic;
    }

    function beforePaymentsLogic() external view returns (IBeforePaymentsLogic) {
        return _getStorage().beforePaymentsLogic;
    }

    function baseRewardFee() external view returns (uint256) {
        return _getStorage().baseRewardFee;
    }

    //@obsolete - use numOfActiveOperators - not used in the cli
    function numOfOperators() external view returns (uint256) {
        return _getStorage().numOfActiveOperators;
    }

    function numOfActiveOperators() external view returns (uint256) {
        return _getStorage().numOfActiveOperators;
    }

    function getOperatorPaymentDetail(uint256 _operatorId) external view returns (PaymentDetails memory) {
        return _getStorage().operators[_operatorId];
    }

    function getTaskDefinitionMinimumVotingPower(uint16 _taskDefinitionId) external view returns (uint256) {
        return _getStorage().taskDefinitions.getMinimumVotingPower(_taskDefinitionId);
    }

    function getTaskDefinitionRestrictedOperators(uint16 _taskDefinitionId) external view returns (uint256[] memory) {
        return _getStorage().taskDefinitions.getRestrictedOperatorIndexes(_taskDefinitionId);
    }

    function numOfTaskDefinitions() external view returns (uint16) {
        return _getStorage().taskDefinitions.counter;
    }

    /// @dev Including unregistered operators
    function numOfTotalOperators() external view returns (uint256) {
        return _getStorage().numOfTotalOperators;
    }

    function requestPayment(uint256 _operatorId) external whenFlowNotPaused(PauserRolesLibrary.PAYMENT_REQUEST_FLOW) nonReentrant {
        AttestationCenterStorageData storage _sd = _getStorage();
        PaymentDetails storage _details = _sd.operators[_operatorId];
        uint32 _taskNumber = _sd.taskNumber;
        IBeforePaymentsLogic _beforePaymentsLogic = _sd.beforePaymentsLogic;
        if (address(_beforePaymentsLogic) != address(0)) {
            _beforePaymentsLogic.beforePaymentRequest(_operatorId, _details, _taskNumber);
        }
        if (_details.operator != msg.sender) revert InvalidOperatorId();
        _commitPayment(_details, _taskNumber);
        uint256 _feeToClaim = _details.feeToClaim;
        if(_sd.isRewardsOnL2) {
            _withdrawL2Rewards(_sd, _details, _taskNumber, _sd.vault);
        } else {
            _triggerL1PaymentRequest(_sd, msg.sender, _feeToClaim);
        }
        emit PaymentRequested(msg.sender, _taskNumber, _feeToClaim);    
    }

    // ------------------ Layer 1 Interface ------------------

    function registerToNetwork(address _operator, uint256 _votingPower, uint256[4] memory _blsKey, address _rewardsReceiver) external onlyRole(RolesLibrary.MESSAGE_HANDLER) {
        AttestationCenterStorageData storage _sd = _getStorage();
        uint256 _operatorIndex = ++_sd.numOfTotalOperators;
        ++_sd.numOfActiveOperators;
        _sd.operators[_operatorIndex] = _createNewOperatorRecord(_operator);
        _sd.operatorsIdsByAddress[_operator] = _operatorIndex;
        _sd.rewardsReceiver[_operator] = _rewardsReceiver;
        _sd.obls.registerOperator(_operatorIndex, _votingPower, _blsKey);
        emit OperatorRegisteredToNetwork(_operator, _votingPower);
    }

    function unRegisterOperatorFromNetwork(address _operator) external onlyRole(RolesLibrary.MESSAGE_HANDLER) {
        AttestationCenterStorageData storage _sd = _getStorage();
        IOBLS _obls = _sd.obls;
        uint256 _operatorId = _getOperatorId(_sd, _operator);
        delete _sd.operatorsIdsByAddress[_operator];
        --_sd.numOfActiveOperators;
        _obls.unRegisterOperator(_operatorId);
        emit OperatorUnregisteredFromNetwork(_operatorId);
    }

    function clearPayment(address _operator, uint256 _lastPaidTaskNumber, uint256 _amountClaimed) external onlyRole(RolesLibrary.MESSAGE_HANDLER) {
        _clearPayment(_getStorage(), _operator, _lastPaidTaskNumber, _amountClaimed);
    }

    function _clearPayment(AttestationCenterStorageData storage _sd, address _operator, uint256 _lastPaidTaskNumber, uint256 _amountClaimed) internal {
        uint256 _operatorId = _getOperatorId(_sd, _operator);
        PaymentDetails storage _details = _sd.operators[_operatorId];
        _redeemPayment(_details, _lastPaidTaskNumber, _amountClaimed);
    }

    function clearBatchPayment(PaymentRequestMessage[] memory _operators, uint256 _paidTaskNumber) external onlyRole(RolesLibrary.MESSAGE_HANDLER) {
        AttestationCenterStorageData storage _sd = _getStorage();
        for(uint i=0; i < _operators.length && _operators[i].operator != address(0); i++){
            PaymentRequestMessage memory _paymentRequestMessage = _operators[i];
            uint256 _operatorId = _sd.operatorsIdsByAddress[_paymentRequestMessage.operator];
            _redeemPayment(_sd.operators[_operatorId], _paidTaskNumber, _paymentRequestMessage.feeToClaim);
        }
    }

    // ------------------ Avs Governance Interface ------------------

    function requestBatchPayment() external whenFlowNotPaused(PauserRolesLibrary.BATCH_PAYMENT_REQUEST_FLOW) onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        AttestationCenterStorageData storage _sd = _getStorage();
        _requestBatchPayment(_sd, 1, _sd.numOfTotalOperators);
    }

    function requestBatchPayment(uint _from, uint _to) external whenFlowNotPaused(PauserRolesLibrary.BATCH_PAYMENT_REQUEST_FLOW) onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _requestBatchPayment(_getStorage(), _from, _to);
    }

    function setAvsLogic(IAvsLogic _avsLogic) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) whenFlowNotPaused(PauserRolesLibrary.SET_AVS_LOGIC_FLOW) {
        _getStorage().avsLogic = _avsLogic;
        emit SetAvsLogic(address(_avsLogic));
    }

    function setBeforePaymentsLogic(IBeforePaymentsLogic _beforePaymentsLogic) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) whenFlowNotPaused(PauserRolesLibrary.SET_AVS_LOGIC_FLOW) {
        _getStorage().beforePaymentsLogic = _beforePaymentsLogic;
        emit SetBeforePaymentsLogic(address(_beforePaymentsLogic));
    }

    function setFeeCalculator(IFeeCalculator _feeCalculator) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) whenFlowNotPaused(PauserRolesLibrary.SET_AVS_LOGIC_FLOW) {
        _getStorage().feeCalculator = _feeCalculator;
        emit SetFeeCalculator(address(_feeCalculator)); 
    }

    function transferAvsGovernanceMultisig(address _newAvsGovernanceMultisig) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _revokeRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG, msg.sender);
        _grantRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG, _newAvsGovernanceMultisig);
        emit SetAvsGovernanceMultisig(_newAvsGovernanceMultisig);
    }

    function createNewTaskDefinition(string memory _name, TaskDefinitionParams calldata _taskDefinitionParams) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) whenFlowNotPaused(PauserRolesLibrary.CREATE_NEW_TASK_DEFINITION_FLOW) returns (uint16 _id) {
        AttestationCenterStorageData storage _sd = _getStorage();
        uint256 _numOfTotalOperators = _sd.numOfTotalOperators;
        _id = _sd.taskDefinitions.createNewTaskDefinition(_name, _taskDefinitionParams);
        if(_taskDefinitionParams.restrictedOperatorIndexes.length > 0) {
             if (!_isSorted(_taskDefinitionParams.restrictedOperatorIndexes)) revert InvalidRestrictedOperatorIndexes();       
           _sd.obls.setTotalVotingPowerPerRestrictedTaskDefinition(_id, _taskDefinitionParams.minimumVotingPower, _taskDefinitionParams.restrictedOperatorIndexes);
        } else if(_taskDefinitionParams.minimumVotingPower > 0) {
           _sd.obls.setTotalVotingPowerPerTaskDefinition(_id, _numOfTotalOperators, _taskDefinitionParams.minimumVotingPower);
        }
    }

    function setTaskDefinitionMinVotingPower(uint16 _taskDefinitionId, uint256 _minimumVotingPower) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) whenFlowNotPaused(PauserRolesLibrary.CREATE_NEW_TASK_DEFINITION_FLOW) {
        AttestationCenterStorageData storage _sd = _getStorage();
        TaskDefinition storage _taskDefinition = _getTaskDefinition(_sd, _taskDefinitionId);
        _taskDefinition.minimumVotingPower = _minimumVotingPower;
        _sd.obls.setTotalVotingPowerPerTaskDefinition(_taskDefinitionId, _sd.numOfTotalOperators, _minimumVotingPower);
        emit SetMinimumTaskDefinitionVotingPower(_minimumVotingPower);
    }

    function setTaskDefinitionRestrictedOperators(uint16 _taskDefinitionId, uint256[] calldata _restrictedOperatorIndexes) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) whenFlowNotPaused(PauserRolesLibrary.CREATE_NEW_TASK_DEFINITION_FLOW) {
        if (!_isSorted(_restrictedOperatorIndexes)) revert InvalidRestrictedOperatorIndexes();
        AttestationCenterStorageData storage _sd = _getStorage();
        TaskDefinition storage _taskDefinition = _getTaskDefinition(_sd, _taskDefinitionId);
        _taskDefinition.restrictedOperatorIndexes = _restrictedOperatorIndexes;
        _sd.obls.setTotalVotingPowerPerRestrictedTaskDefinition(_taskDefinitionId, _taskDefinition.minimumVotingPower, _restrictedOperatorIndexes);
        emit SetRestrictedOperator(_taskDefinitionId, _restrictedOperatorIndexes);
    }

    // ------------------ Operations Interface ------------------

    function setOblsSharesSyncer(address _oblsSharesSyncer) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _getStorage().obls.setOblsSharesSyncer(_oblsSharesSyncer);
    }

    function transferMessageHandler(address _newMessageHandler) external onlyRole(RolesLibrary.OPERATIONS_MULTISIG) {
        AttestationCenterStorageData storage _sd = _getStorage();
        _revokeRole(RolesLibrary.MESSAGE_HANDLER, address(_sd.messageHandler));
        _grantRole(RolesLibrary.MESSAGE_HANDLER, _newMessageHandler);
        _sd.messageHandler = IMessageHandler(_newMessageHandler);
        emit SetMessageHandler(_newMessageHandler);
    }

    // PRIVATE FUNCTIONS

    function _commitPayment(PaymentDetails storage _details, uint32 _taskNumber) internal {
        if (!_isWidthrawalAllowed(_details)) revert PaymentReedemed();
        if (!_isTaskUnpaid(_details, _taskNumber)) revert PaymentClaimed();
        if (!_isAnyFeeToClaim(_details)) revert InvalidPaymentClaim();
        _details.paymentStatus = PaymentStatus.COMMITTED;
    }

    function _submitTask(TaskInfo calldata _taskInfo, TaskSubmissionDetails memory _taskSubmissionDetails) internal {
        AttestationCenterStorageData storage _sd = _getStorage();
        IAvsLogic _avsLogic = _sd.avsLogic;
        bool _isAvsLogicSet = address(_avsLogic) != address(0);
        if (_isAvsLogicSet) {
            _avsLogic.beforeTaskSubmission(_taskInfo, _taskSubmissionDetails.isApproved, _taskSubmissionDetails.tpSignature, _taskSubmissionDetails.taSignature, _taskSubmissionDetails.attestersIds);
        } 
        bytes32 _taskHash = _hashTask(_taskInfo);
        if (_sd.signedTasks[_taskHash]) revert MessageAlreadySigned();
        _validatePerformerSignature(_taskInfo.taskPerformer, _taskHash, _taskSubmissionDetails.tpSignature);
        bytes32 _voteHash = _hashVote(_taskInfo, _taskSubmissionDetails.isApproved);
        IOBLS _obls = _sd.obls;
        uint256[2] memory _message =  _obls.hashToPoint(DOMAIN, abi.encode(_voteHash));
        TaskDefinition memory _taskDefinition;
        if (_taskInfo.taskDefinitionId > 0) { 
            _taskDefinition = _getTaskDefinition(_sd, _taskInfo.taskDefinitionId);
            if (_taskDefinition.blockExpiry <= block.number) revert InvalidTaskDefinition();
            if (_taskDefinition.restrictedOperatorIndexes.length > 0) _verifyRestrictedOperators(_taskDefinition, _taskSubmissionDetails.attestersIds);
        }
        _verifyAggregatedSignature(_obls, _taskSubmissionDetails.isApproved, _taskInfo.taskDefinitionId, _taskDefinition, _taskSubmissionDetails.taSignature, _taskSubmissionDetails.attestersIds, _message);
        _submitTaskBusinessLogic(_sd, _taskInfo, _taskDefinition, _taskSubmissionDetails.isApproved, _taskSubmissionDetails.attestersIds);
        _sd.signedTasks[_taskHash] = true;
        if (_isAvsLogicSet) {
            _avsLogic.afterTaskSubmission(_taskInfo, _taskSubmissionDetails.isApproved, _taskSubmissionDetails.tpSignature, _taskSubmissionDetails.taSignature, _taskSubmissionDetails.attestersIds);
        }
    }

    function _submitTaskBusinessLogic(AttestationCenterStorageData storage _sd, TaskInfo calldata _taskInfo, TaskDefinition memory _taskDefinition, bool _isApproved, uint256[] memory _attestersIds) private {
        uint32 _taskNumber = _sd.taskNumber;
        if (_isApproved) {
            emit TaskSubmitted(_taskInfo.taskPerformer, _taskNumber, _taskInfo.proofOfTask, _taskInfo.data,  _taskInfo.taskDefinitionId);
        } else {
            emit TaskRejected(_taskInfo.taskPerformer, _taskNumber, _taskInfo.proofOfTask, _taskInfo.data, _taskInfo.taskDefinitionId);
        }

        uint256 _taskPerformerId = _getOperatorId(_sd, _taskInfo.taskPerformer);
        uint256 _aggregatorId = _getOperatorId(_sd, msg.sender);
        IOBLS _obls = _sd.obls;
        if (!_obls.isActive(_taskPerformerId)) revert InactiveTaskPerformer();
        if (!_obls.isActive(_aggregatorId)) revert InactiveAggregator();
        IFeeCalculator.FeeCalculatorData memory _feeCalculatorData = IFeeCalculator.FeeCalculatorData(_taskInfo, _aggregatorId, _taskPerformerId, _attestersIds);

        IFeeCalculator _feeCalculator = _sd.feeCalculator;
        bool _isFeeCalculatorSet = address(_feeCalculator) != address(0);
        if (!_isFeeCalculatorSet || (_isFeeCalculatorSet && _feeCalculator.isBaseRewardFee())) {
            (uint256 _baseRewardFeeForAttesters,
            uint256 _baseRewardFeeForPerformer,
            uint256 _baseRewardFeeForAggregator) = _calculateBaseRewardFees(_sd, _taskInfo.taskDefinitionId, _taskDefinition, _feeCalculatorData);
            
            _accumulateRewardsForOperators(_sd, _baseRewardFeeForAttesters, _attestersIds, _taskNumber);
            _accumulateRewardsForOperator(_sd, _baseRewardFeeForPerformer, _taskPerformerId, _taskNumber);
            _accumulateRewardsForOperator(_sd, _baseRewardFeeForAggregator, _aggregatorId, _taskNumber);
        }
        else {
            IFeeCalculator.FeePerId[] memory _feesPerId = _feeCalculator.calculateFeesPerId(_feeCalculatorData);
            _accumulateRewardsForOperatorsById(_sd, _feesPerId, _taskNumber);
        }
        _sd.taskNumber++;
    }

    function _accumulateRewardsForOperatorsById(AttestationCenterStorageData storage _sd, IFeeCalculator.FeePerId[] memory _feesPerId, uint32 _taskNumber) private {
        for (uint256 i = 0; i < _feesPerId.length; i++) {
            uint256 _operatorId = _feesPerId[i].index;
            uint256 _feeToClaim = _feesPerId[i].fee;
            _accumulateRewardsForOperator(_sd, _feeToClaim, _operatorId, _taskNumber);
        }
    }

    function _calculateBaseRewardFees(AttestationCenterStorageData storage _sd, uint16 _taskDefinitionId, TaskDefinition memory _taskDefinition, IFeeCalculator.FeeCalculatorData memory _feeCalculatorData) private returns (uint256 _baseRewardFeeForAttesters, uint256 _baseRewardFeeForPerformer, uint256 _baseRewardFeeForAggregator) {
        IFeeCalculator _feeCalculator = _sd.feeCalculator;
        bool _isFeeCalculatorSet = address(_feeCalculator) != address(0);
        if(_isFeeCalculatorSet){
            (_baseRewardFeeForAttesters, _baseRewardFeeForPerformer, _baseRewardFeeForAggregator) = _feeCalculator.calculateBaseRewardFees(_feeCalculatorData);
        } else if (_taskDefinitionId > 0) { 
            _baseRewardFeeForAttesters = _taskDefinition.baseRewardFeeForAttesters;
            _baseRewardFeeForPerformer = _taskDefinition.baseRewardFeeForPerformer;
            _baseRewardFeeForAggregator = _taskDefinition.baseRewardFeeForAggregator;      
        } else { // default task definition
            uint256 _baseRewardFee = _sd.baseRewardFee;
            _baseRewardFeeForAttesters = _baseRewardFee;
            _baseRewardFeeForPerformer = _baseRewardFee;
            _baseRewardFeeForAggregator = _baseRewardFee;
        }
    }

    function _accumulateRewardsForOperators(AttestationCenterStorageData storage _sd, uint256 _baseRewardFeeForOperators, uint256[] memory _attestersIds, uint32 _taskNumber) private {
        for (uint256 i = 0; i < _attestersIds.length; i++) {
            _accumulateRewardsForOperator(_sd, _baseRewardFeeForOperators, _attestersIds[i], _taskNumber);
        }
    }

    function _accumulateRewardsForOperator(AttestationCenterStorageData storage _sd, uint256 _baseRewardFeeForOperator, uint256 _operatorId, uint32 _taskNumber) private {
        _sd.operators[_operatorId].feeToClaim += _baseRewardFeeForOperator;
        emit RewardAccumulated(_operatorId, _baseRewardFeeForOperator, _taskNumber);
    }

    function _triggerL1PaymentRequest(AttestationCenterStorageData storage _sd, address _operator, uint _feeToClaim) internal {
        bytes memory _paymentMessage = MessagesLibrary.BuildPaymentRequestMessage(_operator, _sd.taskNumber, _feeToClaim);
        _sd.messageHandler.sendMessage(_paymentMessage);
    }

    function _triggerL1BatchPaymentRequest(AttestationCenterStorageData storage _sd, PaymentRequestMessage[] memory _operators) internal {
        bytes memory _paymentMessage = MessagesLibrary.BuildBatchPaymentRequestMessage(abi.encode(_operators), _sd.taskNumber);
        _sd.messageHandler.sendMessage(_paymentMessage);
    }

    function _redeemPayment(PaymentDetails storage _details,  uint256 _paidTaskNumber, uint256 _amountClaimed) private {
        if(_isValidPaymentRequest(_details, _paidTaskNumber, _amountClaimed)){
            if(_amountClaimed > 0){
                _details.lastPaidTaskNumber = _paidTaskNumber;
                _details.feeToClaim -= _amountClaimed;
            }
            _details.paymentStatus = PaymentStatus.REDEEMED;
        }
        else {
            emit ClearPaymentRejected(_details.operator, _paidTaskNumber, _amountClaimed);
        }
    }

    function _withdrawL2Rewards(AttestationCenterStorageData storage _sd ,PaymentDetails storage _details, uint32 _taskNumber, IVault _l2Vault) private {
        address _tmpRewardsReceiver = _sd.rewardsReceiver[_details.operator];
        address _rewardsReceiver = _tmpRewardsReceiver == address(0) ? _details.operator : _tmpRewardsReceiver;
        bool _success = _l2Vault.withdrawRewards(_rewardsReceiver, _taskNumber, _details.feeToClaim);
        if(_success) _redeemPayment(_details, _taskNumber, _details.feeToClaim);       
    }

    function _requestBatchPayment(AttestationCenterStorageData storage _sd, uint _from, uint _to) internal {
        if (_from == 0 || _to > _sd.numOfTotalOperators || _from > _to) revert InvalidRangeForBatchPaymentRequest();
        uint32 _taskNumber = _sd.taskNumber;
        uint256 _numOfTotalOperators = _to - _from + 1;
        PaymentRequestMessage[] memory _operators  = new PaymentRequestMessage[](_numOfTotalOperators);
        uint256 _lastIndex = 0;
        bool _isRewardsOnL2 = _sd.isRewardsOnL2;
        IVault _l2Vault = _sd.vault;
        for(uint i = _from; i <= _to;){
            PaymentDetails storage _details = _sd.operators[i];
            if(_details.operator != address(0) && _isWidthrawalAllowed(_details) && _isTaskUnpaid(_details, _taskNumber) && _isAnyFeeToClaim(_details)){
                _operators[_lastIndex] = PaymentRequestMessage(_details.operator, _details.feeToClaim);
                _details.paymentStatus = PaymentStatus.COMMITTED;
                _lastIndex++;
                if(_isRewardsOnL2){
                    _withdrawL2Rewards(_sd, _details, _taskNumber, _l2Vault);
                }
            }
            unchecked {++i;}
        }
        if (_lastIndex == 0) revert InvalidOperatorsForPayment();
        if(!_isRewardsOnL2){
            _triggerL1BatchPaymentRequest(_sd, _operators);
        }
        emit PaymentsRequested(_operators, _taskNumber);
    }

    // PRIVATE VIEWS FUNCTIONS

    function _verifyAggregatedSignature(IOBLS _obls, bool _isApproved, uint16 _taskDefinitionId, TaskDefinition memory _taskDefinition, uint256[2] memory _signature, uint[] memory _attestersIds, uint256[2] memory _message) private view {
        uint _requriedVotingPower = _getRequriedVotingPowerByApprovalStatus(_obls, _isApproved, _taskDefinitionId, _taskDefinition);
        _obls.verifySignature(_message, _signature, _attestersIds, _requriedVotingPower, _taskDefinition.minimumVotingPower);
    }

    function _getOperatorId(AttestationCenterStorageData storage _sd, address _operatorAddress) private view returns (uint256) {
        uint256 _operatorId = _sd.operatorsIdsByAddress[_operatorAddress];
        if (_operatorId == 0) revert OperatorNotRegistered(_operatorAddress);
        return _operatorId;
    }

    function _getRequriedVotingPowerByApprovalStatus(IOBLS _obls, bool _isApproved, uint16 _taskDefinitionId, TaskDefinition memory _taskDefinition) private view returns (uint256) {
        uint256 _totalVotingPower;
        if (_taskDefinitionId > 0 && (_taskDefinition.restrictedOperatorIndexes.length > 0 || _taskDefinition.minimumVotingPower > 0)) {
            _totalVotingPower = _obls.totalVotingPowerPerTaskDefinition(_taskDefinitionId);
        } else {
            _totalVotingPower = _obls.totalVotingPower();
        }
        if (_isApproved) {
            return _totalVotingPower * 2 / 3;
        } else {
            return _totalVotingPower * 1 / 3;
        }
    }

    function _isWidthrawalAllowed(PaymentDetails storage _details) private view returns (bool) {
        return _details.paymentStatus == PaymentStatus.REDEEMED;
    }

    function _isTaskUnpaid(PaymentDetails storage _details, uint32 _taskNumber) private view returns (bool) {
        return _details.lastPaidTaskNumber < _taskNumber;
    }

    function _isAnyFeeToClaim(PaymentDetails storage _details) private view returns (bool) {
        return _details.feeToClaim > 0;
    }

    function _isValidPaymentRequest(PaymentDetails storage _details,  uint256 _paidTaskNumber, uint256 _amountClaimed) private view returns (bool) {
        if (_details.paymentStatus != PaymentStatus.COMMITTED) {
            return false;
        }
        if (_details.lastPaidTaskNumber >= _paidTaskNumber) {
            return false;
        }
        if (_details.feeToClaim < _amountClaimed) {
            return false;
        }
        return true;
    }

    function _getTaskDefinition(AttestationCenterStorageData storage _sd, uint16 _taskDefinitionId) private view returns (TaskDefinition storage) {
        if (_taskDefinitionId > _sd.taskDefinitions.counter) revert TaskDefinitionNotFound(_taskDefinitionId); 
        TaskDefinition storage _taskDefinition = _sd.taskDefinitions.getTaskDefinition(_taskDefinitionId);
        if (_taskDefinition.taskDefinitionId == 0) revert TaskDefinitionNotFound(_taskDefinitionId);
        return _taskDefinition;
    }
    
    // PRIVATE PURE FUNCTIONS 
    
    function _verifyRestrictedOperators(TaskDefinition memory _taskDefinition, uint256[] memory _attesterIndexes) private pure {
        uint256[] memory _restrictedOperatorIndexes = _taskDefinition.restrictedOperatorIndexes;
        if (_restrictedOperatorIndexes.length < _attesterIndexes.length) revert InvalidAttesterSet();
        uint256 _invalidIndex = _verifyArraySubset(_attesterIndexes, _restrictedOperatorIndexes);
        if (_invalidIndex > 0) revert InvalidRestrictedOperator(_taskDefinition.taskDefinitionId, _invalidIndex);
    }

    function _verifyArraySubset(uint256[] memory _arr1, uint256[] memory _arr2) private pure returns (uint256) {
        uint256 i = 0; 
        uint256 j = 0;
        while (i < _arr1.length && j < _arr2.length) {
            if (_arr1[i] == _arr2[j]) {
                i++;
                j++;
            } else if (_arr1[i] > _arr2[j]) {
                j++;
            } else {
                return _arr1[i];
            }
        }
        if (i == _arr1.length) {
            return 0;
        } else {
            return _arr1[i];
        }
    }

    function _isSorted(uint[] memory _arr) private pure returns (bool) {
        uint _len = _arr.length;
        if (_len <= 1) return true;
        unchecked {
            for (uint i = 0; i < _len - 1; i++) {
                if (_arr[i] >= _arr[i + 1]) return false;                       
            }
        }
        return true; 
    }

    function _validatePerformerSignature(address _taskPerformer, bytes32 _taskHash, bytes memory _tpSignature) private pure {
        address _recoveredPerformer = _taskHash.recover(_tpSignature);
        if (_recoveredPerformer != _taskPerformer) revert InvalidPerformerSignature();
    }

    function _createNewOperatorRecord(address _operator) private pure returns (PaymentDetails memory) {
        return PaymentDetails({
            operator: _operator,
            lastPaidTaskNumber: 0,
            feeToClaim: 0,
            paymentStatus: PaymentStatus.REDEEMED
        });
    }

    function _hashTask(TaskInfo calldata _taskInfo) private pure returns (bytes32) {
        return keccak256(abi.encode(_taskInfo.proofOfTask, _taskInfo.data, _taskInfo.taskPerformer, _taskInfo.taskDefinitionId));
    }

    function _hashVote(TaskInfo calldata _taskInfo, bool _isApproved) private view returns (bytes32) {
        return keccak256(abi.encode(_taskInfo.proofOfTask, _taskInfo.data, _taskInfo.taskPerformer, _taskInfo.taskDefinitionId, address(this), block.chainid, _isApproved));
    }

    function _getStorage() internal pure returns (AttestationCenterStorageData storage _sd) {
        return AttestationCenterStorage.load();
    }
}
