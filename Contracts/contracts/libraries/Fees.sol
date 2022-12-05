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
        uint256 outsideLower,
        uint256 outsideUpper,
        uint256 posGlobal
    ) internal view returns (uint256 feeGrowthInside0X128) {
        // calculate fee growth below
        uint256 feeGrowthBelow0X128;
        if (_currentTick >= _lower) {
            feeGrowthBelow0X128 = outsideLower;
        } else {
            unchecked {
                feeGrowthBelow0X128 = _globalFees - outsideLower;
            }
        }

        // calculate fee growth above
        uint256 feeGrowthAbove0X128;
        if (_currentTick < _upper) {
            feeGrowthAbove0X128 = outsideUpper;
        } else {
            unchecked {
                feeGrowthAbove0X128 = _globalFees - outsideUpper;
            }
        }
        if (_globalFees < feeGrowthAbove0X128 + feeGrowthBelow0X128) {
            feeGrowthInside0X128 = 0;
        } else {
            feeGrowthInside0X128 =
                _globalFees -
                feeGrowthBelow0X128 -
                feeGrowthAbove0X128 ;
        }
    }
}
