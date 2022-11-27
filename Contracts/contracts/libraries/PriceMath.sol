pragma solidity ^0.8.13;

import "./Math.sol";
import "./SafeCast.sol";
import "./Fees.sol";

library PriceMath {
    using SafeCast for uint256;
    event Log(uint256, uint256);
    struct SwapCache {
        uint256 amountIn;
        uint256 amountOut;
        uint256 priceAfterSwap;
        uint256 fees;
    }
    struct SwapParams {
        uint160 sqrtPrice;
        uint256 endPrice;
        uint128 liquidity;
        uint256 amount;
    }

    //(l * d / pe ) / ps
    function getToken0Amount(
        uint160 _startPrice,
        uint160 _endPrice,
        uint128 _liquidity,
        bool _roundUp
    ) internal pure returns (uint256 amount0) {
        if (_startPrice > _endPrice)
            (_startPrice, _endPrice) = (_endPrice, _startPrice);

        uint256 liquidity = uint256(_liquidity) << 96;
        uint256 priceDelta = _endPrice - _startPrice;

        require(_startPrice != 0);

        return
            _roundUp
                ? Math.fastDivRoundingUp(
                    Math.mulDivRoundingUp(liquidity, priceDelta, _endPrice),
                    _startPrice
                )
                : Math.mulDiv(liquidity, priceDelta, _endPrice) / _startPrice;
    }

    function getToken1Amount(
        uint160 _startPrice,
        uint160 _endPrice,
        uint128 _liquidity,
        bool _roundUp
    ) internal pure returns (uint256 amount1) {
        if (_startPrice > _endPrice)
            (_startPrice, _endPrice) = (_endPrice, _startPrice);
        return
            _roundUp
                ? Math.mulDivRoundingUp(
                    _liquidity,
                    _endPrice - _startPrice,
                    0x1000000000000000000000000
                )
                : Math.mulDiv(
                    _liquidity,
                    _endPrice - _startPrice,
                    0x1000000000000000000000000
                );
    }

    //Get next price from token 0 amount always rounding up
    function getNextPriceFromAmount0RoundingUp(
        uint160 _currentPrice,
        uint128 liquidity,
        uint256 amount,
        bool add
    ) internal pure returns (uint160) {
        if (amount == 0) return _currentPrice;
        uint256 numerator1 = uint256(liquidity) << 96;

        if (add) {
            uint256 product;
            if ((product = amount * _currentPrice) / amount == _currentPrice) {
                uint256 denominator = numerator1 + product;
                if (denominator >= numerator1)
                    // always fits in 160 bits
                    return
                        uint160(
                            Math.mulDivRoundingUp(
                                numerator1,
                                _currentPrice,
                                denominator
                            )
                        );
            }

            return
                uint160(
                    Math.fastDivRoundingUp(
                        numerator1,
                        (numerator1 / _currentPrice) + (amount)
                    )
                );
        } else {
            uint256 product;
            // if the product overflows, we know the denominator underflows
            // in addition, we must check that the denominator does not underflow
            require(
                (product = amount * _currentPrice) / amount == _currentPrice &&
                    numerator1 > product
            );
            uint256 denominator = numerator1 - product;
            return
                Math
                    .mulDivRoundingUp(numerator1, _currentPrice, denominator)
                    .UINT160();
        }
    }

    //Get next price from token 1 amount always rounding down
    function getNextPriceFromAmount1RoundingDown(
        uint160 _currentPrice,
        uint128 _liquidity,
        uint256 _amount,
        bool _add
    ) internal pure returns (uint160) {
        if (_add) {
            uint256 priceChange = (
                _amount <= type(uint160).max
                    ? (_amount << 96) / _liquidity
                    : Math.mulDiv(
                        _amount,
                        0x1000000000000000000000000,
                        _liquidity
                    )
            );

            return uint160(uint256(_currentPrice) + (priceChange));
        } else {
            uint256 priceChange = (
                _amount <= type(uint160).max
                    ? Math.fastDivRoundingUp(_amount << 96, _liquidity)
                    : Math.mulDivRoundingUp(
                        _amount,
                        0x1000000000000000000000000,
                        _liquidity
                    )
            );

            require(_currentPrice > priceChange);
            // always fits 160 bits
            return uint160(_currentPrice - priceChange);
        }
    }

    function getNextPriceFromInput(
        uint160 _currentSqrtPrice,
        uint128 _liquidity,
        uint256 _amountIn,
        bool _up
    ) internal pure returns (uint160) {
        require(_currentSqrtPrice > 0);
        require(_liquidity > 0);
        return
            _up
                ? getNextPriceFromAmount0RoundingUp(
                    _currentSqrtPrice,
                    _liquidity,
                    _amountIn,
                    true
                )
                : getNextPriceFromAmount1RoundingDown(
                    _currentSqrtPrice,
                    _liquidity,
                    _amountIn,
                    true
                );
    }

    function getNextPriceFromOutput(
        uint160 _currentSqrtPrice,
        uint128 _liquidity,
        uint256 _amountOut,
        bool _up
    ) internal pure returns (uint160 sqrtQX96) {
        require(_currentSqrtPrice > 0);
        require(_liquidity > 0);
        return
            _up
                ? getNextPriceFromAmount1RoundingDown(
                    _currentSqrtPrice,
                    _liquidity,
                    _amountOut,
                    false
                )
                : getNextPriceFromAmount0RoundingUp(
                    _currentSqrtPrice,
                    _liquidity,
                    _amountOut,
                    false
                );
    }

    function swaps(SwapParams memory params, bool _exactIn)
        internal
        view
        returns (SwapCache memory)
    {
        return _exactIn ? swapExactIn(params) : swapExactOut(params);
    }

    function swap(
        //uint160 _sqrtPrice,
        //uint256 _endPrice,
        //uint128 _liquidity,
        //uint256 _amount,
        SwapParams memory params
    )
        internal
        view
        returns (
            uint256 amountIn,
            uint256 amountOut,
            uint256 endPrice,
            uint256 fees
        )
    {
        uint256 remaining = Math.mulDiv(params.amount, 1000000 - 2000, 1000000);

        //swap up or down
        if (params.sqrtPrice <= params.endPrice) {
            //Get input amount
            amountIn = PriceMath.getToken1Amount(
                uint160(params.endPrice),
                params.sqrtPrice,
                params.liquidity,
                true
            );
            if (remaining >= amountIn) {
                endPrice = params.endPrice;
            } else {
                endPrice = PriceMath.getNextPriceFromInput(
                    params.sqrtPrice,
                    params.liquidity,
                    remaining,
                    false
                );
            }
            if (params.endPrice != endPrice) {
                amountIn = PriceMath.getToken1Amount(
                    uint160(endPrice),
                    uint160(params.sqrtPrice),
                    params.liquidity,
                    true
                );
            }
            amountOut = getToken0Amount(
                uint160(endPrice),
                params.sqrtPrice,
                params.liquidity,
                false
            );
        } else {
            amountIn = PriceMath.getToken0Amount(
                params.sqrtPrice,
                uint160(params.endPrice),
                params.liquidity,
                true
            );

            if (remaining >= amountIn) endPrice = params.endPrice;
            else {
                endPrice = PriceMath.getNextPriceFromInput(
                    params.sqrtPrice,
                    params.liquidity,
                    remaining,
                    true
                );
            }

            if (params.endPrice != endPrice) {
                amountIn = PriceMath.getToken0Amount(
                    params.sqrtPrice,
                    uint160(endPrice),
                    params.liquidity,
                    true
                );
            }
            amountOut = getToken1Amount(
                params.sqrtPrice,
                uint160(endPrice),
                uint128(params.liquidity),
                false
            );
        }

        if (endPrice != params.endPrice) {
            fees = params.amount - amountIn;
        } else {
            fees = Math.mulDivRoundingUp(amountIn, 2000, 1000000 - 2000);
        }
    }

    function swapExactIn(SwapParams memory params)
        internal
        view
        returns (SwapCache memory cache)
    {
        uint256 remaining = Math.mulDiv(params.amount, 1000000 - 2000, 1000000);
        cache = SwapCache(0, 0, 0, 0);
        //swap up or down
        if (params.sqrtPrice <= params.endPrice) {
            //Get input amount
            cache.amountIn = PriceMath.getToken1Amount(
                uint160(params.endPrice),
                params.sqrtPrice,
                params.liquidity,
                true
            );
            if (remaining >= cache.amountIn) {
                cache.priceAfterSwap = params.endPrice;
            } else {
                cache.priceAfterSwap = PriceMath.getNextPriceFromInput(
                    params.sqrtPrice,
                    params.liquidity,
                    remaining,
                    false
                );
            }
            if (params.endPrice != cache.priceAfterSwap) {
                cache.amountIn = PriceMath.getToken1Amount(
                    uint160(cache.priceAfterSwap),
                    uint160(params.sqrtPrice),
                    params.liquidity,
                    true
                );
            }
            cache.amountOut = getToken0Amount(
                uint160(cache.priceAfterSwap),
                params.sqrtPrice,
                params.liquidity,
                false
            );
        } else {
            cache.amountIn = PriceMath.getToken0Amount(
                params.sqrtPrice,
                uint160(params.endPrice),
                params.liquidity,
                true
            );

            if (remaining >= cache.amountIn)
                cache.priceAfterSwap = params.endPrice;
            else {
                cache.priceAfterSwap = PriceMath.getNextPriceFromInput(
                    params.sqrtPrice,
                    params.liquidity,
                    remaining,
                    true
                );
            }

            if (params.endPrice != cache.priceAfterSwap) {
                cache.amountIn = PriceMath.getToken0Amount(
                    params.sqrtPrice,
                    uint160(cache.priceAfterSwap),
                    params.liquidity,
                    true
                );
            }
            cache.amountOut = getToken1Amount(
                params.sqrtPrice,
                uint160(cache.priceAfterSwap),
                uint128(params.liquidity),
                false
            );
        }

        if (cache.priceAfterSwap != params.endPrice) {
            cache.fees = params.amount - cache.amountIn;
        } else {
            cache.fees = Math.mulDivRoundingUp(
                cache.amountIn,
                2000,
                1000000 - 2000
            );
        }
    }

   
    function swapExactOut(
          SwapParams memory params
        )
        public
        view
        returns (SwapCache memory)
    {
       uint256 amountIn;
        uint256 amountOut;
        uint256 _endPrice;
        uint256 fees;
        uint256 remaining = params.amount;//Math.mulDiv(amount, 1000000 - 2000, 1000000);

        //swap up or down
        if (params.sqrtPrice > params.endPrice) {
            
            //Get input amount
            amountOut = PriceMath.getToken1Amount(
                uint160(params.endPrice),
                params.sqrtPrice,
                params.liquidity,
                false
            );
            if (remaining >= amountOut) {
                _endPrice = params.endPrice;
            } else {
                _endPrice = PriceMath.getNextPriceFromOutput(
                    params.sqrtPrice,
                    params.liquidity,
                    remaining,
                    true
                );
            }
            if (params.endPrice != _endPrice) {
                amountOut = PriceMath.getToken1Amount(
                    uint160(params.sqrtPrice),
                    uint160(_endPrice),
                    params.liquidity,
                    false
                );
            }
            amountIn = getToken0Amount(
                uint160(_endPrice),
                params.sqrtPrice,
                params.liquidity,
                true
            );
            
        } else {
            
            amountOut = PriceMath.getToken0Amount(
                params.sqrtPrice,
                uint160(params.endPrice),
                params.liquidity,
                false
            );

            if (remaining >= amountOut) _endPrice = params.endPrice;
            else {
                _endPrice = PriceMath.getNextPriceFromOutput(
                    params.sqrtPrice,
                    params.liquidity,
                    remaining,
                    false
                );
            }

            if (params.endPrice != _endPrice) {
                amountOut = PriceMath.getToken0Amount(
                    params.sqrtPrice,
                    uint160(_endPrice),
                    params.liquidity,
                    false
                );
            }
            amountIn = getToken1Amount(
                params.sqrtPrice,
                uint160(_endPrice),
                uint128(params.liquidity),
                false
            );
            
        }

        //Add aftfer bug above is fixed
        //if (_endPrice != params.endPrice) {
        //   fees = params.amount - amountOut;
        //} else {
            fees = Math.mulDivRoundingUp(amountIn, 2000, 1000000 - 2000);
        //}
        //fees = 1000;
        return SwapCache(amountIn, amountOut, _endPrice, fees);
    }
    
}
