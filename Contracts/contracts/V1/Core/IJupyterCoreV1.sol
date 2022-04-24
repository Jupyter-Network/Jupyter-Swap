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

    function withdraw(address from) external;

    function swapToken0ToToken1(
        uint256 _token0Amount,
        uint256 _token1AmountMin,
        address from
    ) external;

    function swapToken1ToToken0(
        uint256 _token1Amount,
        uint256 _token0AmountMin,
        address from
    ) external;

    function getToken1AmountFromToken0Amount(uint256 tokenAmount)
        external
        view
        returns (uint256);

    function getToken0AmountFromToken1Amount(uint256 tokenAmount)
        external
        view
        returns (uint256);

    function rate() external view returns (uint256);

    function getBalances(address from)
        external
        view
        override
        returns (uint256, uint256)
}
