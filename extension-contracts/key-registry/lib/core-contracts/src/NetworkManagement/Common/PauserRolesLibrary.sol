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

library PauserRolesLibrary {

    // PAUSABLE FLOWS-FEATURES
    bytes4 internal constant REGISTRATION_FLOW  = bytes4(keccak256("REGISTRATION_FLOW"));
    bytes4 internal constant PAYMENT_REQUEST_FLOW  = bytes4(keccak256("PAYMENT_REQUST_FLOW"));
    bytes4 internal constant BATCH_PAYMENT_REQUEST_FLOW  = bytes4(keccak256("BATCH_PAYMENT_REQUEST_FLOW"));
    bytes4 internal constant OPERATOR_SET_REWARDS_RECEIVER_FLOW  = bytes4(keccak256("AVS_PAUSE_REWARD_MODIFICATION"));
    bytes4 internal constant SET_AVS_LOGIC_FLOW  = bytes4(keccak256("SET_AVS_LOGIC_FLOW"));
    bytes4 internal constant SET_SUPPORTED_STRATEGIES_FLOW  = bytes4(keccak256("SET_SUPPORTED_STRATEGIES_FLOW"));
    bytes4 internal constant TASKS_SUBMISSION_FLOW  = bytes4(keccak256("TASKS_SUBMISSION_FLOW"));
    bytes4 internal constant CREATE_NEW_TASK_DEFINITION_FLOW  = bytes4(keccak256("CREATE_NEW_TASK_DEFINITION_FLOW"));

}