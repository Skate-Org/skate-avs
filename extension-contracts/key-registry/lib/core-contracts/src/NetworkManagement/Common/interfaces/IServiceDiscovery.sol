// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.25;

interface IServiceDiscovery {
    function updateAddress(string calldata identifier, address addr) external;
    function getAddress(string calldata identifier) external view returns (address);
}
