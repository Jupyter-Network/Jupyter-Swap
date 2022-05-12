// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

abstract contract JupyterCoreHelperV1 {
    uint64 internal constant _scaleFactor = 1 ether;
    uint32 internal constant _minAmount = 10**5;
    uint64 internal constant _percentFee = 3 ether / 1000; //0.3%
    uint64 internal constant _protocolFee = 3 ether / 10000; //0.03%

    function _scaleUp(uint256 value) internal pure returns (uint256) {
        return value * _scaleFactor;
    }

    function _scaleDown(uint256 value) internal pure returns (uint256) {
        return value / _scaleFactor;
    }
}