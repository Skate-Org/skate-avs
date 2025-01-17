// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.19;
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


import "@othentic/NetworkManagement/Common/MessageHandler.sol";
import "@othentic/NetworkManagement/L1/interfaces/IAvsGovernance.sol";
import "@othentic/NetworkManagement/L1/interfaces/IL1MessageHandler.sol";
import "@othentic/NetworkManagement/L1/L1MessageHandlerStorage.sol";

import { MessagesLibrary } from "@othentic/NetworkManagement/Common/MessagesLibrary.sol";
import "@othentic/NetworkManagement/Common/RolesLibrary.sol";
/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
contract L1MessageHandler is MessageHandler, IL1MessageHandler {

    // INITIALIZER
    function initialize(
        address _avsGovernanceMultisigOwner,
        address _operationsMultisig,
        address _communityMultisig,
        address _lzEndpoint,
        uint32 _lzEid
    ) public initializer {
        _initialize(
            _avsGovernanceMultisigOwner,
            _operationsMultisig,
            _communityMultisig,
            _lzEndpoint,
            _lzEid
        );
    }

    function setAvsGovernance(address _avsGovernance) external onlyRole(RolesLibrary.AVS_FACTORY_ROLE) {
        _getL1MessageHandlerStorage().avsGovernance = IAvsGovernance(_avsGovernance);
        _grantRole(RolesLibrary.AVS_GOVERNANCE, _avsGovernance);
        emit SetAvsGovernance(_avsGovernance);
    }

    // -------------------- Operations Multisig Interface -------------------- //

    function transferAvsGovernance(address _newAvsGovernance) external onlyRole(RolesLibrary.OPERATIONS_MULTISIG) { 
        L1MessageHandlerStorageData storage _sd = _getL1MessageHandlerStorage();            
        _revokeRole(RolesLibrary.AVS_GOVERNANCE, address(_sd.avsGovernance));
        _grantRole(RolesLibrary.AVS_GOVERNANCE, _newAvsGovernance);
        _sd.avsGovernance = IAvsGovernance(_newAvsGovernance);
        emit SetAvsGovernance(_newAvsGovernance);
    }

    // -------------------- Avs Governance Interface -------------------- //

    function sendMessage(bytes memory _message) external onlyRole(RolesLibrary.AVS_GOVERNANCE) {
        _lzSendMessage(_message);
    }

    /**
    * @dev Internal function to implement lzReceive logic without needing to copy the basic parameter validation.
    */
    function _lzReceive(
        Origin calldata /* _origin */,
        bytes32 /* _guid */,
        bytes calldata _message,
        address /* _executor */,
        bytes calldata /* _extraData */
    ) override internal virtual {
        (bytes4 _sig, bytes memory _body) = _payloadToSig(_message);
        if (_sig == MessagesLibrary.PAYMENT_SIG) {
            _handlePaymentRequestMessage(_body);
        } else if (_sig == MessagesLibrary.BATCH_PAYMENT_SIG) {
            _handleBatchPaymentRequestMessage(_body);
        } else {
            revert("L1MessageHandler: Unknown message signature");
        }
    }

    function _handlePaymentRequestMessage(bytes memory _message) internal {
        (address _operator, uint256 _lastPayedTask, uint256 _feeToClaim) = MessagesLibrary.ParsePaymentRequestMessage(_message);
        emit PaymentRequested(_operator, _lastPayedTask, _feeToClaim);
        _getL1MessageHandlerStorage().avsGovernance.withdrawRewards(_operator, _lastPayedTask, _feeToClaim);
    }

    function _handleBatchPaymentRequestMessage(bytes memory _message) internal {
        (bytes memory _operatorsBytes, uint256 _lastPayedTask) = MessagesLibrary.ParseBatchPaymentRequestMessage(_message);
        IAvsGovernance.PaymentRequestMessage[] memory _operators = abi.decode(_operatorsBytes, (IAvsGovernance.PaymentRequestMessage[]));
        emit PaymentsRequested(_operators, _lastPayedTask);
        _getL1MessageHandlerStorage().avsGovernance.withdrawBatchRewards(_operators, _lastPayedTask);
    }

    function _getL1MessageHandlerStorage() internal pure returns (L1MessageHandlerStorageData storage sd) {
        return L1MessageHandlerStorage.load();
    }
}
