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

import "@othentic/NetworkManagement/Common/interfaces/IOBLS.sol";

struct OBLSStorageData {
    address oblsManager;
    uint256 totalVotingPower;
    IBN256G2 bn256G2;  // kept here for backwards compatibility, do not use
    mapping(uint256 => IOBLS.BLSOperator) operators;
    address oblsSharesSyncer;
    mapping(uint256 => uint256) totalVotingPowerPerTaskDefinition;
}

library OBLSStorage {
    uint256 constant private STORAGE_POSITION = uint256(keccak256("storage.obls")) - 1;

    function load() internal pure returns (OBLSStorageData storage sd) {
        uint256 position = STORAGE_POSITION;
        assembly {
            sd.slot := position
        }
    }
}

// kept here for backwards compatibility, do not use
interface IBN256G2 {
    function ecTwistAdd(
        uint256 pt1xx,
        uint256 pt1xy,
        uint256 pt1yx,
        uint256 pt1yy,
        uint256 pt2xx,
        uint256 pt2xy,
        uint256 pt2yx,
        uint256 pt2yy
    ) external view returns (uint256, uint256, uint256, uint256);
}