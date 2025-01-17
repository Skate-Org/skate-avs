// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import { BLSAuthLibrary } from "@othentic/NetworkManagement/Common/BLSAuthLibrary.sol";

/**
 * @author Othentic Labs LTD.
 */
interface IOBLS {

    struct BLSOperator {
        uint256[4] blsKey;
        uint256 votingPower;
        bool isActive;
    }

    struct OperatorVotingPower {
      uint256 operatorId;
      uint256 votingPower; 
    }

  error NotOBLSManager();
  error NotOBLSManagerOrShareSyncer();
  error InsufficientVotingPower();
  error InvalidOBLSSignature();
  error InvalidOperatorIndexes();
  error InactiveOperator(uint256 operator);
  error InvalidAuthSignature();
  error OperatorDoesNotHaveMinimumVotingPower(uint256 _operatorIndex);
  error InvalidRequiredVotingPower(); 

  event SetOBLSManager(address newOBLSManager);
  event SharesSyncerModified(address syncer);

  function totalVotingPower() external view returns(uint256);

  function votingPower(uint256 _index) external view returns(uint256);

  function totalVotingPowerPerTaskDefinition(uint256 _id) external view returns (uint256);
  
  function isActive(uint256 _index) external view returns(bool) ;

  function verifySignature(uint256[2] calldata _message, uint256[2] calldata _signature,  uint256[] calldata _indexes, uint256 _requiredVotingPower, uint256 _minimumVotingPowerPerTaskDefinition) external view;

  function verifyAuthSignature(BLSAuthLibrary.Signature calldata _signature, address _operator, address _contract, uint256[4] calldata _blsKey) external view;

  function hashToPoint(bytes32 domain, bytes calldata message) external view returns (uint256[2] memory);

  function unRegisterOperator(uint256 _index) external;

  function registerOperator(uint256 _index, uint256 _votingPower, uint256[4] memory _blsKey) external;

  function setTotalVotingPowerPerTaskDefinition(uint16 _taskdefinitionId, uint256 _numOfTotalOperators, uint256 _minimumVotingPower) external;

  function setTotalVotingPowerPerRestrictedTaskDefinition(uint16 _taskDefinitionId, uint256 _minimumVotingPower, uint256[] calldata _restrictedOperatorIndexes) external;

  function modifyOperatorBlsKey(uint256 _index, uint256[4] memory _blsKey) external;


  function increaseOperatorVotingPower(uint256 _index, uint256 _votingPower) external;
  
  function increaseBatchOperatorVotingPower(OperatorVotingPower[] memory _operatorsVotingPower) external;

  function increaseOperatorVotingPowerPerTaskDefinition(uint16 _taskDefinitionId, uint256 _votingPower) external;

  function decreaseOperatorVotingPower(uint256 _index, uint256 _votingPower) external;

  function decreaseBatchOperatorVotingPower(OperatorVotingPower[] memory _operatorsVotingPower) external;

  function decreaseOperatorVotingPowerPerTaskDefinition(uint16 _taskDefinitionId, uint256 _votingPower) external;

  function setOblsSharesSyncer(address _oblsSharesSyncer) external;
}