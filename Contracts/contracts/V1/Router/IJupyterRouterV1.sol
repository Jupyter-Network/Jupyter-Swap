// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IJupyterRouterV1 {
    function createLiquidityPool(
        address _token1Address,
        uint256 _token1Amount
    ) external payable;

    function addLiquidity(
        address _token1Address,
        uint256 _token1Amount
    ) external payable;

    function removeLiquidity(address _token1Address) external;

    function swapETHToToken(
        address _tokenAddress,
        uint256 _tokenAmountMin
    ) external payable;

    function swapTokenToETH(
        address _tokenAddress,
        uint256 _tokenAmount,
        uint256 _ethAmountMin
    ) external payable ;

    function getToken1AmountFromToken0Amount(
        address _token1Address,
        uint256 amount
    ) external view returns (uint256);

    function getToken0AmountFromToken1Amount(
        address _token1Address,
        uint256 amount
    ) external view returns (uint256);

    function getDepositAmount(address _token1Address, uint256 _amount)
        external
        view
        returns (uint256);

    function getSwapTokenTotalSupply(address _token1Address)
        external
        view
        returns (uint256);

    function getTokenBalances(address _token1Address)
        external
        view
        returns (uint256, uint256);
}
