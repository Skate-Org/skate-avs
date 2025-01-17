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

import { ILayerZeroEndpointV2 } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";
import { OptionsBuilder } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/libs/OptionsBuilder.sol";
import { MessageHandlerStorageData } from "@othentic/lz/v2/oapp/MessageHandlerStorage.sol";
import "@othentic/NetworkManagement/Common/interfaces/IMessageHandler.sol";
import "@othentic/NetworkManagement/Common/RolesLibrary.sol";
import "@othentic/NetworkManagement/Common/OthenticAccessControl.sol";
import "@othentic/lz/v2/oapp/OApp.sol";
/**
 * @author Othentic Labs LTD.
 */
abstract contract MessageHandler is OApp, OthenticAccessControl, IMessageHandler {
    using OptionsBuilder for bytes;
    uint128 constant LZ_GAS_LIMIT = 800_000;

    function _initialize(
        address _avsGovernanceMultisigOwner,
        address _operationsMultisig,
        address _communityMultisig,
        address _lzEndpoint,
        uint32 _lzEid
    ) internal virtual onlyInitializing {
        __OthenticAccessControl_init(_avsGovernanceMultisigOwner, _operationsMultisig, _communityMultisig);
        MessageHandlerStorageData storage _storage = _getStorage();
        super._initialize(_storage, _lzEndpoint, _avsGovernanceMultisigOwner);
        _storage.lzEid = _lzEid;
        _storage.lzGasLimit = LZ_GAS_LIMIT;
        _storage.lzOptions = OptionsBuilder
            .newOptions()
            .addExecutorLzReceiveOption({ _gas: LZ_GAS_LIMIT, _value: _storage.lzMsgValue });
        _storage.operationsMultisig = _operationsMultisig;
        _storage.communityMultisig = _communityMultisig;
        _grantRole(RolesLibrary.LZ_RETRY_ROLE, _operationsMultisig);
        _grantRole(RolesLibrary.LZ_RETRY_ROLE, _avsGovernanceMultisigOwner);
        _grantRole(RolesLibrary.AVS_FACTORY_ROLE, msg.sender);
    }

    function deposit() external payable {}

    function withdraw() external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        (bool os, ) = payable(address(msg.sender)).call{value: address(this).balance}('');
        require(os);
    }

    function setLzReceiveParams(uint128 _gasLimit,uint128 _msgValue) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        MessageHandlerStorageData storage _storage = _getStorage();
        _storage.lzGasLimit = _gasLimit;
        _storage.lzMsgValue = _msgValue;
    }

    function nilify(uint64 _nonce) external onlyRole(RolesLibrary.LZ_RETRY_ROLE) {
        address _oapp = address(this);
        MessageHandlerStorageData storage _storage = _getStorage();
        ILayerZeroEndpointV2 _endpoint = ILayerZeroEndpointV2(_storage.endpoint);
        uint32 _srcEid =  _storage.lzEid;
        bytes32 _senderBytes32 = _getPeerOrRevert(_srcEid);
        bytes32 _payloadHash =  _endpoint.inboundPayloadHash(_oapp, _srcEid, _senderBytes32, _nonce);
        _endpoint.nilify(_oapp, _srcEid, _senderBytes32, _nonce, _payloadHash);
    }

    // INTERNAL FUNCTIONS

    function _payloadToSig(bytes calldata _payload) internal pure returns (bytes4 _sig, bytes memory _body) {
        _sig = bytes4(_payload[0:4]);
        _body = _payload[4:];
    }

    function _lzSendMessage(bytes memory _message) internal {
        MessageHandlerStorageData storage _storage = _getStorage();
        uint32 _lzEid = _storage.lzEid;
        bytes memory _lzOptions = _storage.lzOptions;
        MessagingFee memory _fee = _quote(_lzEid, _message, _lzOptions, false);
        _lzSend(_lzEid, _message, _lzOptions, _fee, address(this));
    }
}
