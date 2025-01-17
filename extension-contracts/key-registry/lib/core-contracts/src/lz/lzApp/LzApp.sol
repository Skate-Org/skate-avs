// SPDX-License-Identifier: MIT

pragma solidity >=0.8.19;

import "openzeppelin-contracts-upgradeable/contracts/access/AccessControlUpgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";
import "../interfaces/ILayerZeroReceiver.sol";
import "../interfaces/ILayerZeroUserApplicationConfig.sol";
import "../interfaces/ILayerZeroEndpoint.sol";
import "../util/BytesLib.sol";
import { RolesLibrary } from "../../NetworkManagement/Common/RolesLibrary.sol";

/*
 * a generic LzReceiver implementation
 */
abstract contract LzApp is Initializable, AccessControlUpgradeable, ILayerZeroReceiver, ILayerZeroUserApplicationConfig {
    using BytesLib for bytes;

    // ua can not send payload larger than this by default, but it can be changed by the ua owner
    uint constant public DEFAULT_PAYLOAD_SIZE_LIMIT = 10000;

    uint256 public lzFee;
    uint256 public lzFeeRemote;
    uint16 public destinationChainId;
    ILayerZeroEndpoint public lzEndpoint;
    mapping(uint16 => bytes) public trustedRemoteLookup;
    mapping(uint16 => mapping(uint16 => uint)) public minDstGasLookup;
    mapping(uint16 => uint) public payloadSizeLimitLookup;
    address public precrime;
    address public operationsMultisig;
    address public communityMultisig;

    event SetPrecrime(address precrime);
    event SetTrustedRemote(uint16 _remoteChainId, bytes _path);
    event SetTrustedRemoteAddress(uint16 _remoteChainId, bytes _remoteAddress);
    event SetMinDstGas(uint16 _dstChainId, uint16 _type, uint _minDstGas);

    function _initialize(address _avsGovernanceMultisigOwner, address _operationsMultisig, address _communityMultisig, address _lzEndpoint, uint16 _destinationChainId, uint _lzFee, uint _lzRemoteFee) internal virtual onlyInitializing {
        lzEndpoint = ILayerZeroEndpoint(_lzEndpoint);
        destinationChainId = _destinationChainId;
        lzFee = _lzFee;
        lzFeeRemote = _lzRemoteFee;
        operationsMultisig = _operationsMultisig;
        communityMultisig = _communityMultisig;
        __AccessControl_init();
        _grantRole(RolesLibrary.OPERATIONS_MULTISIG, _operationsMultisig);
        _grantRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG, _avsGovernanceMultisigOwner);
        _grantRole(RolesLibrary.AVS_FACTORY_ROLE, msg.sender);
    }

    function _lzSendMessage(bytes memory _payload) internal virtual {
        uint16 version = 1;
        bytes memory adapterParams = abi.encodePacked(version, lzFeeRemote);
        _lzSend(destinationChainId, _payload, payable(operationsMultisig), address(0x0), adapterParams, lzFee);
    }

    function lzReceive(uint16 _srcChainId, bytes calldata _srcAddress, uint64 _nonce, bytes calldata _payload) public virtual override {
        // lzReceive must be called by the endpoint for security
        require(msg.sender == address(lzEndpoint), "LzApp: invalid endpoint caller");
        bytes memory trustedRemote = trustedRemoteLookup[_srcChainId];
        // if will still block the message pathway from (srcChainId, srcAddress). should not receive message from untrusted remote.
        require(_srcAddress.length == trustedRemote.length && trustedRemote.length > 0 && keccak256(_srcAddress) == keccak256(trustedRemote), "LzApp: invalid source sending contract");

        _blockingLzReceive(_srcChainId, _srcAddress, _nonce, _payload);
    }

    function deposit() public payable{
    }

    function withdraw() public onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        (bool os, ) = payable(address(msg.sender)).call{value: address(this).balance}('');
    require(os);
    }

    // abstract function - the default behaviour of LayerZero is blocking. See: NonblockingLzApp if you dont need to enforce ordered messaging
    function _blockingLzReceive(uint16 _srcChainId, bytes calldata _srcAddress, uint64 _nonce, bytes calldata _payload) internal virtual;

    function _lzSend(uint16 _dstChainId, bytes memory _payload, address payable _refundAddress, address _zroPaymentAddress, bytes memory _adapterParams, uint _nativeFee) internal virtual {
        bytes memory trustedRemote = trustedRemoteLookup[_dstChainId];
        require(trustedRemote.length > 0, "LzApp: destination chain is not a trusted source");
        _checkPayloadSize(_dstChainId, _payload.length);
        lzEndpoint.send{value: _nativeFee}(_dstChainId, trustedRemote, _payload, _refundAddress, _zroPaymentAddress, _adapterParams);
    }

    function _checkGasLimit(uint16 _dstChainId, uint16 _type, bytes memory _adapterParams, uint _extraGas) internal view virtual {
        uint providedGasLimit = _getGasLimit(_adapterParams);
        uint minGasLimit = minDstGasLookup[_dstChainId][_type] + _extraGas;
        require(minGasLimit > 0, "LzApp: minGasLimit not set");
        require(providedGasLimit >= minGasLimit, "LzApp: gas limit is too low");
    }

    function _getGasLimit(bytes memory _adapterParams) internal pure virtual returns (uint gasLimit) {
        require(_adapterParams.length >= 34, "LzApp: invalid adapterParams");
        assembly {
            gasLimit := mload(add(_adapterParams, 34))
        }
    }

    function _checkPayloadSize(uint16 _dstChainId, uint _payloadSize) internal view virtual {
        uint payloadSizeLimit = payloadSizeLimitLookup[_dstChainId];
        if (payloadSizeLimit == 0) { // use default if not set
            payloadSizeLimit = DEFAULT_PAYLOAD_SIZE_LIMIT;
        }
        require(_payloadSize <= payloadSizeLimit, "LzApp: payload size is too large");
    }

    //---------------------------UserApplication config----------------------------------------
    function getConfig(uint16 _version, uint16 _chainId, address, uint _configType) external view returns (bytes memory) {
        return lzEndpoint.getConfig(_version, _chainId, address(this), _configType);
    }

    // generic config for LayerZero user Application
    function setConfig(uint16 _version, uint16 _chainId, uint _configType, bytes calldata _config) external override onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        lzEndpoint.setConfig(_version, _chainId, _configType, _config);
    }

    function setSendVersion(uint16 _version) external override onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        lzEndpoint.setSendVersion(_version);
    }

    function setReceiveVersion(uint16 _version) external override onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        lzEndpoint.setReceiveVersion(_version);
    }

    function forceResumeReceive(uint16 _srcChainId, bytes calldata _srcAddress) external override onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        lzEndpoint.forceResumeReceive(_srcChainId, _srcAddress);
    }

    // _path = abi.encodePacked(remoteAddress, localAddress)
    // this function set the trusted path for the cross-chain communication
    function setTrustedRemote(uint16 _remoteChainId, bytes calldata _path) external onlyRole(RolesLibrary.AVS_FACTORY_ROLE) {
        _setTrustedRemote(_remoteChainId, _path);
    }

    function setTrustedRemoteAddress(uint16 _remoteChainId, bytes calldata _remoteAddress) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _setTrustedRemoteAddress(_remoteChainId, _remoteAddress);
    }

    function getTrustedRemote(uint16 _remoteChainId) external view returns (bytes memory) {
        return _getTrustedRemote(_remoteChainId);
    }

    function getTrustedRemoteAddress(uint16 _remoteChainId) external view returns (bytes memory) {
        return _getTrustedRemoteAddress(_remoteChainId);
    }

    function setPrecrime(address _precrime) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        precrime = _precrime;
        emit SetPrecrime(_precrime);
    }

    function setLzFee(uint256 _lzFee) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        lzFee = _lzFee;
    }

    function setLzFeeRemote(uint256 _lzFeeRemote) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        lzFeeRemote = _lzFeeRemote;
    }

    function setMinDstGas(uint16 _dstChainId, uint16 _packetType, uint _minGas) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        require(_minGas > 0, "LzApp: invalid minGas");
        minDstGasLookup[_dstChainId][_packetType] = _minGas;
        emit SetMinDstGas(_dstChainId, _packetType, _minGas);
    }

    // if the size is 0, it means default size limit
    function setPayloadSizeLimit(uint16 _dstChainId, uint _size) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        payloadSizeLimitLookup[_dstChainId] = _size;
    }

    //--------------------------- VIEW FUNCTION ----------------------------------------
    function isTrustedRemote(uint16 _srcChainId, bytes calldata _srcAddress) external view returns (bool) {
        bytes memory trustedSource = trustedRemoteLookup[_srcChainId];
        return keccak256(trustedSource) == keccak256(_srcAddress);
    }


    //--------------------------- INTERNAL FUNCTIONS ----------------------------------------
    function _setTrustedRemote(uint16 _remoteChainId, bytes memory _path) internal {
        trustedRemoteLookup[_remoteChainId] = _path;
        emit SetTrustedRemote(_remoteChainId, _path);
    }
    function _setTrustedRemoteAddress(uint16 _remoteChainId, bytes memory _remoteAddress) internal {
        _setTrustedRemote(_remoteChainId, abi.encodePacked(_remoteAddress, this));
    }
    function _getTrustedRemote(uint16 _remoteChainId) internal view returns (bytes memory) {
        bytes memory path = trustedRemoteLookup[_remoteChainId];
        require(path.length != 0, "LzApp: no trusted path record");
        return path;
    }
    function _getTrustedRemoteAddress(uint16 _remoteChainId) internal view returns (bytes memory) {
        return _getTrustedRemote(_remoteChainId).slice(0, 20);
    }

}
