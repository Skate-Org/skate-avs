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

struct AvsGovernances {
    uint256 counter;
    mapping(uint256 => address) avsGovernances;
    mapping(address => uint256) ids;
}

error InvalidId();
error InavlidAvsGovernance();
error NotActiveOperator();
/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
library AvsGovernancesLibrary {
    
    function registerAvs(AvsGovernances storage self, address _avsGovernance) internal returns (uint256 _id) {
        if (_avsGovernance == address(0)) revert InvalidId();
        _id = ++self.counter;
        self.avsGovernances[_id] = _avsGovernance;
        self.ids[_avsGovernance] = _id;
    }

    function getAvsGovernance(AvsGovernances storage self, uint256 _id) internal view returns (address _avsGovernance) {
        _avsGovernance = self.avsGovernances[_id];
        if (_avsGovernance == address(0)) revert InvalidId();
    }

    function getId(AvsGovernances storage self, address _avsGovernance) internal view returns (uint256 _id) {
        _id = self.ids[_avsGovernance];
        if (_id == 0) revert InavlidAvsGovernance();
    }
}