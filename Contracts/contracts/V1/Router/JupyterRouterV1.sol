// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../Core/JupyterCoreV1.sol";
import "./IJupyterRouterV1.sol";
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

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "Deadline reached");
        _;
    }

    event CreateLiquidityPool(address token, address pool, uint256 rate);
    event AddLiquidity(
        address pool,
        uint256 token0Balance,
        uint256 token1Balance,
        uint256 lpTotalSupply
    );
    event RemoveLiquidity(
        address pool,
        uint256 token0Balance,
        uint256 token1Balance,
        uint256 lpTotalSupply
    );

    event ClosePool(address pool);

    event ExchangeTokens(
        address from,
        address to,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 rate
    );

    mapping(address => mapping(address => JupyterCoreV1)) public pairs;
    address vaultAddress;
    address wbnb;

    constructor(address _protocolAddress, address _wbnb) {
        //require(_protocolAddress != address(0), "Zero address not allowed");
        vaultAddress = _protocolAddress;
        wbnb = _wbnb;
    }

    receive() external payable {
        require(msg.sender == wbnb);
    }

    function withdrawAndTransferETH(uint256 _amount, address _to) private {
        IWETH(wbnb).withdraw(_amount);
        payable(_to).transfer(_amount);
    }

    function depositAndTransferWETH(address pair, uint256 value) private {
        IWETH(wbnb).deposit{value: value}();
        IERC20(wbnb).transfer(pair, value);
    }

    function createLiquidityPool(
        address _token1Address,
        uint256 _token1Amount,
        uint256 deadline
    ) external payable override ensure(deadline) {
        require(
            address(pairs[wbnb][_token1Address]) == address(0),
            "Pair exists"
        );

        JupyterCoreV1 newPool = new JupyterCoreV1(
            wbnb,
            _token1Address,
            vaultAddress
        );
        pairs[address(wbnb)][_token1Address] = newPool;
        pairs[_token1Address][address(wbnb)] = newPool;

        newPool.initialDeposit(msg.value, _token1Amount, msg.sender);
        IERC20(_token1Address).safeTransferFrom(
            msg.sender,
            address(newPool),
            _token1Amount
        );

        depositAndTransferWETH(address(newPool), msg.value);

        emit CreateLiquidityPool(
            _token1Address,
            address(newPool),
            newPool.rate()
        );
        emit AddLiquidity(
            address(newPool),
            newPool.token0Balance(),
            newPool.token1Balance(),
            newPool.totalSupply()
        );
    }

    function addLiquidity(
        address _token1Address,
        uint256 _token1Amount,
        uint256 deadline
    ) external payable override ensure(deadline) {
        JupyterCoreV1 pair = pairs[wbnb][_token1Address];
        pair.deposit(msg.value, _token1Amount, msg.sender);
        depositAndTransferWETH(address(pair), msg.value);
        IERC20(pair.token1()).safeTransferFrom(
            msg.sender,
            address(pair),
            _token1Amount
        );

        emit AddLiquidity(
            address(pair),
            pair.token0Balance(),
            pair.token1Balance(),
            pair.totalSupply()
        );
    }

    function removeLiquidity(
        address _token1Address,
        uint256 _withdrawalAmount,
        uint256 deadline
    ) external override ensure(deadline) {
        JupyterCoreV1 pair = _existingPair(_token1Address);
        uint256 bnbToWithdraw = pair.withdraw(msg.sender, _withdrawalAmount);
        withdrawAndTransferETH(bnbToWithdraw, msg.sender);

        emit RemoveLiquidity(
            address(pair),
            pair.token0Balance(),
            pair.token1Balance(),
            pair.totalSupply()
        );
        if (pair.token0Balance() == 0) {
            emit ClosePool(address(pair));
            pair.closePool();
            delete pairs[wbnb][_token1Address];
            //TODO: delete reversed pair [_token1Address][wbnb]
        }
    }

    function swapETHToToken(
        address _tokenAddress,
        uint256 _tokenAmountMin,
        uint256 deadline
    ) external payable override ensure(deadline) {
        JupyterCoreV1 pair = _existingPair(_tokenAddress);
        uint256 received = pair.swapToken0ToToken1(
            msg.value,
            _tokenAmountMin,
            msg.sender
        );
        depositAndTransferWETH(address(pair), msg.value);
        emit ExchangeTokens(
            wbnb,
            _tokenAddress,
            msg.value,
            received,
            pair.rate()
        );
        //emit rateChanged(address(pair), pair.rate());
    }

    function swapTokenToETH(
        address _tokenAddress,
        uint256 _tokenAmount,
        uint256 _ethAmountMin,
        uint256 deadline
    ) external payable override ensure(deadline) {
        JupyterCoreV1 pair = _existingPair(_tokenAddress);
        uint256 withdrawalAmount = pair.swapToken1ToToken0(
            _tokenAmount,
            _ethAmountMin,
            address(this)
        );

        IERC20(_tokenAddress).safeTransferFrom(
            msg.sender,
            address(pair),
            _tokenAmount
        );
        withdrawAndTransferETH(withdrawalAmount, msg.sender);

        emit ExchangeTokens(
            _tokenAddress,
            wbnb,
            _tokenAmount,
            withdrawalAmount,
            pair.rate()
        );
    }

    function getToken1AmountFromToken0Amount(
        address _token1Address,
        uint256 amount
    ) external view override returns (uint256) {
        JupyterCoreV1 pair = _existingPair(_token1Address);
        return pair.t1FromT0(amount);
    }

    function getToken0AmountFromToken1Amount(
        address _token1Address,
        uint256 amount
    ) external view override returns (uint256) {
        JupyterCoreV1 pair = _existingPair(_token1Address);
        return pair.t0FromT1(amount);
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
        //require(
        //    address(pairs[wbnb][_token1Address]) != address(0),
        //    "Pair does not exist"
        //);
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

    function getLPTotalSupply(address _token1Address)
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
            pair.token0Balance(),
            pair.token1Balance()
            //IERC20(wbnb).balanceOf(address(pair)),
            //IERC20(_token1Address).balanceOf(address(pair))
        );
    }

    //--------------DEV
    function swapTokens(
        address _fromToken,
        address _toToken,
        uint256 _fromAmount,
        uint256 _toMinAmount,
        uint256 deadline
    ) public {
        require(_fromToken != wbnb, "Function does not swap bnb");
        JupyterCoreV1 token0Wbnb = _existingPair(_fromToken);
        require(address(token0Wbnb) != address(0x00), "Token not listed");
        JupyterCoreV1 token1Wbnb = _existingPair(_toToken);
        require(address(token1Wbnb) != address(0x00), "Token not listed");

        //From
        uint256 wbnbMinAmount = token0Wbnb.t0FromT1(_fromAmount);
        uint256 wbnbAmount = token0Wbnb.swapToken1ToToken0(
            _fromAmount,
            wbnbMinAmount,
            address(token1Wbnb)
        );

        //require(toAmountMin >= _toMinAmount,"Price changed");
        uint256 receivedAmount = token1Wbnb.swapToken0ToToken1(
            wbnbAmount,
            _toMinAmount,
            address(this)
        );

        IERC20(_fromToken).safeTransferFrom(
            msg.sender,
            address(token0Wbnb),
            _fromAmount
        );
        //IERC20(wbnb).safeTransfer(address(token1Wbnb), wbnbAmount);
        //require(receivedAmount >= _toMinAmount,"Price changed");
        IERC20(_toToken).safeTransfer(msg.sender, receivedAmount);

        emit ExchangeTokens(
            _fromToken,
            wbnb,
            _fromAmount,
            wbnbAmount,
            token0Wbnb.rate()
        );
        emit ExchangeTokens(
            wbnb,
            _toToken,
            wbnbAmount,
            receivedAmount,
            token1Wbnb.rate()
        );
    }

    function getTokenToTokenQuote(
        address _fromToken,
        address _toToken,
        uint256 _fromAmount
    ) public view returns (uint256) {
        require(_fromToken != wbnb, "Function does not swap bnb");
        JupyterCoreV1 token0Wbnb = _existingPair(_fromToken);
        require(address(token0Wbnb) != address(0x00), "Token not listed");
        JupyterCoreV1 token1Wbnb = _existingPair(_toToken);
        require(address(token1Wbnb) != address(0x00), "Token not listed");

        //From
        uint256 wbnbAmount = token0Wbnb.t0FromT1(_fromAmount);

        //To
        uint256 toAmountMin = token1Wbnb.t1FromT0(wbnbAmount);
        return toAmountMin;
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
