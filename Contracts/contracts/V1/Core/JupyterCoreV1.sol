// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./JupyterLiquidityTokenV1.sol";
import "./JupyterCoreHelperV1.sol";

contract JupyterCoreV1 is JupyterCoreHelperV1,JupyterLiquidityTokenV1 {
    using SafeERC20 for IERC20;
    address Router;
    modifier minValue(uint256 _amount) {
        require(_amount > _minAmount, "amount lower than min. amount!");
        _;
    }

    modifier calledByRouter() {
        require(msg.sender == Router, "Denied can only be accessed by router");
        _;
    }

    uint256 public token0Balance;
    uint256 public token1Balance;

    address vaultAddress;

    bool private initialDepositDone = false;

    IERC20 public token0;
    IERC20 public token1;

    constructor(
        address _token0,
        address _token1,
        address _protocolAddress
    ) {
        Router = msg.sender;
        require(
            _token0 != address(0) &&
                _token1 != address(0) &&
                _protocolAddress != address(0),
            "Zero address not allowed"
        );
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        vaultAddress = _protocolAddress;
    }

    function initialDeposit(
        uint256 _token0Amount,
        uint256 _token1Amount,
        address from
    ) external calledByRouter minValue(_token0Amount) minValue(_token1Amount) {
        //Checks
        require(!initialDepositDone, "already done use deposit()");
        //Effects
        mint(_token0Amount * _token1Amount, from);
        initialDepositDone = true;
        //Interactions
        _rcvTokens(token0, _token0Amount, from);
        _rcvTokens(token1, _token1Amount, from);
    }

    //---Deposit and withdraw
    function deposit(
        uint256 _token0Amount,
        uint256 _token1Amount,
        address from
    ) external calledByRouter minValue(_token0Amount) minValue(_token1Amount) {
        //Checks
        require(
            _token1Amount == _scaleUp(_token0Amount) / rate(),
            "Wrong amount of tokens sent"
        );
        //Effects
        mint((totalSupply * _token0Amount) / token1Balance, from);
        //Interactions
        _rcvTokens(token1, _scaleUp(_token0Amount) / rate(), from);
        _rcvTokens(token0, _token0Amount, from);
    }

    function withdraw(address from) external calledByRouter {
        //Check
        uint256 userTokenBalance = balanceOf[from];
        require(userTokenBalance > 0, "Nothing to withdraw");
        //Effects
        (uint256 token0Withdrawal, uint256 token1Withdrawal) = getBalances(
            from
        );

        burn(userTokenBalance, from);
        token0Balance -= token0Withdrawal;
        token1Balance -= token1Withdrawal;

        //Interactions
        token0.safeTransfer(from, token0Withdrawal);
        token1.safeTransfer(from, token1Withdrawal);
    }

    //---Trade
    function swapToken0ToToken1(
        uint256 _token0Amount,
        uint256 _token1AmountMin,
        address from
    ) external calledByRouter minValue(_token0Amount) {
        //Checks
        uint256 token1Withdrawal = getToken1AmountFromToken0Amount(
            _token0Amount
        );
        require(token1Withdrawal >= _token1AmountMin, "Price changed");

        //Effects
        token1Balance -= token1Withdrawal;
        _sendProtocolFeeToken1(token1Withdrawal);

        //Interactions
        _rcvTokens(token0, _token0Amount, from);
        token1.safeTransfer(from, token1Withdrawal);
    }

    function swapToken1ToToken0(
        uint256 _token1Amount,
        uint256 _token0AmountMin,
        address from
    ) external calledByRouter minValue(_token1Amount) {
        //Checks
        uint256 tokenWithdrawal = getToken0AmountFromToken1Amount(
            _token1Amount
        );
        require(tokenWithdrawal >= _token0AmountMin, "Price changed");

        //Effects
        token0Balance -= tokenWithdrawal;
        _sendProtocolFeeToken0(tokenWithdrawal);

        //Interactions
        _rcvTokens(token1, _token1Amount, from);
        token0.safeTransfer(from, tokenWithdrawal);
    }

    function getToken1AmountFromToken0Amount(uint256 tokenAmount)
        public
        view
        calledByRouter
        returns (uint256)
    {
        return
            _subtractFee(
                (tokenAmount * token1Balance) / (token0Balance + tokenAmount)
            );
    }

    function getToken0AmountFromToken1Amount(uint256 tokenAmount)
        public
        view
        calledByRouter
        returns (uint256)
    {
        return
            _subtractFee(
                (tokenAmount * token0Balance) / (token1Balance + tokenAmount)
            );
    }

    //---helper
    function _rcvTokens(
        IERC20 token,
        uint256 amount,
        address from
    ) private {
        //Checks
        require(token.balanceOf(from) >= amount, "Your balance is too too low");
        require(_minAmount <= amount, "Sent amount too low");
        //Effects
        if (address(token) == address(token0)) {
            token0Balance += amount;
        } else if (address(token) == address(token1)) {
            token1Balance += amount;
        }
    }

    function rate() public view calledByRouter returns (uint256) {
        return _scaleUp(token0Balance) / token1Balance;
    }

    function _subtractFee(uint256 value) private pure returns (uint256) {
        return (value * (_scaleFactor - _percentFee)) / _scaleFactor;
    }

    function _sendProtocolFeeToken0(uint256 value) private {
        uint256 amount = _scaleDown(value * _protocolFee);
        mint((totalSupply / (2 * token1Balance)) * amount, vaultAddress);
    }

    function _sendProtocolFeeToken1(uint256 value) private {
        uint256 amount = _scaleDown(value * _protocolFee);
        mint((totalSupply / (2 * token0Balance)) * amount, vaultAddress);
    }

    function getBalances(address from)
        public
        view
        calledByRouter
        returns (uint256, uint256)
    {
        uint256 userTokenBalance = balanceOf[from];
        uint256 partOfPool = totalSupply / userTokenBalance;
        uint256 token0Withdrawal = token0Balance / partOfPool;
        uint256 token1Withdrawal = token1Balance / partOfPool;
        return (token0Withdrawal, token1Withdrawal);
    }
}
