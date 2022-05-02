// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../Core/JupyterCoreV1.sol";
import "./IJupyterRouterV1.sol";
import "../../TestTokens/WBNB.sol";
import "../../TestTokens/IWETH.sol";

library JupyterHelper {}

contract JupyterRouterV1 is IJupyterRouterV1 {
    using SafeERC20 for IERC20;
    modifier existingPair(address token0Address, address token1Address) {
        require(
            address(pairs[token0Address][token1Address]) != address(0),
            "Pair doesnt exist"
        );
        _;
    }
    modifier selfCall{
        require(address(this) == msg.sender);
        _;
    }

    event newPair(address token0Amount, address token1Amount);
    event addLiquidityEvent(
        address pool,
        uint256 token0Amount,
        uint256 token1Amount
    );
    event removeLiquidityEvent(
        address pool,
        uint256 token0Amount,
        uint256 token1Amount
    );

    event rateChanged(address pool, uint256 rate);

    mapping(address => mapping(address => JupyterCoreV1)) public pairs;
    address vaultAddress;
    address wbnb;

    constructor(address _protocolAddress, address _wbnb) {
        require(_protocolAddress != address(0), "Zero address not allowed");
        vaultAddress = _protocolAddress;
        wbnb = _wbnb;
    }

    receive() external payable {
        require (msg.sender == wbnb);
    }


    function withdrawAndTransferETH(uint256 _amount) private{
        //WBNB handling
        IWETH(wbnb).withdraw(_amount);
        payable(msg.sender).transfer(_amount);
    }

    function depositAndTransferWETH(address pair,uint256 value)private{
        IWETH(wbnb).deposit{value: value}();
        IERC20(wbnb).transfer(pair, value);
    }

    function createLiquidityPool(address _token1Address, uint256 _token1Amount)
        external
        payable
        override
    {
        require(
            address(pairs[wbnb][_token1Address]) == address(0),
            "Pair exists"
        );

        JupyterCoreV1 newSwap = new JupyterCoreV1(
            wbnb,
            _token1Address,
            vaultAddress
        );
        pairs[address(wbnb)][_token1Address] = newSwap;
        pairs[_token1Address][address(wbnb)] = newSwap;

        newSwap.initialDeposit(msg.value, _token1Amount, msg.sender);
        IERC20(_token1Address).safeTransferFrom(
            msg.sender,
            address(newSwap),
            _token1Amount
        );

        depositAndTransferWETH(address(newSwap), msg.value);

        emit newPair(address(wbnb), _token1Address);
    }

    function addLiquidity(address _token1Address, uint256 _token1Amount)
        external
        payable
        override
    {
        JupyterCoreV1 pair = pairs[wbnb][_token1Address];
        pair.deposit(msg.value, _token1Amount, msg.sender);
        depositAndTransferWETH(address(pair), msg.value);
        IERC20(pair.token1()).safeTransferFrom(
            msg.sender,
            address(pair),
            _token1Amount
        );

        emit addLiquidityEvent(
            address(pair),
            pair.token0Balance(),
            pair.token1Balance()
        );
    }

    function removeLiquidity(address _token1Address)
        external
        override
        existingPair(wbnb, _token1Address)
    {
        JupyterCoreV1 pair = _existingPair(_token1Address);
        uint256 bnbToWithdraw = pair.withdraw(msg.sender);
        withdrawAndTransferETH(bnbToWithdraw);

        emit removeLiquidityEvent(
            address(pair),
            pair.token0Balance(),
            pair.token1Balance()
        );
    }


    function swapETHToToken(
        address _tokenAddress,
        uint256 _tokenAmountMin
    ) external payable override {
        JupyterCoreV1 pair = _existingPair(_tokenAddress);
        pair.swapToken0ToToken1(msg.value, _tokenAmountMin, msg.sender);
        depositAndTransferWETH(address(pair),msg.value);
        emit rateChanged(address(pair), pair.rate());
    }

    function swapTokenToETH(
        address _tokenAddress,
        uint256 _tokenAmount,
        uint256 _ethAmountMin
    ) external payable override {
        JupyterCoreV1 pair = _existingPair(_tokenAddress);
        uint256 withdrawalAmount = pair.swapToken1ToToken0(
            _tokenAmount,
            _ethAmountMin,
            msg.sender
        );

        IERC20(pair.token1()).safeTransferFrom(
            msg.sender,
            address(pair),
            _tokenAmount
        );
        withdrawAndTransferETH(withdrawalAmount);

        emit rateChanged(address(pair), pair.rate());
    }


    function getToken1AmountFromToken0Amount(
        address _token1Address,
        uint256 amount
    ) external view override returns (uint256) {
        JupyterCoreV1 pair = _existingPair(_token1Address);
        return pair.getToken1AmountFromToken0Amount(amount);
    }

    function getToken0AmountFromToken1Amount(
        address _token1Address,
        uint256 amount
    ) external view override returns (uint256) {
        JupyterCoreV1 pair = _existingPair(_token1Address);
        return pair.getToken0AmountFromToken1Amount(amount);
    }

    function getRate(address token1Address)
        external
        view
        existingPair(wbnb, token1Address)
        returns (uint256)
    {
        return pairs[wbnb][token1Address].rate();
    }

    function getBalance(address token1Address)
        external
        view
        existingPair(wbnb, token1Address)
        returns (uint256)
    {
        return pairs[wbnb][token1Address].balanceOf(msg.sender);
    }

    function _existingPair(address _token1Address)
        internal
        view
        returns (JupyterCoreV1)
    {
        require(
            address(pairs[wbnb][_token1Address]) != address(0),
            "Pair does not exist"
        );
        return pairs[wbnb][_token1Address];
    }

    function getDepositAmount(address _token1Address, uint256 _amount)
        external
        view
        override
        returns (uint256)
    {
        JupyterCoreV1 pair = _existingPair(_token1Address);
        return (_amount * 10**18) / pair.rate();
    }

    function getSwapTokenTotalSupply(address _token1Address)
        external
        view
        override
        returns (uint256)
    {
        JupyterCoreV1 pair = _existingPair(_token1Address);
        return pair.totalSupply();
    }

    function getTokenBalances(address _token1Address)
        external
        view
        override
        returns (uint256, uint256)
    {
        return (
            IERC20(wbnb).balanceOf(msg.sender),
            IERC20(_token1Address).balanceOf(msg.sender)
        );
    }

    function getPoolBalances(address _token1Address)
        external
        view
        returns (uint256, uint256)
    {
        JupyterCoreV1 pair = _existingPair(_token1Address);
        return (
            IERC20(wbnb).balanceOf(address(pair)),
            IERC20(_token1Address).balanceOf(address(pair))
        );
    }

    //---------------TESTING REMOVE BEFORE DEPLOY

    function getAddress(address _token1Address)
        external
        view
        returns (address)
    {
        JupyterCoreV1 pair = _existingPair(_token1Address);
        return address(pair);
    }
}
