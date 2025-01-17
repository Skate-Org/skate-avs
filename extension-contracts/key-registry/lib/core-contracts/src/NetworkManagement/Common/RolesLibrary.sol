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

library RolesLibrary {
    bytes4 internal constant AVS_GOVERNANCE_MULTISIG = bytes4(keccak256("AVS_GOVERNANCE_MULTISIG"));
    bytes4 internal constant AVS_GOVERNANCE = bytes4(keccak256("AVS_GOVERNANCE"));
    bytes4 internal constant OPERATIONS_MULTISIG = bytes4(keccak256("OPERATIONS_MULTISIG"));
    bytes4 internal constant COMMUNITY_MULTISIG = bytes4(keccak256("COMMUNITY_MULTISIG"));
    bytes4 internal constant MESSAGE_HANDLER = bytes4(keccak256("MESSAGE_HANDLER")); 
    bytes4 internal constant ATTESTATION_CENTER = bytes4(keccak256("ATTESTATION_CENTER"));
    bytes4 internal constant LZ_RETRY_ROLE  = bytes4(keccak256("LZ_RETRY"));
    bytes4 internal constant AVS_FACTORY_ROLE  = bytes4(keccak256("AVS_FACTORY_ROLE"));
    bytes4 internal constant MULTIPLIER_SYNCER = bytes4(keccak256("MULTIPLIER_SYNCER"));
    bytes4 internal constant VOTING_POWER_SYNCER = bytes4(keccak256("VOTING_POWER_SYNCER"));
    bytes4 internal constant OBLS_MANAGER = bytes4(keccak256("OBLS_MANAGER"));
}