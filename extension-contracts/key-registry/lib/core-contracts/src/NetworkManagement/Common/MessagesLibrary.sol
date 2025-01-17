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

library MessagesLibrary {
    bytes4 internal constant CLEAR_SIG = bytes4(keccak256("CLEAR"));
    bytes4 internal constant BATCH_CLEAR_SIG = bytes4(keccak256("BATCH_CLEAR"));
    bytes4 internal constant PAYMENT_SIG = bytes4(keccak256("PAYMENT"));
    bytes4 internal constant BATCH_PAYMENT_SIG = bytes4(keccak256("BATCH_PAYMENT"));
    bytes4 internal constant REGISTER_SIG = bytes4(keccak256("REGISTER"));
    bytes4 internal constant UNREGISTER_SIG = bytes4(keccak256("UNREGISTER"));
    bytes4 internal constant UNSTAKE_SIG = bytes4(keccak256("UNSTAKE"));

    //////////////////////////////////////////////////////////////////
    //      Message Builders
    //////////////////////////////////////////////////////////////////
    //
    //      Tasks Manager to Network Manager messages
    //
    /////////////////////////////////////////////////////////////////
    function BuildPaymentRequestMessage(address _operator, uint32 _taskNumber, uint _feeToClaim) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(MessagesLibrary.PAYMENT_SIG, _operator, _taskNumber, _feeToClaim);
    }

    function BuildBatchPaymentRequestMessage(bytes memory _operators, uint256 _taskNumber) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(MessagesLibrary.BATCH_PAYMENT_SIG, _operators, _taskNumber);
    }
    
    //////////////////////////////////////////////////////////////////
    //
    //       AvsGovernance to AttestationCenter messages
    //
    /////////////////////////////////////////////////////////////////
    function BuildRegisterOperatorMessage(address _operator, uint256 _votingPower, uint[4] calldata _blsKey, address _rewardsReceiver) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(MessagesLibrary.REGISTER_SIG, _operator, _votingPower, _blsKey, _rewardsReceiver);
    }

    function BuildUnregisterRequestMessage(address _operator) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(MessagesLibrary.UNREGISTER_SIG, _operator);
    }

    function BuildClearRequestMessage(address _operator, uint256 _lastPaidTaskNumber, uint256 _amountClaimed) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(MessagesLibrary.CLEAR_SIG, _operator, _lastPaidTaskNumber, _amountClaimed);
    }

    function BuildBatchClearRequestMessage(bytes memory _operators, uint256 _lastPaidTaskNumber) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(MessagesLibrary.BATCH_CLEAR_SIG, _operators, _lastPaidTaskNumber);
    }

    //////////////////////////////////////////////////////////////////
    //
    //       L1MessageHandler
    //
    /////////////////////////////////////////////////////////////////

    function ParsePaymentRequestMessage(bytes memory _message) internal pure returns (address _operator, uint256 _lastPayedTask, uint256 _feeToClaim) {
        return abi.decode(_message, (address, uint256, uint256));
    }

    function ParseBatchPaymentRequestMessage(bytes memory _message) internal pure returns (bytes memory _operators, uint256 _lastPayedTask) {
        return abi.decode(_message, (bytes, uint256));
    }

    //////////////////////////////////////////////////////////////////
    //
    //       L2MessageHandler
    //
    /////////////////////////////////////////////////////////////////

    function ParseRegisterToAvsMessage(bytes memory _message) internal pure returns  (address _operator, uint256 _votingPower, uint256[4] memory _blsKey, address _rewardsReceiver) {
       return abi.decode(_message, (address, uint256, uint256[4], address));
    }

    function ParsePaymentSuccessMessage(bytes memory _message) internal pure returns (address _operator, uint256 _lastPaidTaskNumber, uint256 _amountClaimed)  {
        return abi.decode(_message, (address, uint256, uint256));   
    }

    function ParseBatchPaymentSuccessMessage(bytes memory _message) internal pure returns (bytes memory _operators, uint256 _lastPaidTaskNumber)  {
        return abi.decode(_message, (bytes, uint256));   
    }

    function ParseUnregisterOperatorMessage(bytes memory _message) internal pure returns (address operator) {
        return abi.decode(_message, (address));
    }
}
