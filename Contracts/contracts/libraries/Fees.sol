pragma solidity ^0.8.13;

library Fees {
    uint256 internal constant SCALE_FACTOR = 10**6;

    struct Fee {
        uint256 feeAmount0;
        uint256 feeAmount1;
    }

    function feesInRange(
        int24 _currentTick,
        int24 _lower,
        int24 _upper,
        uint256 _globalFees,
        uint256 _tickFeesLower,
        uint256 _tickFeesUpper,
        bool _up
    ) internal pure returns (uint256 feesInside) {
        uint256 feesBelow;
        uint256 feesAbove;
        if (_up) {
            feesBelow = _currentTick < _lower
                ? _globalFees - _tickFeesLower
                : _tickFeesLower;
            feesAbove = _currentTick < _upper
                ? _tickFeesUpper
                : _globalFees - _tickFeesUpper;
        } else {
            feesBelow = _currentTick < _lower
                ? _globalFees - _tickFeesLower
                : _tickFeesLower;
            feesAbove = _currentTick < _upper
                ? _tickFeesUpper
                : _globalFees - _tickFeesUpper;
     
        }

        require(_globalFees >= feesBelow + feesAbove, "Global fees too low");

        feesInside = _globalFees - feesBelow - feesAbove;
    }
}
