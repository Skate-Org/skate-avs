// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SkateBetaERC20} from "../src/skateBeta.sol";

contract DeployScript is Script {
    function run() public {
        uint256 key = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(key);
        SkateBetaERC20 SkateBetaERC20 = new SkateBetaERC20();
        vm.stopBroadcast();
    }
}
