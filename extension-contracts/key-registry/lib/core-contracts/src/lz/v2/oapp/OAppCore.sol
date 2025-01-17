// SPDX-License-Identifier: MIT

pragma solidity ^0.8.25;

import "openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";
import "openzeppelin-contracts-upgradeable/contracts/access/AccessControlUpgradeable.sol";
import { IOAppCore, ILayerZeroEndpointV2 } from "@othentic/lz/v2/oapp/interfaces/IOAppCore.sol";
import "@othentic/NetworkManagement/Common/RolesLibrary.sol";
import "@othentic/lz/v2/oapp/MessageHandlerStorage.sol";

/**
 * @title OAppCore
 * @dev Abstract contract implementing the IOAppCore interface with basic OApp configurations.
 */
abstract contract OAppCore is Initializable, AccessControlUpgradeable, IOAppCore {

    /**
     * @dev Constructor to initialize the OAppCore with the provided endpoint and delegate.
     * @param _endpoint The address of the LOCAL Layer Zero endpoint.
     * @param _delegate The delegate capable of making OApp configurations inside of the endpoint.
     *
     * @dev The delegate typically should be set as the owner of the contract.
     */
    function _initialize(MessageHandlerStorageData storage _sd, address _endpoint, address _delegate) virtual internal onlyInitializing {
        _grantRole(RolesLibrary.AVS_FACTORY_ROLE, msg.sender);
        _sd.endpoint = _endpoint;

        if (_delegate == address(0)) revert InvalidDelegate();
        ILayerZeroEndpointV2(_sd.endpoint).setDelegate(_delegate);
        __AccessControl_init();
    }

    function endpoint() external view returns (ILayerZeroEndpointV2 iEndpoint){
        return _getEndpoint();
    }

    function peers(uint32 _eid) external view returns (bytes32 peer){
        return _getPeerOrRevert(_eid);
    }

    /**
     * @notice Sets the peer address (OApp instance) for a corresponding endpoint.
     * @param _eid The endpoint ID.
     * @param _peer The address of the peer to be associated with the corresponding endpoint.
     *
     * @dev Only the owner/admin of the OApp can call this function.
     * @dev Indicates that the peer is trusted to send LayerZero messages to this OApp.
     * @dev Set this to bytes32(0) to remove the peer address.
     * @dev Peer is a bytes32 to accommodate non-evm chains.
     */
    function setPeer(uint32 _eid, bytes32 _peer) external virtual onlyRole(RolesLibrary.AVS_FACTORY_ROLE) {
        _getStorage().peers[_eid] = _peer;
        emit PeerSet(_eid, _peer);
    }

    /**
     * @notice Sets the delegate address for the OApp.
     * @param _delegate The address of the delegate to be set.
     *
     * @dev Only the owner/admin of the OApp can call this function.
     * @dev Provides the ability for a delegate to set configs, on behalf of the OApp, directly on the Endpoint contract.
     */
    function setDelegate(address _delegate) external onlyRole(RolesLibrary.AVS_GOVERNANCE_MULTISIG) {
        _getEndpoint().setDelegate(_delegate);
    }

    /**
     * @notice Internal function to get the peer address associated with a specific endpoint; reverts if NOT set.
     * ie. the peer is set to bytes32(0).
     * @param _eid The endpoint ID.
     * @return peer The address of the peer associated with the specified endpoint.
     */
    function _getPeerOrRevert(uint32 _eid) internal view virtual returns (bytes32) {
        bytes32 _peer = _getPeer(_eid);
        if (_peer == bytes32(0)) revert NoPeer(_eid);
        return _peer;
    }

    function _getPeer(uint32 _eid) internal view virtual returns (bytes32) {
        return _getStorage().peers[_eid];
    }

    function _getEndpoint() internal view virtual returns (ILayerZeroEndpointV2) {
        return ILayerZeroEndpointV2(_getStorage().endpoint);
    }

    function _getStorage() internal pure virtual returns (MessageHandlerStorageData storage) {
        return MessageHandlerStorage.load();
    }
}
