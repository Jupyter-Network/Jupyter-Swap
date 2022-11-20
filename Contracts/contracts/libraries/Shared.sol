pragma solidity ^0.8.13;

library Shared {
    struct Position {
        uint128 liquidity;
        uint256 token0Amount;
        uint256 token1Amount;
        int24 lowerTick;
        int24 upperTick;
        address owner;
        uint256 globalFees0;
        uint256 globalFees1;
    }
}
