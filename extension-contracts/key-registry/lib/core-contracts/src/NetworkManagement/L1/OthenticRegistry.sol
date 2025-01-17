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
import "openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";

import "@eigenlayer/contracts/interfaces/ISlasher.sol";
import "@eigenlayer/contracts/interfaces/IDelegationManager.sol";
import "@eigenlayer/contracts/interfaces/IStrategy.sol";
import "@eigenlayer/contracts/interfaces/IStrategyManager.sol";
import "./AvsGovernancesLibrary.sol";
import "./interfaces/IOthenticRegistry.sol";
import "@othentic/NetworkManagement/L1/interfaces/IAvsGovernance.sol";

/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
contract OthenticRegistry is Initializable, OwnableUpgradeable, IOthenticRegistry {
  using AvsGovernancesLibrary for AvsGovernances;

  ISlasher public slasher;
  IDelegationManager public delegationManager;
  IStrategyManager public strategyManager;
  AvsGovernances private avsGovernances;

  modifier onlyAvsGovernance() {
    uint256 _avsId = _getAvsGovernanceId(msg.sender);
    if (_avsId == 0 || _avsId > avsGovernances.counter) revert InavlidAvsGovernance();
    _;
  }

  function initialize(address _slasher, address _delegationManager, address _strategyManager , address _ownerMultiSig) initializer public {
     _initialize(_slasher, _delegationManager, _strategyManager, _ownerMultiSig);
  }

  function _initialize(address _slasher, address _delegationManager, address _strategyManager , address _ownerMultiSig) internal onlyInitializing {
    __Ownable_init(_ownerMultiSig);
    slasher = ISlasher(_slasher);
    delegationManager = IDelegationManager(_delegationManager);
    strategyManager = IStrategyManager(_strategyManager);
  }

  function registerAvs(string memory _avsName) external {
    emit AvsOptIn(msg.sender, _avsName);
  } 

  function numOfShares(address _operator, address _strategy) external view returns (uint256){
    if (!delegationManager.isOperator(_operator)) revert NotActiveOperator();
    return _numOfShares(_operator, IStrategy(_strategy));
  }

  function getVotingPower(address _operator, IAvsGovernance.StrategyMultiplier[] calldata _strategyMultipliers) external view returns (uint256) {
    if (!delegationManager.isOperator(_operator)) revert NotActiveOperator();
    uint256 _votingPower = 0;
    for (uint256 i = 0; i < _strategyMultipliers.length;) {
      _votingPower += _getVotingPower(_operator, _strategyMultipliers[i]);
      unchecked {++i;}
    }
    return _votingPower;
  }

  function isValidNumOfShares(address _operator, IAvsGovernance.StrategyShares[] calldata _minSharesPerStrategyList) external view returns (bool) {
    if (!delegationManager.isOperator(_operator)) revert NotActiveOperator();
    bool _isValidNumOfShares = true;
    for (uint256 i = 0; i < _minSharesPerStrategyList.length;) {
      if (_numOfShares(_operator, IStrategy(_minSharesPerStrategyList[i].strategy)) < _minSharesPerStrategyList[i].shares) {
        _isValidNumOfShares = false;
        break;
      }
      unchecked {++i;}
    }
    return _isValidNumOfShares;
  }

  // @obsolete - use getVotingPower instead
  function getOperatorShares(address _operator, address[] memory _strategies) external view returns (uint256) {
    if (!delegationManager.isOperator(_operator)) revert NotActiveOperator();
    uint256 _totalShares = 0;
    for (uint256 i = 0; i < _strategies.length;) {
      _totalShares += _numOfShares(_operator, IStrategy(_strategies[i]));
      unchecked {++i;}
    }
    return _totalShares;
  }

function getOperatorRestakedStrategies(address _operator, address[] memory _allStrategies) external view returns (address[] memory) {
    if (!delegationManager.isOperator(_operator)) revert NotActiveOperator();
    address[] memory _result = new address[](_allStrategies.length);
    uint256 _count = 0;
    for (uint256 i = 0; i < _allStrategies.length;) {
        if (_numOfShares(_operator, IStrategy(_allStrategies[i])) > 0) {
            _result[_count] = _allStrategies[i];
            _count++;
        }
        unchecked {++i;}
    }

    // Adjust the size of the result array to fit the number of valid strategies
    assembly {
        mstore(_result, _count)
    }

    return _result;
}

  function getAvsGovernance(uint256 _id) external view returns (address _avsGovernance) {
    return avsGovernances.getAvsGovernance(_id);
  }

  function getAvsGovernanceId(address _avsGovernance) external view returns (uint256 _id) {
    return _getAvsGovernanceId(_avsGovernance);
  }

  function getDefaultStrategies(uint _chainid) external pure returns (address[] memory) {
      // mainnet strategies
      if(_chainid == 1) {
          address[] memory _strategies = new address[](14);
          _strategies[0] = 0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc; // cbETH strategy
          _strategies[1] = 0x93c4b944D05dfe6df7645A86cd2206016c51564D; // stETH strategy
          _strategies[2] = 0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2; // rETH strategy
          _strategies[3] = 0x9d7eD45EE2E8FC5482fa2428f15C971e6369011d; // ETHx strategy
          _strategies[4] = 0x13760F50a9d7377e4F20CB8CF9e4c26586c658ff; // ankrETH strategy
          _strategies[5] = 0xa4C637e0F704745D182e4D38cAb7E7485321d059; // 0ETH strategy
          _strategies[6] = 0x57ba429517c3473B6d34CA9aCd56c0e735b94c02; // osETH strategy
          _strategies[7] = 0x0Fe4F44beE93503346A3Ac9EE5A26b130a5796d6; // swETH strategy
          _strategies[8] = 0x7CA911E83dabf90C90dD3De5411a10F1A6112184; // wBETH strategy
          _strategies[9] = 0x8CA7A5d6f3acd3A7A8bC468a8CD0FB14B6BD28b6; // sfrxETH strategy
          _strategies[10] = 0xAe60d8180437b5C34bB956822ac2710972584473; // lsETH strategy
          _strategies[11] = 0x298aFB19A105D59E74658C4C334Ff360BadE6dd2; // mETH strategy
          _strategies[12] = 0xbeaC0eeEeeeeEEeEeEEEEeeEEeEeeeEeeEEBEaC0; // Beacon Chain ETH strategy
          _strategies[13] = 0xaCB55C530Acdb2849e6d4f36992Cd8c9D50ED8F7; // EIGEN strategy
          return _strategies;
      } else if(_chainid == 17000) {
          address[] memory _strategies = new address[](14);
          _strategies[0] = 0x7D704507b76571a51d9caE8AdDAbBFd0ba0e63d3; // stETH strategy
          _strategies[1] = 0x3A8fBdf9e77DFc25d09741f51d3E181b25d0c4E0; // rETH strategy
          _strategies[2] = 0x80528D6e9A2BAbFc766965E0E26d5aB08D9CFaF9; // WETH strategy
          _strategies[3] = 0x05037A81BD7B4C9E0F7B430f1F2A22c31a2FD943; // lsETH strategy
          _strategies[4] = 0x9281ff96637710Cd9A5CAcce9c6FAD8C9F54631c; // sfrxETH strategy
          _strategies[5] = 0x31B6F59e1627cEfC9fA174aD03859fC337666af7; // ETHx strategy
          _strategies[6] = 0x46281E3B7fDcACdBa44CADf069a94a588Fd4C6Ef; // osETH strategy
          _strategies[7] = 0x70EB4D3c164a6B4A5f908D4FBb5a9cAfFb66bAB6; // cbETH strategy
          _strategies[8] = 0xaccc5A86732BE85b5012e8614AF237801636F8e5; // mETH strategy
          _strategies[9] = 0x7673a47463F80c6a3553Db9E54c8cDcd5313d0ac; // ankrETH strategy
          _strategies[10] = 0xAD76D205564f955A9c18103C4422D1Cd94016899; // reALT strategy
          _strategies[11] = 0x78dBcbEF8fF94eC7F631c23d38d197744a323868; // EO strategy
          _strategies[12] = 0xbeaC0eeEeeeeEEeEeEEEEeeEEeEeeeEeeEEBEaC0; // Beacon Chain ETH strategy
          _strategies[13] = 0x43252609bff8a13dFe5e057097f2f45A24387a84; // EIGEN strategy
          return _strategies;
      } else if(_chainid == 31337) {
          address[] memory _strategies = new address[](0);
          return _strategies;
      } else {
          revert InvalidBlockId();
      }        
    }
              
  function freezeOperator(address _operator) external onlyAvsGovernance {
    uint256 _avsId = _getAvsGovernanceId(msg.sender);
    slasher.freezeOperator(_operator);
    emit OperatorFreezed(_avsId, _operator);
  } 

  function approveAvs(address _avsGovernance) external onlyOwner returns (uint256) {
    if (_avsGovernance == address(0)) revert InavlidAvsGovernance();
    uint256 _id = avsGovernances.registerAvs(_avsGovernance);
    emit AvsRegistered(_id, _avsGovernance);
    return _id;
  }

  function _getAvsGovernanceId(address _avsGovernance) private view returns (uint256) {
    return avsGovernances.getId(_avsGovernance);
  }

  function _numOfShares(address _operator, IStrategy _strategy) private view returns (uint256){
    return delegationManager.operatorShares(_operator, _strategy);
  }

  function _getVotingPower(address _operator, IAvsGovernance.StrategyMultiplier calldata _strategyMultiplier) private view returns (uint256) {
    return _numOfShares(_operator, IStrategy(_strategyMultiplier.strategy)) * _strategyMultiplier.multiplier;
  }

   // slither-disable-next-line unused-state,naming-convention
  uint256[50] private __gap;
}