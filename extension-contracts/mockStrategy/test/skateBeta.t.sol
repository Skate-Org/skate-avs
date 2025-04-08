// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {SkateBetaERC20} from "../src/skateBeta.sol";

contract SkateBetaTest is Test {
    SkateBetaERC20 public skateBetaERC20;
    address constant ONLY_HOLDER = 0x8f14feCD0b3c592bAA45E02D7C7A95c891730FCC;

    function setUp() public {
        skateBetaERC20 = new SkateBetaERC20();
    }

    function test_DeployOK() public view {
        address onlyHolder = skateBetaERC20.ONLY_HOLDER();
        assertEq(onlyHolder, ONLY_HOLDER);

        string memory name = skateBetaERC20.name();
        assertEq(name, "SkateBeta");

        string memory symbol = skateBetaERC20.symbol();
        assertEq(symbol, "SKATE-BETA");

        uint8 decimals = skateBetaERC20.decimals();
        assertEq(decimals, 18);

        uint256 onlyHolderBalance = skateBetaERC20.balanceOf(ONLY_HOLDER);
        assertEq(1 ether, onlyHolderBalance);
    }
}
