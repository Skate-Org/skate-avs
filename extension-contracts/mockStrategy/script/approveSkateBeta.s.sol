// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SkateBetaERC20} from "../src/skateBeta.sol";

contract ApproveScript is Script {
    function run() public {
        uint256 key = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(key);
        address EL_STRATEGY_MANAGER = 0x858646372CC42E1A627fcE94aa7A7033e7CF075A;
        SkateBetaERC20 skateBetaERC20 = SkateBetaERC20(
            0x379049b8d8Dc103551Bcf5B22C97c1164E898757
        );
        skateBetaERC20.approve(EL_STRATEGY_MANAGER, 2 ** 256 - 1);
        vm.stopBroadcast();
    }
}
