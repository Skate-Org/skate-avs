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


/// @custom:storage-location erc7201:othentic.storage.PauseableFlowControl
struct PausableFlowsStorageData {
  mapping(bytes4 _pausableFlow => bool isPaused) flowsPauseStates;
}

library PausableFlowsStorage {
    // keccak256(abi.encode(uint256(keccak256("othentic.storage.PauseableFlowControl")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant STORAGE_LOCATION = 0xfe6065fb4e9872e2ad4479001655335380d83f70e163706cd65857449b845100;

  function load() internal pure returns (PausableFlowsStorageData storage sd) {
      bytes32 position = STORAGE_LOCATION;
      assembly {
          sd.slot := position
      }
  }
}