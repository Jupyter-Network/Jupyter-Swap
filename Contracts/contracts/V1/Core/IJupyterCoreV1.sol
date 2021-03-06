// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IJupyterCoreV1 {
    function initialDeposit(
        uint256 _token0Amount,
        uint256 _token1Amount,
        address from
    ) external;

    function deposit(
        uint256 _token0Amount,
        uint256 _token1Amount,
        address from
    ) external;

    function withdraw(address from,uint256 _withdrawalAmount) external returns(uint256);

    function swapToken0ToToken1(
        uint256 _token0Amount,
        uint256 _token1AmountMin,
        address from
    ) external returns(uint256);

    function swapToken1ToToken0(
        uint256 _token1Amount,
        uint256 _token0AmountMin,
        address from
    ) external returns(uint256);
}
