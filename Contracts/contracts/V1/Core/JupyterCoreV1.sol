// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./JupyterLiquidityTokenV1.sol";
import "./JupyterCoreHelperV1.sol";
import "./IJupyterCoreV1.sol";

contract JupyterCoreV1 is
    IJupyterCoreV1,
    JupyterCoreHelperV1,
    JupyterLiquidityTokenV1
{
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
    )
        external
        override
        calledByRouter
        minValue(_token0Amount)
        minValue(_token1Amount)
    {
        //Checks
        require(!initialDepositDone, "already done use deposit()");
        //Effects
        mint(_token0Amount * _token1Amount, from);
        initialDepositDone = true;
        //Interactions
        _rcvTokens(token0, _token0Amount);
        _rcvTokens(token1, _token1Amount);
    }

    //---Deposit and withdraw
    function deposit(
        uint256 _token0Amount,
        uint256 _token1Amount,
        address from
    )
        external
        override
        calledByRouter
        minValue(_token0Amount)
        minValue(_token1Amount)
    {
        //Checks
        require(
            _token1Amount <= _scaleUp(_token0Amount + 1000) / rate() &&
                _token1Amount >= _scaleUp(_token0Amount - 1000) / rate(),
            "Wrong amount of tokens sent"
        );
        //Effects
        mint((totalSupply() / token0Balance) * _token0Amount, from);
        //Interactions
        _rcvTokens(token1, _scaleUp(_token0Amount) / rate());
        _rcvTokens(token0, _token0Amount);
    }

    function withdraw(address from, uint256 _withdrawalAmount)
        external
        override
        calledByRouter
        returns (uint256)
    {
        //Check
        uint256 userTokenBalance = balanceOf(from);
        require(userTokenBalance >= _withdrawalAmount, "Balance too low");
        //Effects
        uint256 partOfPool = totalSupply() / _scaleDown(_withdrawalAmount);
        uint256 token0Withdrawal = _scaleUp(token0Balance) / partOfPool;
        uint256 token1Withdrawal = _scaleUp(token1Balance) / partOfPool;

        token0Balance -= token0Withdrawal;
        token1Balance -= token1Withdrawal;


        burn(_withdrawalAmount, from);

        //Interactions
        token0.safeTransfer(Router, token0Withdrawal);
        token1.safeTransfer(from, token1Withdrawal);

        return token0Withdrawal;
    }

    function closePool() external calledByRouter {
        if (totalSupply() <= 0) {
            selfdestruct(payable(vaultAddress));
        }
    }

    //---Trade
    function swapToken0ToToken1(
        uint256 _token0Amount,
        uint256 _token1AmountMin,
        address from
    )
        external
        override
        calledByRouter
        minValue(_token0Amount)
        returns (uint256)
    {
        //Checks
        uint256 token1Withdrawal = t1FromT0(_token0Amount);
        uint256 protocolFee = _scaleDown(token1Withdrawal * _protocolFee);

        require(token1Withdrawal >= _token1AmountMin, "Price changed");

        //Effects
        token1Balance -= token1Withdrawal + protocolFee;
        token0Balance += _token0Amount;

        //Interactions

        //Protocol fee
        token1.safeTransfer(vaultAddress, protocolFee);

        token1.safeTransfer(from, token1Withdrawal);
        return token1Withdrawal;
    }

    function swapToken1ToToken0(
        uint256 _token1Amount,
        uint256 _token0AmountMin,
        address from
    )
        external
        override
        calledByRouter
        minValue(_token1Amount)
        returns (uint256)
    {
        //Checks
        uint256 tokenWithdrawal = t0FromT1(_token1Amount);
        uint256 protocolFee = _scaleDown(tokenWithdrawal * _protocolFee);

        require(tokenWithdrawal >= _token0AmountMin, "Price changed");
        ////Effects

        token0Balance -= tokenWithdrawal + protocolFee;
        token1Balance += _token1Amount;

        ////Interactions
        //Protocol Fee
        token0.safeTransfer(vaultAddress, protocolFee);

        token0.safeTransfer(from, tokenWithdrawal);
        return tokenWithdrawal;
    }

    function t1FromT0(uint256 tokenAmount)
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

    function t0FromT1(uint256 tokenAmount)
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
    function _rcvTokens(IERC20 token, uint256 amount) private {
        //Checks
        // require(token.balanceOf(from) >= amount, "Your balance is too too low");
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
        return _scaleDown(value * _feeMultiplier);
    }



    function getBalances(address from)
        public
        view
        calledByRouter
        returns (uint256, uint256)
    {
        uint256 userTokenBalance = balanceOf(from);
        uint256 partOfPool = totalSupply() / userTokenBalance;
        uint256 token0Withdrawal = token0Balance / partOfPool;
        uint256 token1Withdrawal = token1Balance / partOfPool;
        return (token0Withdrawal, token1Withdrawal);
    }

}
