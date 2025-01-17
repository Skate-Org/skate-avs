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

/**
 * @author Othentic Labs LTD.
 */

interface IPausableFlows {

    // EVENTS
    
    event FlowPaused(bytes4 _pausableFlow, address _pauser);
    event FlowUnpaused(bytes4 _pausableFlowFlag, address _unpauser);

    // ERRORS

    error FlowIsCurrentlyPaused();
    error FlowIsCurrentlyUnpaused();
    error PauseFlowIsAlreadyPaused();
    error UnpausingFlowIsAlreadyUnpaused();

    // EXTERNAL FUNCTIONS
    
    function pause(bytes4 _pausableFlow) external;
    function unpause(bytes4 _pausableFlow) external;
    function isFlowPaused(bytes4 _pausableFlow) external view returns (bool);

}
