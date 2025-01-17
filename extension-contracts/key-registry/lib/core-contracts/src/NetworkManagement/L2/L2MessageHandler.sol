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
import "@othentic/NetworkManagement/L2/interfaces/IAttestationCenter.sol";
import "@othentic/NetworkManagement/L2/interfaces/IL2MessageHandler.sol";
import "@othentic/NetworkManagement/L2/L2MessageHandlerStorage.sol";

import { MessagesLibrary } from "@othentic/NetworkManagement/Common/MessagesLibrary.sol";

/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
contract L2MessageHandler is MessageHandler, IL2MessageHandler {

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

    // EXTERNAL FUNCTIONS
    function sendMessage(bytes memory _payload) external onlyRole(RolesLibrary.ATTESTATION_CENTER) {
        _lzSendMessage(_payload);
    }

    function setAttestationCenter(address _attestationCenter) external onlyRole(RolesLibrary.AVS_FACTORY_ROLE) {
        _getL2MessageHandlerStorage().attestationCenter = IAttestationCenter(_attestationCenter);
        _grantRole(RolesLibrary.ATTESTATION_CENTER, _attestationCenter);
        emit SetAttestationCenter(_attestationCenter);
    }

    function getAttestationCenter() external view returns (address) {
        return address(_getL2MessageHandlerStorage().attestationCenter);
    }

    // -------------------- Operations Multisig Interface -------------------- //
    function transferAttestationCenter(address _newAttestationCenter) external onlyRole(RolesLibrary.OPERATIONS_MULTISIG) {
        L2MessageHandlerStorageData storage _sd = _getL2MessageHandlerStorage();
        _revokeRole(RolesLibrary.ATTESTATION_CENTER, address(_sd.attestationCenter));
        _grantRole(RolesLibrary.ATTESTATION_CENTER, _newAttestationCenter);
        _sd.attestationCenter = IAttestationCenter(_newAttestationCenter);
        emit SetAttestationCenter(_newAttestationCenter);
    }

    // INTERNAL FUNCTIONS

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
        if (_sig == MessagesLibrary.REGISTER_SIG) {
            _handleRegisterOperatorMessage(_body);
        } else if (_sig == MessagesLibrary.CLEAR_SIG) {
            _handlePaymentSuccessMessage(_body);
        } else if (_sig == MessagesLibrary.BATCH_CLEAR_SIG) {
            _handleBatchPaymentSuccessMessage(_body);
        } else if (_sig == MessagesLibrary.UNREGISTER_SIG) {
            _handleUnregisterOperatorMessage(_body);
        } else {
            revert("L2MessageHandler: Unknown message signature");
        }    
    }

    function _handleRegisterOperatorMessage(bytes memory _message) internal {
        (address _operator, uint256 _votingPower, uint256[4] memory _blsKey, address _rewardsReceiver) = MessagesLibrary.ParseRegisterToAvsMessage(_message);
        _getL2MessageHandlerStorage().attestationCenter.registerToNetwork(_operator, _votingPower, _blsKey, _rewardsReceiver);
    }

    function _handlePaymentSuccessMessage(bytes memory _message) internal {
        (address _operator, uint256 _lastPaidTaskNumber, uint256 _amountClaimed) = MessagesLibrary.ParsePaymentSuccessMessage(_message);
        _getL2MessageHandlerStorage().attestationCenter.clearPayment(_operator, _lastPaidTaskNumber, _amountClaimed);
    }

    function _handleBatchPaymentSuccessMessage(bytes memory _message) internal {
        (bytes memory _operatorsBytes, uint256 _lastPaidTasksNumber) = MessagesLibrary.ParseBatchPaymentSuccessMessage(_message);
        IAttestationCenter.PaymentRequestMessage[] memory _operators = abi.decode(_operatorsBytes, (IAttestationCenter.PaymentRequestMessage[]));
         _getL2MessageHandlerStorage().attestationCenter.clearBatchPayment(_operators, _lastPaidTasksNumber);
    }

    function _handleUnregisterOperatorMessage(bytes memory _message) internal {
        (address _operator) = MessagesLibrary.ParseUnregisterOperatorMessage(_message);
        _getL2MessageHandlerStorage().attestationCenter.unRegisterOperatorFromNetwork(_operator);
    }

    function _getL2MessageHandlerStorage() internal pure returns (L2MessageHandlerStorageData storage sd) {
        return L2MessageHandlerStorage.load();
    }
}
