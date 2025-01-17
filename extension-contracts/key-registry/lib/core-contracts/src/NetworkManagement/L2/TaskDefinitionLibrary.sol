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

struct TaskDefinition {
    uint16 taskDefinitionId;
    string name;
    uint256 blockExpiry;
    uint256 baseRewardFeeForAttesters;
    uint256 baseRewardFeeForPerformer;
    uint256 baseRewardFeeForAggregator;
    uint256 disputePeriodBlocks;
    uint256 minimumVotingPower;
    uint256[] restrictedOperatorIndexes;
}

struct TaskDefinitionParams {
    uint256 blockExpiry;
    uint256 baseRewardFeeForAttesters;
    uint256 baseRewardFeeForPerformer;
    uint256 baseRewardFeeForAggregator;
    uint256 disputePeriodBlocks;
    uint256 minimumVotingPower;
    uint256[] restrictedOperatorIndexes;
}

struct TaskDefinitions {
    uint16 counter;
    mapping(uint16 => TaskDefinition) taskDefinitions;
}

error InvalidBlockExpiry();

/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
library TaskDefinitionLibrary {

    event TaskDefinitionCreated(
        uint16 taskDefinitionId,
        string name,
        uint blockExpiry,
        uint baseRewardFeeForAttesters,
        uint baseRewardFeeForPerformer,
        uint baseRewardFeeForAggregator,
        uint disputePeriodBlocks,
        uint minimumVotingPower,
        uint256[] restrictedOperatorIndexes
    );

    function createNewTaskDefinition(TaskDefinitions storage self, string memory _name, TaskDefinitionParams calldata _params) internal returns (uint16 _id) {
        if (_params.blockExpiry <= block.number) revert InvalidBlockExpiry();
        _id = ++self.counter;
        self.taskDefinitions[_id] = TaskDefinition(_id, _name, _params.blockExpiry, _params.baseRewardFeeForAttesters, _params.baseRewardFeeForPerformer, _params.baseRewardFeeForAggregator, _params.disputePeriodBlocks, _params.minimumVotingPower, _params.restrictedOperatorIndexes);
        emit TaskDefinitionCreated(_id, _name, _params.blockExpiry, _params.baseRewardFeeForAttesters, _params.baseRewardFeeForPerformer, _params.baseRewardFeeForAggregator, _params.disputePeriodBlocks, _params.minimumVotingPower, _params.restrictedOperatorIndexes);
    }

    function getTaskDefinition(TaskDefinitions storage self, uint16 _taskDefinitionId) internal view returns (TaskDefinition storage) {
        return self.taskDefinitions[_taskDefinitionId];
    }

    function getMinimumVotingPower(TaskDefinitions storage self, uint16 _taskDefinitionId) internal view returns (uint256) {
        return self.taskDefinitions[_taskDefinitionId].minimumVotingPower;
    }

    function getRestrictedOperatorIndexes(TaskDefinitions storage self, uint16 _taskDefinitionId) internal view returns (uint256[] storage) {
        return self.taskDefinitions[_taskDefinitionId].restrictedOperatorIndexes;
    }

}