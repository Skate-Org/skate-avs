// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

/**
 * @title Library for operations on G2 subgroup of the BN254 elliptic curve
 */
library Mod {
    /**
     * modExp Calculates the modular exponent of base by exp over modulo n
     * From https://github.com/HarryR/solcrypto/blob/master/contracts/altbn128.sol#L111
     */
    function modExp(uint256 base, uint256 exp, uint256 mod) internal view returns (uint256) {
        bool success;
        uint256[1] memory output;
        uint256[6] memory input;
        input[0] = 0x20; // baseLen = new(big.Int).SetBytes(getData(input, 0, 32))
        input[1] = 0x20; // expLen  = new(big.Int).SetBytes(getData(input, 32, 32))
        input[2] = 0x20; // modLen  = new(big.Int).SetBytes(getData(input, 64, 32))
        input[3] = base;
        input[4] = exp;
        input[5] = mod;
        assembly {
            success := staticcall(sub(gas(), 2000), 5, input, 0xc0, output, 0x20)
            // Use "invalid" to make gas estimation work
            switch success
            case 0 {
                invalid()
            }
        }
        require(success, "Mod.modExp: 0x5 call failed");
        return output[0];
    }

    /**
     * modInverse Calculates the modular inverse of num over the prime field P.
     */
    function modInverse(uint256 num, uint256 P) internal view returns (uint256) {
        // NOTE: this can be optimized: https://github.com/pornin/bingcd/blob/main/doc/bingcd.pdf
        return modExp(num, P - 2, P);
    }
}