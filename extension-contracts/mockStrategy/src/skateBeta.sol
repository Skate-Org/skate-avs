// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SkateBetaERC20 is ERC20 {
    address public constant ONLY_HOLDER = 0x8f14feCD0b3c592bAA45E02D7C7A95c891730FCC;

    constructor() ERC20("SkateBeta", "SKATE-BETA") {
      _mint(ONLY_HOLDER, 1 ether);
    }
}
