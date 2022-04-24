// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
interface IJupyterRouterV1 {
    function createLiquidityPool(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1Amount
    ) external;

    function addLiquidity(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1Amount
    ) external;

    function removeLiquidity(address _token0Address, address _token1Address)
        external;

    function swapToken0ToToken1(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1AmountMin
    ) external;

    function swapToken1ToToken0(
        address _token0Address,
        address _token1Address,
        uint256 _token1Amount,
        uint256 _token0AmountMin
    ) external;


    function getToken1AmountFromToken0Amount(
        address _token0Address,
        address _token1Address,
        uint256 amount
    ) external view returns (uint256);

    function getToken0AmountFromToken1Amount(
        address _token0Address,
        address _token1Address,
        uint256 amount
    ) external view returns (uint256);

    function getDepositAmount(
        address _token0Address,
        address _token1Address,
        uint256 _amount
    ) external view returns (uint256);

    function getSwapTokenTotalSupply(
        address _token0Address,
        address _token1Address
    ) external view returns (uint256);

    function getTokenBalances(address _token0Address, address _token1Address)
        external
        view
        returns (uint256, uint256);
}