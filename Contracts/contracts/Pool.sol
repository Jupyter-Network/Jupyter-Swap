pragma solidity ^0.8.13;

import "./libraries/Fees.sol";
import "./libraries/PriceMath.sol";
import "./libraries/Transfer.sol";
import "./libraries/Liquidity.sol";
import "./libraries/PositionCallback.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IPool.sol";

contract JupyterSwapPool is IJupyterSwapPool {
    int24 public currentTick;
    uint256 public currentSqrtPrice;
    uint256 collectedProtocolFees0 = 0;
    uint256 collectedProtocolFees1 = 0;

    using SafeERC20 for IERC20;
    address immutable router;
    address public immutable token0;
    address public immutable token1;
    address immutable WETH;
    uint256 positionId = 0;

    uint256 feeGlobal0 = 0;
    uint256 feeGlobal1 = 0;
    event Swap(
        address Pool,
        address From_Token,
        address To_Token,
        uint256 In,
        uint256 out
    );

    struct SwapData {
        uint256 inAmount;
        uint256 outAmount;
        uint256 remainingAmount;
        int24 startTick;
        int24 endTick;
        uint256 startPrice;
        uint128 endPrice;
        uint256 feesPaid;
    }
    //struct Quote {
    //    uint256 amountIn;
    //    uint256 amountOut;
    //}

    using Tick for int24;

    using BitMap for mapping(int16 => uint256);
    mapping(int16 => uint256) map;

    using LiquidityManager for mapping(uint256 => LiquidityManager.Position);
    mapping(uint256 => LiquidityManager.Position) public positions;
    mapping(int24 => LiquidityManager.TickState) public ticks;
    uint128 public liquidity = 0;

    uint256 immutable feeMultiplier;

    modifier isRouter() {
        require(msg.sender == router, "Not router");
        _;
    }

    constructor(
        uint256 _feeMultiplier,
        address _token0,
        address _token1,
        int24 _startTick,
        address _sender,
        address _WETH
    ) {
        token0 = _token0;
        token1 = _token1;
        WETH = _WETH;

        router = _sender;
        feeMultiplier = _feeMultiplier;
        currentTick = _startTick; //Tick.SPACING * 35;
        currentSqrtPrice = Tick.getPriceFromTick(currentTick);
        //addPosition(-887232, 887232, 1000000, _sender);
    }

    function swap(
        uint256 _in,
        int24 _limitTick,
        address _sender
    ) external override isRouter {
        int24 _currentTick = currentTick;
        SwapData memory currentSwap = SwapData(
            0,
            0,
            _in,
            _currentTick,
            0,
            currentSqrtPrice,
            0,
            0
        );

        uint256 _currentSqrtPrice = currentSqrtPrice;
        int24 tempTick = 0;
        //Swap ZERO TO ONE
        if (_limitTick < _currentTick) {
            while (
                currentSwap.remainingAmount > 0 && _currentTick >= _limitTick
            ) {
                _currentTick = getNextWhileNotInitialized(_currentTick);

                uint256 nextPrice = Tick.getPriceFromTick(_currentTick);
                (
                    uint256 amountIn,
                    uint256 amountOut,
                    uint256 priceAfterSwap,
                    uint256 fees
                ) = PriceMath.swap(
                        PriceMath.SwapParams(
                            uint160(_currentSqrtPrice),
                            nextPrice,
                            uint128(liquidity),
                            currentSwap.remainingAmount
                        )
                    );

                currentSwap.inAmount += amountIn + fees;

                currentSwap.remainingAmount -= amountIn + fees;
                currentSwap.outAmount += amountOut;
                currentSwap.feesPaid += fees;

                uint256 protocolFee = fees / 200;
                fees -= protocolFee;
                collectedProtocolFees0 += protocolFee;

                feeGlobal0 += Math.mulDiv(
                    fees,
                    0x100000000000000000000000000000000,
                    liquidity
                );

                if (priceAfterSwap <= nextPrice) {
                    //Update fees
                    ticks[_currentTick].feesOutside0 =
                        feeGlobal0 -
                        ticks[_currentTick].feesOutside0;
                    ticks[_currentTick].feesOutside1 =
                        feeGlobal1 -
                        ticks[_currentTick].feesOutside1;
                    liquidity = uint128(
                        int128(liquidity) - ticks[_currentTick].liquidityNet
                    );
                    _currentTick = getNextWhileNotInitialized(
                        _currentTick - Tick.SPACING
                    );
                }
                _currentSqrtPrice = priceAfterSwap;
            }
            currentSwap.endPrice = uint128(_currentSqrtPrice);
            currentSwap.endTick = _currentTick;
            require(currentSwap.remainingAmount <= 1, "Limit reached");
            uint256 balance0Before = IERC20(token0).balanceOf(address(this));
            IPositionCallback(msg.sender).swapCallback(
                currentSwap.inAmount,
                token0,
                _sender
            );

            uint256 balance0After = IERC20(token0).balanceOf(address(this));
            require(
                balance0After >= balance0Before + currentSwap.inAmount,
                "Wrong amount"
            );
            transferOut(token1, _sender, currentSwap.outAmount);

            //IERC20(token1).safeTransfer(_sender, currentSwap.outAmount);
        }
        //Swap ONE TO ZERO
        else {
            while (
                currentSwap.remainingAmount > 0 && _currentTick <= _limitTick
            ) {
                (int24 next, bool init) = getNextInitialized(
                    tempTick == 0 ? _currentTick : tempTick,
                    Tick.SPACING,
                    false
                );

                tempTick = 0;

                //check if tick is initialized else skip
                if (!init) {
                    //_currentTick += Tick.SPACING;
                    tempTick = next;
                    continue;
                }

                uint256 nextPrice = Tick.getPriceFromTick(next);

                (
                    uint256 amountIn,
                    uint256 amountOut,
                    uint256 priceAfterSwap,
                    uint256 fees
                ) = PriceMath.swap(
                        PriceMath.SwapParams(
                            uint160(_currentSqrtPrice),
                            nextPrice,
                            uint128(liquidity),
                            currentSwap.remainingAmount
                        )
                    );
                currentSwap.inAmount += amountIn + fees;
                if (amountIn + fees <= currentSwap.remainingAmount) {
                    currentSwap.remainingAmount -= amountIn + fees;
                } else {
                    currentSwap.remainingAmount = 0;
                }
                currentSwap.outAmount += amountOut;
                currentSwap.feesPaid += fees;

                uint256 protocolFee = fees / 200;
                fees -= protocolFee;
                collectedProtocolFees1 += protocolFee;

                feeGlobal1 += Math.mulDiv(
                    fees,
                    0x100000000000000000000000000000000,
                    liquidity
                );

                if (priceAfterSwap >= nextPrice) {
                    //Update fees
                    ticks[next].feesOutside1 =
                        feeGlobal1 -
                        ticks[next].feesOutside1;
                    ticks[next].feesOutside0 =
                        feeGlobal0 -
                        ticks[next].feesOutside0;
                    _currentTick = next;
                    //Update liquidity
                    liquidity = addDelta(
                        liquidity,
                        ticks[_currentTick].liquidityNet
                    );
                }
                _currentSqrtPrice = priceAfterSwap;
            }
            currentSwap.endPrice = uint128(_currentSqrtPrice);
            currentSwap.endTick = _currentTick;
            require(currentSwap.remainingAmount <= 1, "Limit reached");

            uint256 balance1Before = IERC20(token1).balanceOf(address(this));

            IPositionCallback(msg.sender).swapCallback(
                currentSwap.inAmount,
                token1,
                _sender
            );

            uint256 balance1After = IERC20(token1).balanceOf(address(this));
            require(
                balance1Before == balance1After - currentSwap.inAmount,
                "Wrong amount"
            );
            transferOut(token0, _sender, currentSwap.outAmount);

            //IERC20(token0).safeTransfer(_sender, currentSwap.outAmount);
        }

        currentSqrtPrice = _currentSqrtPrice;
        currentTick = _currentTick;
        emit Swap(
            address(this),
            token0,
            token1,
            currentSwap.inAmount,
            currentSwap.outAmount
        );
    }

    function swapQuote(
        uint256 _in,
        int24 _limitTick,
        bool _exactIn
    ) external view override returns (Quote memory) {
        int24 tempTick = 0;
        int24 _currentTick = currentTick;
        int24 next;
        bool init;
        uint128 l = liquidity;
        uint256 _currentSqrtPrice = currentSqrtPrice;
        uint256 nextPrice;
        SwapData memory currentSwap = SwapData(
            0,
            0,
            _in,
            currentTick,
            0,
            currentSqrtPrice,
            0,
            0
        );
        PriceMath.SwapCache memory cache; // = PriceMath.SwapCache(0, 0, 0, 0);

        //Swap ZERO TO ONE
        if (_limitTick < _currentTick) {
            while (
                currentSwap.remainingAmount > 0 && _currentTick >= _limitTick
            ) {
                _currentTick = getNextWhileNotInitialized(_currentTick);
                nextPrice = Tick.getPriceFromTick(_currentTick);
                cache = PriceMath.swaps(
                    PriceMath.SwapParams(
                        uint160(_currentSqrtPrice),
                        nextPrice,
                        l,
                        currentSwap.remainingAmount
                    ),
                    _exactIn
                );

                currentSwap.inAmount += cache.amountIn + cache.fees;

                currentSwap.remainingAmount -= cache.amountIn + cache.fees;
                currentSwap.outAmount += cache.amountOut;
                currentSwap.feesPaid += cache.fees;

                if (cache.priceAfterSwap <= nextPrice) {
                    //Update fees

                    l = uint128(int128(l) - ticks[_currentTick].liquidityNet);
                    _currentTick = getNextWhileNotInitialized(
                        _currentTick - Tick.SPACING
                    );
                }
                _currentSqrtPrice = cache.priceAfterSwap;
            }
        }
        //Swap ONE TO ZERO
        else {
            while (
                currentSwap.remainingAmount > 0 && _currentTick <= _limitTick
            ) {
                (next, init) = getNextInitialized(
                    tempTick == 0 ? _currentTick : tempTick,
                    Tick.SPACING,
                    false
                );

                tempTick = 0;

                //check if tick is initialized else skip
                if (!init) {
                    //_currentTick += Tick.SPACING;
                    tempTick = next;
                    continue;
                }

                nextPrice = Tick.getPriceFromTick(next);

                cache = PriceMath.swaps(
                    PriceMath.SwapParams(
                        uint160(_currentSqrtPrice),
                        nextPrice,
                        l,
                        currentSwap.remainingAmount
                    ),
                    _exactIn
                );
                currentSwap.inAmount += cache.amountIn + cache.fees;
                if (
                    cache.amountIn + cache.fees <= currentSwap.remainingAmount
                ) {
                    currentSwap.remainingAmount -= cache.amountIn + cache.fees;
                } else {
                    currentSwap.remainingAmount = 0;
                }
                currentSwap.outAmount += cache.amountOut;
                currentSwap.feesPaid += cache.fees;

                if (cache.priceAfterSwap >= nextPrice) {
                    //Update fees

                    _currentTick = next;
                    //Update liquidity
                    l = addDelta(l, ticks[_currentTick].liquidityNet);
                }

                _currentSqrtPrice = cache.priceAfterSwap;
            }
        }
        //outAmount = currentSwap.outAmount;
        //inAmount = currentSwap.inAmount;
        Quote memory quote = Quote(currentSwap.inAmount, currentSwap.outAmount);
        return quote;
    }

    function getCollectedFees(uint256 _positionId)
        external
        view
        override
        returns (uint256 amount0, uint256 amount1)
    {
        (amount0, amount1) = positions.getCollectedFees(
            ticks,
            _positionId,
            feeGlobal0,
            feeGlobal1,
            currentTick
        );
    }

    function addPosition(
        int24 _startTick,
        int24 _endTick,
        uint128 _amount,
        uint256 _lpId,
        address _sender
    ) external override isRouter {
        uint256 amount0;
        uint256 amount1;
        require(
            positions[_lpId].owner == address(0),
            "Liquidity ID already exists"
        );
        (liquidity, amount0, amount1) = positions.addPosition(
            ticks,
            map,
            LiquidityManager.NewPositionParameter(
                _lpId,
                _startTick,
                _endTick,
                currentTick,
                _amount,
                liquidity,
                feeGlobal0,
                feeGlobal1,
                currentSqrtPrice,
                _sender
            )
        );

        //uint256 balance0Before = IERC20(token0).balanceOf(address(this));
        //uint256 balance1Before = IERC20(token1).balanceOf(address(this));
        IPositionCallback(msg.sender).addPositionCallback(
            amount0,
            amount1,
            token0,
            token1,
            _sender
        );
        //uint256 balance0After = IERC20(token0).balanceOf(address(this));
        //uint256 balance1After = IERC20(token1).balanceOf(address(this));
        //require(
        //    balance0After == balance0Before + amount0,
        //    "Wrong amount0 sent"
        //);
        //require(
        //    balance1After == balance1Before + amount1,
        //    "Wrong amount1 sent"
        //);

        emit PositionCallback.Add_Position(liquidity, positionId);
    }

    function addPositionView(
        int24 _startTick,
        int24 _endTick,
        uint128 _amount
    )
        external
        view
        override
        returns (uint256 token0Amount, uint256 token1Amount)
    {
        uint256 amount0;
        uint256 amount1;

        (token0Amount, token1Amount) = positions.addPositionView(
            ticks,
            map,
            LiquidityManager.NewPositionParameter(
                positionId,
                _startTick,
                _endTick,
                currentTick,
                _amount,
                liquidity,
                feeGlobal0,
                feeGlobal1,
                currentSqrtPrice,
                address(0)
            )
        );
    }

    function removePosition(uint256 _positionId, address _sender)
        external
        override
        isRouter
    {
        (
            uint128 l,
            uint256 amountToCollect0,
            uint256 amountToCollect1
        ) = positions.removePosition(
                ticks,
                map,
                LiquidityManager.RemovePositionParameter(
                    _positionId,
                    currentTick,
                    liquidity,
                    feeGlobal0,
                    feeGlobal1,
                    currentSqrtPrice,
                    _sender
                )
            );

        liquidity = l;

        if (amountToCollect0 > 0) {
            transferOut(token0, _sender, amountToCollect0);
        }
        if (amountToCollect1 > 0) {
            transferOut(token1, _sender, amountToCollect1);
        }
        emit PositionCallback.Remove_Position(l, _positionId);
    }

    function withdrawUncollectedFees(uint256 _positionId)
        external
        override
        isRouter
    {
        (uint256 collectedFees0, uint256 collectedFees1) = LiquidityManager
            .getCollectedFees(
                positions,
                ticks,
                _positionId,
                feeGlobal0,
                feeGlobal1,
                currentTick
            );
        if (collectedFees0 > 0) {
            transferOut(token0, positions[_positionId].owner, collectedFees0);
        }
        if (collectedFees1 > 0) {
            transferOut(token1, positions[_positionId].owner, collectedFees1);
        }
        positions[_positionId].globalFees0 = feeGlobal0;
        positions[_positionId].globalFees1 = feeGlobal1;
    }

    function withdrawUncollectedProtocolFees() external override isRouter {
        //TODO Only allow factory to call this method
        uint256 collected0 = collectedProtocolFees0;
        uint256 collected1 = collectedProtocolFees1;

        collectedProtocolFees0 = 0;
        collectedProtocolFees1 = 0;

        if (collected0 > 0) {
            Transfer.safeTransferOut(token0, collected0, msg.sender);
        }
        if (collected1 > 0) {
            Transfer.safeTransferOut(token1, collected1, msg.sender);
        }
    }

    function addDelta(uint128 x, int128 y) internal pure returns (uint128 z) {
        if (y < 0) {
            require((z = x - uint128(-y)) < x);
        } else {
            require((z = x + uint128(y)) >= x);
        }
    }

    function getNextInitialized(
        int24 _tick,
        int24 _tickSpacing,
        bool _lte
    ) internal view returns (int24 next, bool initialized) {
        (next, initialized) = map.nextInitializedTickWithinOneWord(
            _tick,
            _tickSpacing,
            _lte
        );
        require(next.check(), "MinMaxTickReached");
    }

    function getNextWhileNotInitialized(int24 _currentTick)
        internal
        view
        returns (int24)
    {
        (int24 next, bool init) = getNextInitialized(
            _currentTick,
            Tick.SPACING,
            true
        );
        while (!init) {
            (next, init) = getNextInitialized(
                next - Tick.SPACING,
                Tick.SPACING,
                true
            );
        }
        return next;
    }

    function getFlag(int24 _tick) internal view returns (uint256) {
        return map.getFlagAtTick(_tick, Tick.SPACING);
    }

    function snapshot(int24 _tick)
        public
        view
        returns (
            uint128 _liquidity,
            uint256 currentPrice,
            uint256 tickLiquidity,
            int128 tickLiquidityNet
        )
    {
        _liquidity = liquidity;
        currentPrice = currentSqrtPrice;
        tickLiquidity = ticks[_tick].liquidity;
        tickLiquidityNet = ticks[_tick].liquidityNet;
    }

    function transferOut(
        address _token,
        address _to,
        uint256 _amount
    ) internal {
        if (_token == WETH) {
            IWETH(WETH).withdraw(_amount);
            payable(_to).transfer(_amount);
        } else {
            //IERC20(_token).transfer(_to,_amount);
            Transfer.safeTransferOut(_token, _amount, _to);
        }
    }

    receive() external payable {}

    fallback() external payable {}
}
