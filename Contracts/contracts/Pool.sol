pragma solidity ^0.8.13;

import "./libraries/Fees.sol";
import "./libraries/PriceMath.sol";
import "./libraries/Transfer.sol";
import "./libraries/Liquidity.sol";
import "./libraries/PositionCallback.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IPool.sol";
import "./libraries/Shared.sol";

error WrongAmount();
error Limit();
error Slippage();
error NotRouter();
error PosExists();
error NotInitialized();

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
        uint256 feeGlobal;
        uint128 protocolFees;
    }

    using Tick for int24;

    using BitMap for mapping(int16 => uint256);
    mapping(int16 => uint256) map;

    using LiquidityManager for mapping(uint256 => Shared.Position);
    mapping(uint256 => Shared.Position) public positions;
    mapping(int24 => LiquidityManager.TickState) public ticks;
    uint128 public liquidity = 0;

    modifier isRouter() {
        if (msg.sender != router) revert NotRouter();
        _;
    }
    //Set this to false to enforce initial position
    bool initialized = true;
    modifier isInitialized() {
        if (!initialized) revert NotInitialized();
        _;
    }

    constructor(
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
        currentTick = _startTick; //Tick.SPACING * 35;
        currentSqrtPrice = Tick.getPriceFromTick(currentTick);
    }

    function swap(
        uint256 _in,
        uint256 _minValueOut,
        int24 _limitTick,
        address _sender
    ) external override isRouter isInitialized {
        int24 _currentTick = currentTick;
        SwapData memory currentSwap = SwapData(
            0,
            0,
            _in,
            _currentTick,
            0,
            currentSqrtPrice,
            0,
            0,
            feeGlobal0,
            0
        );
        
        uint256 _currentSqrtPrice = currentSqrtPrice;
        //Try to fix this problem with the initial tick and maybe otherremoved tick
        if (_currentSqrtPrice <= Tick.getPriceFromTick(_currentTick)) {
            //Update fees
            ticks[_currentTick].feesOutside0 =
                currentSwap.feeGlobal -
                ticks[_currentTick].feesOutside0;
            ticks[_currentTick].feesOutside1 =
                feeGlobal1 -
                ticks[_currentTick].feesOutside1;
            liquidity = uint128(
                int128(liquidity) - ticks[_currentTick].liquidityNet
            );
            _currentTick = getNextWhileNotInitialized(_currentTick);
        }
        //Swap ZERO TO ONE
        if (_limitTick < _currentTick) {
            while (
                currentSwap.remainingAmount > 0 && _currentTick >= _limitTick
            ) {
                int24 next = getNextWhileNotInitialized(_currentTick);

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

                currentSwap.remainingAmount -= amountIn + fees;
                currentSwap.outAmount += amountOut;
                currentSwap.feesPaid += fees;

                uint128 protocolFee = uint128(fees) / 200;
                fees -= protocolFee;
                currentSwap.protocolFees += protocolFee;
                //collectedProtocolFees0 += protocolFee;

                currentSwap.feeGlobal += Math.mulDiv(
                    fees,
                    0x100000000000000000000000000000000,
                    liquidity
                );

                if (priceAfterSwap <= nextPrice) {
                    //Update fees
                    ticks[_currentTick].feesOutside0 =
                        currentSwap.feeGlobal -
                        ticks[_currentTick].feesOutside0;
                    ticks[_currentTick].feesOutside1 =
                        feeGlobal1 -
                        ticks[_currentTick].feesOutside1;
                    liquidity = uint128(
                        int128(liquidity) - ticks[_currentTick].liquidityNet
                    );
                    _currentTick = getNextWhileNotInitialized(
                        next - Tick.SPACING
                    );
                }
                _currentSqrtPrice = priceAfterSwap;
            }
            feeGlobal0 = currentSwap.feeGlobal;
            collectedProtocolFees0 = currentSwap.protocolFees;
            currentSwap.endPrice = uint128(_currentSqrtPrice);
            currentSwap.endTick = _currentTick;
            if (currentSwap.remainingAmount > 1) revert Limit();
            if (currentSwap.outAmount < _minValueOut) revert Slippage();
            uint256 balance0Before = IERC20(token0).balanceOf(address(this));
            IPositionCallback(msg.sender).swapCallback(
                currentSwap.inAmount,
                token0,
                _sender
            );

            uint256 balance0After = IERC20(token0).balanceOf(address(this));
            if (balance0After < balance0Before + currentSwap.inAmount)
                revert WrongAmount();

            transferOut(token1, _sender, currentSwap.outAmount);
        }
        //Swap ONE TO ZERO
        else {

            ///IMPORTANT TODO TODO COMPARE WITH SWAP QUOTE FOR JUMPING "LIQUIDITY HOLES" !!!!!
            currentSwap.feeGlobal = feeGlobal1;

            while (
                currentSwap.remainingAmount > 0 && _currentTick <= _limitTick
            ) {
                int24 next = getNextWhileNotInitializedFalse(_currentTick);

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
                currentSwap.remainingAmount -= amountIn + fees;
                currentSwap.outAmount += amountOut;
                currentSwap.feesPaid += fees;

                uint128 protocolFee = uint128(fees) / 200;
                fees -= protocolFee;
                currentSwap.protocolFees += protocolFee;

                currentSwap.feeGlobal += Math.mulDiv(
                    fees,
                    0x100000000000000000000000000000000,
                    liquidity
                );

                if (priceAfterSwap >= nextPrice) {
                    //Update fees
                    ticks[next].feesOutside1 =
                        currentSwap.feeGlobal -
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
            feeGlobal1 = currentSwap.feeGlobal;
            collectedProtocolFees1 = currentSwap.protocolFees;
            currentSwap.endPrice = uint128(_currentSqrtPrice);
            currentSwap.endTick = _currentTick;
            if (currentSwap.remainingAmount > 1) revert Limit();
            if (currentSwap.outAmount < _minValueOut) revert Slippage();

            uint256 balance1Before = IERC20(token1).balanceOf(address(this));

            IPositionCallback(msg.sender).swapCallback(
                currentSwap.inAmount,
                token1,
                _sender
            );

            uint256 balance1After = IERC20(token1).balanceOf(address(this));
            if (balance1Before != balance1After - currentSwap.inAmount)
                revert WrongAmount();

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
        int24 _currentTick = currentTick;
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
            0,
            feeGlobal0,
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
                currentSwap.remainingAmount -= _exactIn
                    ? cache.amountIn + cache.fees
                    : cache.amountOut;
                //require(currentSwap.remainingAmount == 0,"Wrong remain");

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
                int24 next = getNextWhileNotInitializedFalse(_currentTick);
   
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
                currentSwap.remainingAmount -= _exactIn
                    ? cache.amountIn + cache.fees
                    : cache.amountOut;

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
    ) external override isRouter isInitialized {
        uint256 amount0;
        uint256 amount1;
        if (positions[_lpId].owner != address(0)) revert PosExists();

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

        uint256 balance0Before = IERC20(token0).balanceOf(address(this));
        uint256 balance1Before = IERC20(token1).balanceOf(address(this));
        IPositionCallback(msg.sender).addPositionCallback(
            amount0,
            amount1,
            token0,
            token1,
            _sender
        );
        uint256 balance0After = IERC20(token0).balanceOf(address(this));
        uint256 balance1After = IERC20(token1).balanceOf(address(this));
        if (balance0After != balance0Before + amount0) revert WrongAmount();
        if (balance1After != balance1Before + amount1) revert WrongAmount();

        emit PositionCallback.Add_Position(liquidity, _lpId);
    }

    function initialPosition(address _sender) external override {
        uint256 amount0;
        uint256 amount1;
        initialized = true;
        (amount0, amount1) = addPositionView(-887208, 887208, 1000);
        liquidity = 1000;
        IPositionCallback(msg.sender).addPositionCallback(
            amount0,
            amount1,
            token0,
            token1,
            _sender
        );

        //IERC20(token0).safeTransferFrom(_sender, address(this), amount0);
        //IERC20(token1).safeTransferFrom(_sender, address(this), amount1);
    }

    function addPositionView(
        int24 _startTick,
        int24 _endTick,
        uint128 _amount
    )
        public
        view
        override
        returns (uint256 token0Amount, uint256 token1Amount)
    {
        (token0Amount, token1Amount) = positions.addPositionView(
            ticks,
            map,
            LiquidityManager.NewPositionParameter(
                0,
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

        positions[_positionId].globalFees0 = feeGlobal0; //-positions[_positionId].globalFees0;
        positions[_positionId].globalFees1 = feeGlobal1; //-positions[_positionId].globalFees1;

        if (collectedFees0 > 0) {
            transferOut(token0, positions[_positionId].owner, collectedFees0);
        }
        if (collectedFees1 > 0) {
            transferOut(token1, positions[_positionId].owner, collectedFees1);
        }
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

    function getNextWhileNotInitializedFalse(int24 _currentTick)
        internal
        view
        returns (int24)
    {
        (int24 next, bool init) = getNextInitialized(
            _currentTick + Tick.SPACING,
            Tick.SPACING,
            false
        );
        while (!init) {
            (next, init) = getNextInitialized(next, Tick.SPACING, false);
        }
        return next;
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

    function position(uint256 _positionId)
        external
        view
        override
        returns (
            int24,
            int24,
            uint128
        )
    {
        Shared.Position memory pos = positions[_positionId];
        return (pos.lowerTick, pos.upperTick, pos.liquidity);
    }

    receive() external payable {}

    fallback() external payable {}
}
