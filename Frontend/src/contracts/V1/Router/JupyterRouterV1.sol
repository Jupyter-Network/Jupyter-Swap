// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../Core/JupyterCoreV1.sol";
import "./IJupyterRouterV1.sol";

contract JupyterRouterV1 is IJupyterRouterV1 {
    using SafeERC20 for IERC20;
    modifier existingPair(address token0Address, address token1Address) {
        require(
            address(pairs[token0Address][token1Address]) != address(0),
            "Pair doesnt exist"
        );
        _;
    }

    event newPair(address token0Amount, address token1Amount);
    event liquidityIncreased(
        address pool,
        uint256 token0Amount,
        uint256 token1Amount
    );
    event liquidityRemoved(
        address pool,
        uint256 token0Amount,
        uint256 token1Amount
    );

    event rateChanged(address pool, uint256 rate);

    mapping(address => mapping(address => JupyterCoreV1)) public pairs;
    address vaultAddress;

    constructor(address _protocolAddress) {
        require(_protocolAddress != address(0), "Zero address not allowed");
        vaultAddress = _protocolAddress;
    }

    function createLiquidityPool(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1Amount
    ) external override {
        require(
            address(pairs[_token0Address][_token1Address]) == address(0),
            "Pair exists"
        );
        (address token0, address token1) = _token0Address < _token1Address
            ? (_token0Address, _token1Address)
            : (_token1Address, _token0Address);

        JupyterCoreV1 newSwap = new JupyterCoreV1(token0, token1, vaultAddress);
        pairs[_token0Address][_token1Address] = newSwap;
        pairs[_token1Address][_token0Address] = newSwap;

        newSwap.initialDeposit(_token0Amount, _token1Amount, msg.sender);

        IERC20(_token0Address).safeTransferFrom(
            msg.sender,
            address(newSwap),
            _token0Amount
        );
        IERC20(_token1Address).safeTransferFrom(
            msg.sender,
            address(newSwap),
            _token0Amount
        );

        emit newPair(_token0Address, _token1Address);
    }

    function addLiquidity(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1Amount
    ) external override {
        JupyterCoreV1 pair = _orderInputAddress(_token0Address, _token1Address);
        pair.deposit(_token0Amount, _token1Amount, msg.sender);
        IERC20(pair.token0()).safeTransferFrom(
            msg.sender,
            address(pair),
            _token0Amount
        );
        IERC20(pair.token1()).safeTransferFrom(
            msg.sender,
            address(pair),
            _token1Amount
        );

        emit liquidityIncreased(
            address(pair),
            pair.token0Balance(),
            pair.token1Balance()
        );
    }

    function removeLiquidity(address _token0Address, address _token1Address)
        external
        override
        existingPair(_token0Address, _token1Address)
    {
        JupyterCoreV1 pair = _orderInputAddress(_token0Address, _token1Address);
        pair.withdraw(msg.sender);

        emit liquidityRemoved(
            address(pair),
            pair.token0Balance(),
            pair.token1Balance()
        );
    }

    function swapToken0ToToken1(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1AmountMin
    ) external override {
        JupyterCoreV1 pair = _orderInputAddress(_token0Address, _token1Address);
        pair.swapToken0ToToken1(_token0Amount, _token1AmountMin, msg.sender);

        IERC20(pair.token0()).safeTransferFrom(
            msg.sender,
            address(pair),
            _token0Amount
        );

        emit rateChanged(address(pair), pair.rate());
    }

    function swapToken1ToToken0(
        address _token0Address,
        address _token1Address,
        uint256 _token1Amount,
        uint256 _token0AmountMin
    ) external override {
        JupyterCoreV1 pair = _orderInputAddress(_token0Address, _token1Address);
        pair.swapToken1ToToken0(_token1Amount, _token0AmountMin, msg.sender);
        IERC20(pair.token1()).safeTransferFrom(
            msg.sender,
            address(pair),
            _token1Amount
        );

        emit rateChanged(address(pair), pair.rate());
    }

    function getToken1AmountFromToken0Amount(
        address _token0Address,
        address _token1Address,
        uint256 amount
    ) external view override returns (uint256) {
        JupyterCoreV1 pair = _orderInputAddress(_token0Address, _token1Address);
        return pair.getToken1AmountFromToken0Amount(amount);
    }

    function getToken0AmountFromToken1Amount(
        address _token0Address,
        address _token1Address,
        uint256 amount
    ) external view override returns (uint256) {
        JupyterCoreV1 pair = _orderInputAddress(_token0Address, _token1Address);
        return pair.getToken0AmountFromToken1Amount(amount);
    }

    function getRate(address token0Address, address token1Address)
        external
        view
        existingPair(token0Address, token1Address)
        returns (uint256)
    {
        return pairs[token0Address][token1Address].rate();
    }

    function getBalance(address token0Address, address token1Address)
        external
        view
        existingPair(token0Address, token1Address)
        returns (uint256)
    {
        return pairs[token0Address][token1Address].balanceOf(msg.sender);
    }

    function _orderInputAddress(address _token0Address, address _token1Address)
        internal
        view
        returns (JupyterCoreV1)
    {
        (address token0, address token1) = _token0Address < _token1Address
            ? (_token0Address, _token1Address)
            : (_token1Address, _token0Address);
        require(
            address(pairs[token0][token1]) != address(0),
            "Pair does not exist"
        );
        return pairs[token0][token1];
    }

    function getDepositAmount(
        address _token0Address,
        address _token1Address,
        uint256 _amount
    ) external view override returns (uint256) {
        JupyterCoreV1 pair = _orderInputAddress(_token0Address, _token1Address);
        return (_amount * 10**18) / pair.rate();
    }

    function getSwapTokenTotalSupply(
        address _token0Address,
        address _token1Address
    ) external view override returns (uint256) {
        JupyterCoreV1 pair = _orderInputAddress(_token0Address, _token1Address);
        return pair.totalSupply();
    }

    function getTokenBalances(address _token0Address, address _token1Address)
        external
        view
        override
        returns (uint256, uint256)
    {
        return (
            IERC20(_token0Address).balanceOf(msg.sender),
            IERC20(_token1Address).balanceOf(msg.sender)
        );
    }

    function getPoolBalances(address _token0Address, address _token1Address)
        external
        view
        returns (uint256, uint256)
    {
        JupyterCoreV1 pair = _orderInputAddress(_token0Address, _token1Address);
        return (
            IERC20(_token0Address).balanceOf(address(pair)),
            IERC20(_token1Address).balanceOf(address(pair))
        );
    }

    //---------------TESTING REMOVE BEFORE DEPLOY

    function getAddress(address _token0Address, address _token1Address)
        external
        view
        returns (address)
    {
        JupyterCoreV1 pair = _orderInputAddress(_token0Address, _token1Address);
        return address(pair);
    }
}
