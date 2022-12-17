// File: contracts/libraries/Fees.sol

pragma solidity ^0.8.13;

library Fees {
    uint256 internal constant SCALE_FACTOR = 10**6;

    struct Fee {
        uint256 feeAmount0;
        uint256 feeAmount1;
    }



    function feesInRange(
        int24 _currentTick,
        int24 _lower,
        int24 _upper,
        uint256 _globalFees,
        uint256 outsideLower,
        uint256 outsideUpper,
        uint256 posGlobal
    ) internal view returns (uint256 feeGrowthInside0X128) {
        // calculate fee growth below
        uint256 feeGrowthBelow0X128;
        if (_currentTick >= _lower) {
            feeGrowthBelow0X128 = outsideLower;
        } else {
            unchecked {
                feeGrowthBelow0X128 = _globalFees - outsideLower;
            }
        }

        // calculate fee growth above
        uint256 feeGrowthAbove0X128;
        if (_currentTick < _upper) {
            feeGrowthAbove0X128 = outsideUpper;
        } else {
            unchecked {
                feeGrowthAbove0X128 = _globalFees - outsideUpper;
            }
        }
        if (_globalFees < feeGrowthAbove0X128 + feeGrowthBelow0X128) {
            feeGrowthInside0X128 = 0;
        } else {
            feeGrowthInside0X128 =
                _globalFees -
                feeGrowthBelow0X128 -
                feeGrowthAbove0X128 ;
        }
    }
}

// File: contracts/libraries/Math.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

library Math {
    function mulDiv(
        uint256 a,
        uint256 b,
        uint256 denominator
    ) internal pure returns (uint256 result) {
        unchecked {
            // 512-bit multiply [prod1 prod0] = a * b
            // Compute the product mod 2**256 and mod 2**256 - 1
            // then use the Chinese Remainder Theorem to reconstruct
            // the 512 bit result. The result is stored in two 256
            // variables such that product = prod1 * 2**256 + prod0
            uint256 prod0; // Least significant 256 bits of the product
            uint256 prod1; // Most significant 256 bits of the product
            assembly {
                let mm := mulmod(a, b, not(0))
                prod0 := mul(a, b)
                prod1 := sub(sub(mm, prod0), lt(mm, prod0))
            }

            // Handle non-overflow cases, 256 by 256 division
            if (prod1 == 0) {
                require(denominator > 0);
                assembly {
                    result := div(prod0, denominator)
                }
                return result;
            }

            // Make sure the result is less than 2**256.
            // Also prevents denominator == 0
            require(denominator > prod1);

            ///////////////////////////////////////////////
            // 512 by 256 division.
            ///////////////////////////////////////////////

            // Make division exact by subtracting the remainder from [prod1 prod0]
            // Compute remainder using mulmod
            uint256 remainder;
            assembly {
                remainder := mulmod(a, b, denominator)
            }
            // Subtract 256 bit number from 512 bit number
            assembly {
                prod1 := sub(prod1, gt(remainder, prod0))
                prod0 := sub(prod0, remainder)
            }

            // Factor powers of two out of denominator
            // Compute largest power of two divisor of denominator.
            // Always >= 1.
            uint256 twos = (type(uint256).max - denominator + 1) & denominator;
            // Divide denominator by power of two
            assembly {
                denominator := div(denominator, twos)
            }

            // Divide [prod1 prod0] by the factors of two
            assembly {
                prod0 := div(prod0, twos)
            }
            // Shift in bits from prod1 into prod0. For this we need
            // to flip `twos` such that it is 2**256 / twos.
            // If twos is zero, then it becomes one
            assembly {
                twos := add(div(sub(0, twos), twos), 1)
            }
            prod0 |= prod1 * twos;

            // Invert denominator mod 2**256
            // Now that denominator is an odd number, it has an inverse
            // modulo 2**256 such that denominator * inv = 1 mod 2**256.
            // Compute the inverse by starting with a seed that is correct
            // correct for four bits. That is, denominator * inv = 1 mod 2**4
            uint256 inv = (3 * denominator) ^ 2;
            // Now use Newton-Raphson iteration to improve the precision.
            // Thanks to Hensel's lifting lemma, this also works in modular
            // arithmetic, doubling the correct bits in each step.
            inv *= 2 - denominator * inv; // inverse mod 2**8
            inv *= 2 - denominator * inv; // inverse mod 2**16
            inv *= 2 - denominator * inv; // inverse mod 2**32
            inv *= 2 - denominator * inv; // inverse mod 2**64
            inv *= 2 - denominator * inv; // inverse mod 2**128
            inv *= 2 - denominator * inv; // inverse mod 2**256

            // Because the division is now exact we can divide by multiplying
            // with the modular inverse of denominator. This will give us the
            // correct result modulo 2**256. Since the precoditions guarantee
            // that the outcome is less than 2**256, this is the final result.
            // We don't need to compute the high bits of the result and prod1
            // is no longer required.
            result = prod0 * inv;
            return result;
        }
    }

    /// @notice Calculates ceil(a×b÷denominator) with full precision. Throws if result overflows a uint256 or denominator == 0
    /// @param a The multiplicand
    /// @param b The multiplier
    /// @param denominator The divisor
    /// @return result The 256-bit result
    function mulDivRoundingUp(
        uint256 a,
        uint256 b,
        uint256 denominator
    ) internal pure returns (uint256 result) {
        result = mulDiv(a, b, denominator);
        if (mulmod(a, b, denominator) > 0) {
            require(result < type(uint256).max);
            result++;
        }
    }

    /// @notice
    function fastDivRoundingUp(uint256 x, uint256 y)
        internal
        pure
        returns (uint256 z)
    {
        assembly {
            z := add(div(x, y), gt(mod(x, y), 0))
        }
    }


}

// File: contracts/libraries/SafeCast.sol

// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Safe casting methods
/// @notice Contains methods for safely casting between types
library SafeCast {
    /// @notice Cast a uint256 to a uint160, revert on overflow
    /// @param y The uint256 to be downcasted
    /// @return z The downcasted integer, now type uint160
    function UINT160(uint256 y) internal pure returns (uint160 z) {
        require((z = uint160(y)) == y);
    }

    /// @notice Cast a int256 to a int128, revert on overflow or underflow
    /// @param y The int256 to be downcasted
    /// @return z The downcasted integer, now type int128
    function INT128(int256 y) internal pure returns (int128 z) {
        require((z = int128(y)) == y);
    }

    /// @notice Cast a uint256 to a int256, revert on overflow
    /// @param y The uint256 to be casted
    /// @return z The casted integer, now type int256
    function INT256(uint256 y) internal pure returns (int256 z) {
        require(y < 2**255);
        z = int256(y);
    }
}

// File: contracts/libraries/PriceMath.sol

pragma solidity ^0.8.13;



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
        public
        view
        returns (SwapCache memory)
    {
        return _exactIn ? swapExactIn(params) : swapExactOut(params);
    }

    function swap(
        SwapParams memory params
    )
        internal
        pure
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
    pure
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

// File: @openzeppelin/contracts/token/ERC20/IERC20.sol

// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

// File: @openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol

// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC20/extensions/draft-IERC20Permit.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 Permit extension allowing approvals to be made via signatures, as defined in
 * https://eips.ethereum.org/EIPS/eip-2612[EIP-2612].
 *
 * Adds the {permit} method, which can be used to change an account's ERC20 allowance (see {IERC20-allowance}) by
 * presenting a message signed by the account. By not relying on {IERC20-approve}, the token holder account doesn't
 * need to send a transaction, and thus is not required to hold Ether at all.
 */
interface IERC20Permit {
    /**
     * @dev Sets `value` as the allowance of `spender` over ``owner``'s tokens,
     * given ``owner``'s signed approval.
     *
     * IMPORTANT: The same issues {IERC20-approve} has related to transaction
     * ordering also apply here.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `deadline` must be a timestamp in the future.
     * - `v`, `r` and `s` must be a valid `secp256k1` signature from `owner`
     * over the EIP712-formatted function arguments.
     * - the signature must use ``owner``'s current nonce (see {nonces}).
     *
     * For more information on the signature format, see the
     * https://eips.ethereum.org/EIPS/eip-2612#specification[relevant EIP
     * section].
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @dev Returns the current nonce for `owner`. This value must be
     * included whenever a signature is generated for {permit}.
     *
     * Every successful call to {permit} increases ``owner``'s nonce by one. This
     * prevents a signature from being used multiple times.
     */
    function nonces(address owner) external view returns (uint256);

    /**
     * @dev Returns the domain separator used in the encoding of the signature for {permit}, as defined by {EIP712}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}

// File: @openzeppelin/contracts/utils/Address.sol

// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (utils/Address.sol)

pragma solidity ^0.8.1;

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     *
     * [IMPORTANT]
     * ====
     * You shouldn't rely on `isContract` to protect against flash loan attacks!
     *
     * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
     * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
     * constructor.
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize/address.code.length, which returns 0
        // for contracts in construction, since the code is only stored at the end
        // of the constructor execution.

        return account.code.length > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verifies that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly
                /// @solidity memory-safe-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}

// File: @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol

// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (token/ERC20/utils/SafeERC20.sol)

pragma solidity ^0.8.0;



/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using Address for address;

    function safeTransfer(
        IERC20 token,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    /**
     * @dev Deprecated. This function has issues similar to the ones found in
     * {IERC20-approve}, and its usage is discouraged.
     *
     * Whenever possible, use {safeIncreaseAllowance} and
     * {safeDecreaseAllowance} instead.
     */
    function safeApprove(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        // safeApprove should only be called when setting an initial allowance,
        // or when resetting it to zero. To increase and decrease it, use
        // 'safeIncreaseAllowance' and 'safeDecreaseAllowance'
        require(
            (value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        uint256 newAllowance = token.allowance(address(this), spender) + value;
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        unchecked {
            uint256 oldAllowance = token.allowance(address(this), spender);
            require(oldAllowance >= value, "SafeERC20: decreased allowance below zero");
            uint256 newAllowance = oldAllowance - value;
            _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
        }
    }

    function safePermit(
        IERC20Permit token,
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        uint256 nonceBefore = token.nonces(owner);
        token.permit(owner, spender, value, deadline, v, r, s);
        uint256 nonceAfter = token.nonces(owner);
        require(nonceAfter == nonceBefore + 1, "SafeERC20: permit did not succeed");
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address.functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) {
            // Return data is optional
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

// File: contracts/libraries/Transfer.sol

pragma solidity ^0.8.13;


library Transfer {
    using SafeERC20 for IERC20;

    function safeTransferSwap(
        uint256 _amount0,
        uint256 _amount1,
        address _token0,
        address _token1,
        address _receiver,
        bool _zeroToOne
    ) internal {
        if (_zeroToOne) {
            IERC20(_token1).safeTransferFrom(
                _receiver,
                address(this),
                uint128(_amount0)
            );
            IERC20(_token0).safeTransfer(_receiver, uint128(_amount1));
        } else {
            IERC20(_token1).safeTransfer(_receiver, uint128(_amount1));
            IERC20(_token0).safeTransferFrom(
                _receiver,
                address(this),
                uint128(_amount0)
            );
        }
    }

    function safeTransferOut(
        address _token,
        uint256 _amount,
        address _receiver
    ) internal {
        IERC20(_token).safeTransfer(_receiver, _amount);
    }

    function safeTransferIn(
        address _token,
        uint256 _amount,
        address _sender
    ) internal {
        IERC20(_token).safeTransferFrom(_sender, address(this), _amount);
    }
}

// File: contracts/libraries/BitMap.sol

pragma solidity ^0.8.13;

///Bitmap library
library BitMap {
    function tickPosition(int24 _tick)
        internal
        pure
        returns (int16 word, uint8 bit)
    {
        word = int16(_tick >> 8);
        bit = uint8(uint24(_tick % 256));
    }

    function getFlagAtTick(
        mapping(int16 => uint256) storage _map,
        int24 _tick,
        int24 _tickSpacing
    ) internal view returns (uint256) {
        (int16 word, uint8 bit) = tickPosition(_tick / _tickSpacing);
        return _map[word] & (1 << uint24(bit));
    }

    function setFlagAtTick(
        mapping(int16 => uint256) storage _map,
        int24 _tick,
        int24 _tickSpacing
    ) internal {
        require(_tick % _tickSpacing == 0);
        (int16 word, uint8 bit) = tickPosition(_tick / _tickSpacing);
        _map[word] ^= (1 << uint24(bit));
    }

    function nextInitializedTickWithinOneWord(
        mapping(int16 => uint256) storage self,
        int24 _tick,
        int24 _tickSpacing,
        bool lte
    ) internal view returns (int24 next, bool initialized) {
        int24 compressed = _tick / _tickSpacing;
        if (_tick < 0 && _tick % _tickSpacing != 0) compressed--; // round towards negative infinity

        if (lte) {
            (int16 wordPos, uint8 bitPos) = tickPosition(compressed);
            // all the 1s at or to the right of the current bitPos
            uint256 mask = (1 << bitPos) - 1 + (1 << bitPos);
            uint256 masked = self[wordPos] & mask;

            // if there are no initialized ticks to the right of or at the current tick, return rightmost in the word
            initialized = masked != 0;
            // overflow/underflow is possible, but prevented externally by limiting both tickSpacing and tick
            next = initialized
                ? (compressed -
                    int24(uint24(bitPos - mostSignificantBit(masked)))) *
                    _tickSpacing
                : (compressed - int24(uint24(bitPos))) * _tickSpacing;
        } else {
            // start from the word of the next tick, since the current tick state doesn't matter
            (int16 wordPos, uint8 bitPos) = tickPosition(compressed + 1);
            // all the 1s at or to the left of the bitPos
            uint256 mask = ~((1 << bitPos) - 1);
            uint256 masked = self[wordPos] & mask;

            // if there are no initialized ticks to the left of the current tick, return leftmost in the word
            initialized = masked != 0;
            // overflow/underflow is possible, but prevented externally by limiting both tickSpacing and tick
            next = initialized
                ? (compressed +
                    1 +
                    int24(uint24(leastSignificantBit(masked) - bitPos))) *
                    _tickSpacing
                : (compressed + 1 + int24(uint24(type(uint8).max - bitPos))) *
                    _tickSpacing;
        }
    }

    function mostSignificantBit(uint256 x) internal pure returns (uint16 r) {
        require(x > 0);
        if (x >= 0x100000000000000000000000000000000) {
            x >>= 128;
            r += 128;
        }
        if (x >= 0x10000000000000000) {
            x >>= 64;
            r += 64;
        }

        if (x >= 0x100000000) {
            x >>= 32;
            r += 32;
        }
        if (x >= 0x10000) {
            x >>= 16;
            r += 16;
        }
        if (x >= 0x100) {
            x >>= 8;
            r += 8;
        }
        if (x >= 0x10) {
            x >>= 4;
            r += 4;
        }
        if (x >= 0x4) {
            x >>= 2;
            r += 2;
        }
        if (x >= 0x2) r += 1;
    }

    function leastSignificantBit(uint256 x) internal pure returns (uint8 r) {
        require(x > 0);

        r = 255;
        if (x & type(uint128).max > 0) {
            r -= 128;
        } else {
            x >>= 128;
        }
        if (x & type(uint64).max > 0) {
            r -= 64;
        } else {
            x >>= 64;
        }
        if (x & type(uint32).max > 0) {
            r -= 32;
        } else {
            x >>= 32;
        }
        if (x & type(uint16).max > 0) {
            r -= 16;
        } else {
            x >>= 16;
        }
        if (x & type(uint8).max > 0) {
            r -= 8;
        } else {
            x >>= 8;
        }
        if (x & 0xf > 0) {
            r -= 4;
        } else {
            x >>= 4;
        }
        if (x & 0x3 > 0) {
            r -= 2;
        } else {
            x >>= 2;
        }
        if (x & 0x1 > 0) r -= 1;
    }

    function getLowestBitPos(uint256 value) internal pure returns (uint8) {
        if (value & 1 != 0) return 0;
        if (value & 2 != 0) return 1;
        if (value & 4 != 0) return 2;
        if (value & 8 != 0) return 3;
        if (value & 16 != 0) return 4;
        if (value & 32 != 0) return 5;
        if (value & 64 != 0) return 6;
        if (value & 128 != 0) return 7;
        if (value & 256 != 0) return 8;
        if (value & 512 != 0) return 9;
        if (value & 1024 != 0) return 10;
        if (value & 2048 != 0) return 11;
        if (value & 4096 != 0) return 12;
        if (value & 8192 != 0) return 13;
        if (value & 16384 != 0) return 14;
        if (value & 32768 != 0) return 15;
        if (value & 65536 != 0) return 16;
        if (value & 131072 != 0) return 17;
        if (value & 262144 != 0) return 18;
        if (value & 524288 != 0) return 19;
        if (value & 1048576 != 0) return 20;
        if (value & 2097152 != 0) return 21;
        if (value & 4194304 != 0) return 22;
        if (value & 8388608 != 0) return 23;
        if (value & 16777216 != 0) return 24;
        if (value & 33554432 != 0) return 25;
        if (value & 67108864 != 0) return 26;
        if (value & 134217728 != 0) return 27;
        if (value & 268435456 != 0) return 28;
        if (value & 536870912 != 0) return 29;
        if (value & 1073741824 != 0) return 30;
        return 0; // no bits set
    }
}

// File: contracts/libraries/Tick.sol

pragma solidity ^0.8.13;

library Tick {
    int24 internal constant MIN_TICK = -887272;
    int24 internal constant MAX_TICK = -MIN_TICK;
    int24 internal constant SPACING = 64;

    uint160 internal constant MIN_SQRT_RATIO = 4295128739;
    uint160 internal constant MAX_SQRT_RATIO =
        1461446703485210103287273052203988822378723970342;

    function check(int24 _next) internal pure returns (bool) {
        return _next >= MIN_TICK && _next < MAX_TICK;
    }

    // gets the price from tick number
    function getPriceFromTick(int24 _tick) internal pure returns (uint256) {
        uint256 tick = _tick < 0
            ? uint256(-int256(_tick))
            : uint256(int256(_tick));
        require(tick <= 887272, "Max Tick reached");
        uint256 result = 0;
        unchecked {
            //Safe as input is checked here
            result = tick & 0x1 != 0
                ? 340265354078544963557816517032075149313
                : 340282366920938463463374607431768211456;
            if (tick & 2 != 0)
                result =
                    (result * 340248342086729790484326174814286782778) >>
                    128;
            if (tick & 4 != 0)
                result =
                    (result * 340214320654664324051920982716015181260) >>
                    128;
            if (tick & 8 != 0)
                result =
                    (result * 340146287995602323631171512101879684304) >>
                    128;
            if (tick & 16 != 0)
                result =
                    (result * 340010263488231146823593991679159461444) >>
                    128;
            if (tick & 32 != 0)
                result =
                    (result * 339738377640345403697157401104375502016) >>
                    128;
            if (tick & 64 != 0)
                result =
                    (result * 339195258003219555707034227454543997025) >>
                    128;
            if (tick & 128 != 0)
                result =
                    (result * 338111622100601834656805679988414885971) >>
                    128;
            if (tick & 256 != 0)
                result =
                    (result * 335954724994790223023589805789778977700) >>
                    128;
            if (tick & 512 != 0)
                result =
                    (result * 331682121138379247127172139078559817300) >>
                    128;
            if (tick & 1024 != 0)
                result =
                    (result * 323299236684853023288211250268160618739) >>
                    128;
            if (tick & 2048 != 0)
                result =
                    (result * 307163716377032989948697243942600083929) >>
                    128;
            if (tick & 4096 != 0)
                result =
                    (result * 277268403626896220162999269216087595045) >>
                    128;
            if (tick & 8192 != 0)
                result =
                    (result * 225923453940442621947126027127485391333) >>
                    128;
            if (tick & 16384 != 0)
                result =
                    (result * 149997214084966997727330242082538205943) >>
                    128;
            if (tick & 32768 != 0)
                result =
                    (result * 66119101136024775622716233608466517926) >>
                    128;
            if (tick & 65536 != 0)
                result =
                    (result * 12847376061809297530290974190478138313) >>
                    128;
            if (tick & 131072 != 0)
                result = (result * 485053260817066172746253684029974020) >> 128;
            if (tick & 262144 != 0)
                result = (result * 691415978906521570653435304214168) >> 128;
            if (tick & 524288 != 0)
                result = (result * 1404880482679654955896180642) >> 128;

            if (_tick > 0)
                result =
                    115792089237316195423570985008687907853269984665640564039457584007913129639935 /
                    result; // Max uint256
        }
        return (result >> 32) + (result % 0x100000000 == 0 ? 0 : 1);
    }

    /*
    function getTickFromPrice(uint160 _sqrtPrice)
        internal
        pure
        returns (int24 tick)
    {
        require(
            _sqrtPrice >= MIN_SQRT_RATIO && _sqrtPrice < MAX_SQRT_RATIO,
            "Out of range"
        );
        uint256 ratio = uint256(_sqrtPrice) << 32;

        uint256 r = ratio;
        uint256 msb = 0;

        assembly {
            let f := shl(7, gt(r, 340282366920938463463374607431768211455))
            msb := or(msb, f)
            r := shr(f, r)
            f := shl(6, gt(r, 18446744073709551615))
            msb := or(msb, f)
            r := shr(f, r)
            f := shl(5, gt(r, 4294967295))
            msb := or(msb, f)
            r := shr(f, r)
            f := shl(4, gt(r, 65535))
            msb := or(msb, f)
            r := shr(f, r)
            f := shl(3, gt(r, 255))
            msb := or(msb, f)
            r := shr(f, r)
            f := shl(2, gt(r, 15))
            msb := or(msb, f)
            r := shr(f, r)
            f := shl(1, gt(r, 3))
            msb := or(msb, f)
            r := shr(f, r)
            f := gt(r, 1)
            msb := or(msb, f)
        }

        if (msb >= 128) r = ratio >> (msb - 127);
        else r = ratio << (127 - msb);

        int256 log_2 = (int256(msb) - 128) << 64;

        assembly {
            r := shr(127, mul(r, r))
            let f := shr(128, r)
            log_2 := or(log_2, shl(63, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(62, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(61, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(60, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(59, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(58, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(57, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(56, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(55, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(54, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(53, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(52, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(51, f))
            r := shr(f, r)

            r := shr(127, mul(r, r))
            f := shr(128, r)
            log_2 := or(log_2, shl(50, f))
        }

        int256 log_sqrt10001 = log_2 * 255738958999603826347141; // 128.128 number

        int24 tickLow = int24(
            (log_sqrt10001 - 3402992956809132418596140100660247210) >> 128
        );
        int24 tickHi = int24(
            (log_sqrt10001 + 291339464771989622907027621153398088495) >> 128
        );

        tick = tickLow == tickHi
            ? tickLow
            : getPriceFromTick(tickHi) <= _sqrtPrice
            ? tickHi
            : tickLow;
    }
*/
    function mostSignificantBit(uint256 x) public pure returns (uint8 msb) {
        assembly {
            if or(
                gt(x, 0x100000000000000000000000000000000),
                eq(x, 0x100000000000000000000000000000000)
            ) {
                x := shr(128, x)
                msb := add(msb, 128)
            }
            if or(gt(x, 0x10000000000000000), eq(x, 0x10000000000000000)) {
                x := shr(64, x)
                msb := add(msb, 64)
            }
            if or(gt(x, 0x100000000), eq(x, 0x100000000)) {
                x := shr(32, x)
                msb := add(msb, 32)
            }
            if or(gt(x, 0x10000), eq(x, 0x10000)) {
                x := shr(16, x)
                msb := add(msb, 16)
            }
            if or(gt(x, 0x100), eq(x, 0x100)) {
                x := shr(8, x)
                msb := add(msb, 8)
            }
            if or(gt(x, 0x10), eq(x, 0x10)) {
                x := shr(4, x)
                msb := add(msb, 4)
            }
            if or(gt(x, 0x4), eq(x, 0x4)) {
                x := shr(2, x)
                msb := add(msb, 2)
            }
            if or(gt(x, 0x2), eq(x, 0x2)) {
                msb := add(msb, 1)
            }
        }
    }

    function getTickFromPrice(uint256 _sqrtPrice) public pure returns (int256) {
        require(
            _sqrtPrice >= MIN_SQRT_RATIO && _sqrtPrice < MAX_SQRT_RATIO,
            "Out of range"
        );
        uint256 ratio = _sqrtPrice << 32;
        //Get Log_2 from Most Significant Bit
        uint256 msb = uint256(mostSignificantBit(ratio));
        uint256 r = msb >= 128 ? ratio >> (msb - 127) : ratio << (127 - msb);

        int256 log_2 = (int256(msb) - 128) << 64;
        //Refne the last 14 digits
        //Shift right  127 >> r*r
        //f = shift right 128 >> r
        //log_2 = log_2 | (63 << f)
        //r = f >> r;
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 63);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 62);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 61);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 60);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 59);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 58);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 57);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 56);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 55);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 54);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 53);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 52);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 51);
            r = r >> ff;
        }
        unchecked {
            r = (r * r) >> 127;
            uint256 ff = r >> 128;
            log_2 = log_2 | int256(ff << 50);
            r = r >> ff;
        }
        //Get the log bas sqrt(10001) from log base 2
        int256 l1001 = log_2 * 255738958999603826347141;

        int24 low = int24(
            (l1001 - 3402992956809132418596140100660247210) >> 128
        );
        int24 high = int24(
            (l1001 + 291339464771989622907027621153398088495) >> 128
        );

        return
            low == high ? low : getPriceFromTick(high) <= _sqrtPrice
                ? high
                : low;
    }
    
}

// File: contracts/libraries/Shared.sol

pragma solidity ^0.8.13;

library Shared {
    struct Position {
        uint128 liquidity;
        uint256 token0Amount;
        uint256 token1Amount;
        int24 lowerTick;
        int24 upperTick;
        address owner;
        uint256 globalFees0;
        uint256 globalFees1;
    }
}

// File: contracts/libraries/Liquidity.sol

pragma solidity ^0.8.13;






library LiquidityManager {
    uint256 internal constant FEE_SCALE_FACTOR =
        0x100000000000000000000000000000000;
    using BitMap for mapping(int16 => uint256);

    struct TickState {
        uint256 liquidity;
        int128 liquidityNet;
        bool initialized;
        uint256 feesOutside0;
        uint256 feesOutside1;
    }

    function getCollectedFees(
        mapping(uint256 => Shared.Position) storage self,
        mapping(int24 => TickState) storage _ticks,
        uint256 _positionId,
        uint256 _feeGlobal0,
        uint256 _feeGlobal1,
        int24 _currentTick
    ) internal view returns (uint256, uint256) {
        Shared.Position memory pos = self[_positionId];
        return (
            Math.mulDiv(
                //Fees.feesInRange(
                Fees.feesInRange(
                    _currentTick,
                    pos.lowerTick,
                    pos.upperTick,
                    _feeGlobal0,// - pos.globalFees0,
                    _ticks[pos.lowerTick].feesOutside0,
                    _ticks[pos.upperTick].feesOutside0,
                    pos.globalFees0
                    //false
                ),
                pos.liquidity,
                FEE_SCALE_FACTOR 
            ),
            Math.mulDiv(
             //Fees.feesInRange(
                Fees.feesInRange(
                    _currentTick,
                    pos.lowerTick,
                    pos.upperTick,
                    _feeGlobal1,// - pos.globalFees1,
                    _ticks[pos.lowerTick].feesOutside1,
                    _ticks[pos.upperTick].feesOutside1,
                    pos.globalFees1
                  //  true
                ),
                pos.liquidity,
                FEE_SCALE_FACTOR
            )
        );
    }

    struct NewPositionParameter {
        uint256 positionId;
        int24 startTick;
        int24 endTick;
        int24 currentTick;
        uint128 amount;
        uint128 liquidity;
        uint256 feeGlobal0;
        uint256 feeGlobal1;
        uint256 currentPrice;
        address owner;
    }

    function addPositionView(
        mapping(uint256 => Shared.Position) storage self,
        mapping(int24 => TickState) storage _ticks,
        mapping(int16 => uint256) storage _map,
        NewPositionParameter memory param
    ) internal pure returns (uint256 amount0, uint256 amount1) {
        require(param.startTick <= param.endTick, "Start tick too high");
        (amount0, amount1) = _calcNewPosition(
            param.startTick,
            param.endTick,
            param.currentTick,
            param.amount,
            param.currentPrice,
            true
        );
    }

    function addPosition(
        mapping(uint256 => Shared.Position) storage self,
        mapping(int24 => TickState) storage _ticks,
        mapping(int16 => uint256) storage _map,
        NewPositionParameter memory param
    )
        internal
        returns (
            uint128 newLiquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        require(param.startTick <= param.endTick, "Start tick too high");
        if (_ticks[param.startTick].initialized) {
            _ticks[param.startTick].liquidityNet += int128(param.amount);
            _ticks[param.startTick].liquidity += uint128(param.amount);
        } else {
            _map.setFlagAtTick(param.startTick, Tick.SPACING);
            _ticks[param.startTick] = LiquidityManager.TickState(
                uint256(param.amount),
                int128(param.amount),
                true,
                param.currentTick >= param.startTick ? param.feeGlobal0 : 0,
                param.currentTick >= param.startTick ? param.feeGlobal1 : 0
            );
        }

        if (_ticks[param.endTick].initialized) {
            _ticks[param.endTick].liquidityNet -= int128(param.amount);
            _ticks[param.endTick].liquidity += uint128(param.amount);
        } else {
            _ticks[param.endTick] = LiquidityManager.TickState(
                uint256(param.amount),
                -int128(param.amount),
                true,
                param.currentTick >= param.endTick ? param.feeGlobal0 : 0,
                param.currentTick >= param.endTick ? param.feeGlobal1 : 0
            );
            _map.setFlagAtTick(param.endTick, Tick.SPACING);
        }

        (amount0, amount1) = _calcNewPosition(
            param.startTick,
            param.endTick,
            param.currentTick,
            param.amount,
            param.currentPrice,
            true
        );
        if (
            param.currentTick >= param.startTick &&
            param.currentTick < param.endTick
        ) {
            newLiquidity = param.liquidity + param.amount;
        } else {
            newLiquidity = param.liquidity;
        }

        self[param.positionId] = Shared.Position(
            param.amount,
            amount0,
            amount1,
            param.startTick,
            param.endTick,
            param.owner,
            param.feeGlobal0,
            param.feeGlobal1
        );
    }

    struct RemovePositionParameter {
        uint256 positionId;
        int24 currentTick;
        uint128 liquidity;
        uint256 feeGlobal0;
        uint256 feeGlobal1;
        uint256 currentPrice;
        address owner;
    }

    function removePosition(
        mapping(uint256 => Shared.Position) storage self,
        mapping(int24 => TickState) storage _ticks,
        mapping(int16 => uint256) storage _map,
        RemovePositionParameter memory param
    )
        internal
        returns (
            uint128 newLiquidity,
            uint256 tokensOwed0,
            uint256 tokensOwed1
        )
    {
        require(
            self[param.positionId].owner == param.owner,
            "Not owner of the position"
        );
        Shared.Position memory pos = self[param.positionId];

        _ticks[pos.lowerTick].liquidity -= uint128(pos.liquidity);
        _ticks[pos.lowerTick].liquidityNet -= int128(pos.liquidity);
        _ticks[pos.upperTick].liquidity -= uint128(pos.liquidity);
        _ticks[pos.upperTick].liquidityNet += int128(pos.liquidity);
        (tokensOwed0, tokensOwed1) = _calcNewPosition(
            pos.lowerTick,
            pos.upperTick,
            param.currentTick,
            pos.liquidity,
            param.currentPrice,
            false
        );
        (uint256 collectedFees0, uint256 collectedFees1) = getCollectedFees(
            self,
            _ticks,
            param.positionId,
            param.feeGlobal0,
            param.feeGlobal1,
            param.currentTick
        );
        if (_ticks[pos.lowerTick].liquidity <= 0) {
            _map.setFlagAtTick(pos.lowerTick, Tick.SPACING);
        } else if (_ticks[pos.upperTick].liquidity <= 0) {
            _map.setFlagAtTick(pos.upperTick, Tick.SPACING);
        }
        if (
            pos.lowerTick <= param.currentTick &&
            pos.upperTick > param.currentTick
        ) {
            newLiquidity = param.liquidity - pos.liquidity;
        } else {
            newLiquidity = param.liquidity;
        }

        delete self[param.positionId];

        tokensOwed0 += collectedFees0;
        tokensOwed1 += collectedFees1;
    }

    function _calcNewPosition(
        int24 _startTick,
        int24 _endTick,
        int24 _currentTick,
        uint128 _liquidity,
        uint256 _currentPrice,
        bool _roundUp
    ) internal pure returns (uint256 amount0, uint256 amount1) {
        if (_currentTick >= _startTick && _currentTick < _endTick) {
            amount0 = PriceMath.getToken0Amount(
                uint160(_currentPrice),
                uint160(Tick.getPriceFromTick(_endTick)),
                _liquidity,
                _roundUp
            );
            amount1 = PriceMath.getToken1Amount(
                uint160(Tick.getPriceFromTick(_startTick)),
                uint160(_currentPrice),
                _liquidity,
                _roundUp
            );
        } else if (_currentTick >= _endTick) {
            amount0 = 0;
            amount1 = PriceMath.getToken1Amount(
                uint160(Tick.getPriceFromTick(_startTick)),
                uint160(Tick.getPriceFromTick(_endTick)),
                _liquidity,
                _roundUp
            );
        } else if (_currentTick < _startTick) {
            amount1 = 0;
            amount0 = PriceMath.getToken0Amount(
                uint160(Tick.getPriceFromTick(_startTick)),
                uint160(Tick.getPriceFromTick(_endTick)),
                _liquidity,
                _roundUp
            );
        }
    }
}

// File: contracts/libraries/PositionCallback.sol

pragma solidity ^0.8.13;

library PositionCallback {
    event Add_Position(uint256 liquidity, uint256 positionId);
    event Remove_Position(uint256 liquidity, uint256 positionId);
}

interface IPositionCallback {
    function addPositionCallback(
        uint256 _amount0,
        uint256 _amount1,
        address _token0Address,
        address _token1Address,
        address _poolAddress
    ) external;

    function swapCallback(
        uint256 _amount,
        address _tokenAddress,
        address _sender
    ) external;
}

// File: contracts/interfaces/IWETH.sol

// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

interface IWETH {
    function deposit() external payable;

    function transfer(address dst, uint256 wad) external returns (bool);

    function withdraw(uint256) external;

    function balanceOf(uint256) external;
}

// File: contracts/interfaces/IPool.sol

pragma solidity ^0.8.13;

interface IJupyterSwapPool {
    struct Quote {
        uint256 amountIn;
        uint256 amountOut;
    }

    function swap(
        uint256 _in,
        uint256 _minValueOut,
        int24 _limitTick,
        address _sender
    ) external;

    function swapQuote(
        uint256 _in,
        int24 _limitTick,
        bool _exactIn
    ) external view returns (Quote memory);

    function getCollectedFees(uint256 _positionId)
        external
        view
        returns (uint256 amount0, uint256 amount1);

    function addPosition(
        int24 _startTick,
        int24 _endTick,
        uint128 _amount,
        uint256 _lpId,
        address _sender
    ) external;

    function removePosition(uint256 _positionId, address _sender) external;

    function withdrawUncollectedFees(uint256 _positionId) external;

    function withdrawUncollectedProtocolFees() external;

    function addPositionView(
        int24 _startTick,
        int24 _endTick,
        uint128 _amount
    ) external view returns (uint256 token0Amount, uint256 token1Amount);

    function liquidity() external view returns (uint128);

    function currentTick() external view returns (int24);

    function currentSqrtPrice() external view returns (uint256);

    function position(uint256 _positionId)
        external
        view
        returns (
            int24,
            int24,
            uint128
        );

    function initialPosition(address _sender) external;
}

// File: contracts/Pool.sol

pragma solidity ^0.8.13;









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
    bool initialized = false;
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
                        _currentTick - Tick.SPACING
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

// File: contracts/interfaces/IRouter.sol

pragma solidity ^0.8.13;

interface IRouter {
    ///@notice Adds a new liquidity position
    ///@param _token0Address Address of token0
    ///@param _token1Address Address of token1
    ///@param _startTick lower tick of the position
    ///@param _endTick higher tick of the position
    ///@param _amount amount in liquidity to add
    function addPosition(
        address _token0Address,
        address _token1Address,
        int24 _startTick,
        int24 _endTick,
        uint256 _amount
    ) external payable;

    function addPositionView(
        address _token0Address,
        address _token1Address,
        int24 _startTick,
        int24 _endTick,
        uint256 _amount
    ) external view returns (uint256 token0Amount, uint256 token1Amount);

    ///@notice Removes a existing liquidity position
    ///@param _token0Address Address of token0
    ///@param _token1Address Address of token1
    ///@param _positionId uinque id of the position to remove
    function removePosition(
        address _token0Address,
        address _token1Address,
        uint256 _positionId
    ) external;

    ///@notice Create a new Pool if the pair does not exist yet
    ///@param _token0Address Address of token0
    ///@param _token1Address Address of token1
    ///@param _startTick this will be the starting price of the pool
    function createPool(
        address _token0Address,
        address _token1Address,
        int24 _startTick
    ) external payable;

    ///@notice Swaps will always be relative to the order of the tokens eg. token0 < token1
    ///@notice swap direction is determined by the _limitTick and currentTick eg. _limitTick > currentTick Zero to One else One to Zero
    ///@param _token0Address Address of token0
    ///@param _token1Address Address of token1
    ///@param _amount exactInAmount
    ///@param _limitTick max. or min. Tick for the swap, choose swap direction
    function swap(
        address _token0Address,
        address _token1Address,
        uint256 _amount,
        int24 _limitTick,
        uint256 _minValueOut
    ) external payable;

    function position(
        address _token0Address,
        address _token1Address,
        uint256 _positionId
    )
        external
        view
        returns (
            int24,
            int24,
            uint128
        );

    function positionInfo(
        address _token0Address,
        address _token1Address,
        uint256 _positionId
    )
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        );

    function poolInfo(address _token0Address, address _token1Address)
        external
        view
        returns (
            int24 tick,
            uint256 price,
            uint128 liquidity,
            address pool
        );



    function collectFees(
        address _token0Address,
        address _token1Address,
        uint256 _positionId
    ) external payable;
}

// File: contracts/interfaces/IFactory.sol

pragma solidity ^0.8.13;

interface IJupyterFactory {
    function transferOwnerShip(address _newOwner) external;

    function renounceOwnerShip() external;

   function changeRouter(address _newRouter) external;

    function createPool(
        address _token0Address,
        address _token1Address,
        int24 _startTick
    ) external ;
    function lastPool() external view returns(address);

    function validatePool(address _pool) external view returns (bool);


}

// File: contracts/test/WBNB.sol

pragma solidity ^0.8.7;

contract WBNB {
    string public name = "Wrapped BNB";
    string public symbol = "WBNB";
    uint8 public decimals = 18;

    event Approval(address indexed src, address indexed guy, uint256 wad);
    event Transfer(address indexed src, address indexed dst, uint256 wad);
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    fallback() external payable {
        deposit();
    }

    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 wad) public {
        require(balanceOf[msg.sender] >= wad, "balance too low");
        balanceOf[msg.sender] -= wad;
        payable(msg.sender).transfer(wad);
        emit Withdrawal(msg.sender, wad);
    }

    function totalSupply() public view returns (uint256) {
        return address(this).balance;
    }

    function approve(address guy, uint256 wad) public returns (bool) {
        allowance[msg.sender][guy] = wad;
        emit Approval(msg.sender, guy, wad);
        return true;
    }

    function transfer(address dst, uint256 wad) public returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(
        address src,
        address dst,
        uint256 wad
    ) public returns (bool) {
        require(balanceOf[src] >= wad);

        if (
            src != msg.sender && allowance[src][msg.sender] != type(uint256).max
        ) {
            require(allowance[src][msg.sender] >= wad);
            allowance[src][msg.sender] -= wad;
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;

        emit Transfer(src, dst, wad);

        return true;
    }

}

// File: contracts/libraries/Lock.sol

pragma solidity ^0.8.13;

abstract contract Lock {
    uint8 private constant _UNLOCKED = 1;
    uint8 private constant _LOCKED = 2;
    uint8 private _status;

    constructor() {
        _status = _UNLOCKED;
    }

    modifier locked() {
        _isLocked();
        _;
        _unlock();
    }

    function _isLocked() private {
        require(_status != _LOCKED, "Reentrancy Lock active");
        _status = _LOCKED;
    }

    function _unlock() private {
        _status = _UNLOCKED;
    }
}

// File: contracts/Router.sol

pragma solidity ^0.8.13;









contract Router is IRouter, IPositionCallback, Lock {
    int24 internal constant MAX_TICK = 887272;
    int24 internal constant MIN_TICK = -MAX_TICK;
    address internal immutable WETH;
    uint256 lp_id = 0;
    IJupyterFactory immutable factory;
    event Log(uint256);

    modifier validPool() {
        require(factory.validatePool(msg.sender), "Invalid pool");
        _;
    }
    using SafeERC20 for IERC20;
    address owner;
    modifier isOwner() {
        require(msg.sender == owner, "Only owner can do this");
        _;
    }

    mapping(address => mapping(address => address)) pools;

    //Events
    event Pool_Created(address Pool, address Token0, address Token1);
    event Liquidity_Added(
        address Pool,
        uint256 Liquidity,
        int24 LowerTick,
        int24 UpperTick,
        uint256 Id,
        address owner
    );
    event Liquidity_Removed(address Pool, uint256 Id);
    event Swap(
        address Pool,
        uint256 amountIn,
        uint256 sqrtPrice,
        int24 currentTick,
        int24 limitTick
    );

    constructor(address _WETH, address _factory) {
        require(_WETH != address(0), "WETH address must be defined");
        WETH = _WETH;
        require(_factory != address(0), "Factory address must be defined");
        factory = IJupyterFactory(_factory);
    }

    receive() external payable {
        // React to receiving ether
    }

    function poolInfo(address _token0Address, address _token1Address)
        external
        view
        override
        returns (
            int24 tick,
            uint256 price,
            uint128 liquidity,
            address pool
        )
    {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        pool = poolExists(_token0Address, _token1Address);
        tick = IJupyterSwapPool(pool).currentTick();
        price = IJupyterSwapPool(pool).currentSqrtPrice();
        liquidity = IJupyterSwapPool(pool).liquidity();
    }

    function position(
        address _token0Address,
        address _token1Address,
        uint256 _positionId
    )
        external
        view
        returns (
            int24,
            int24,
            uint128
        )
    {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        poolExists(_token0Address, _token1Address);
        return
            IJupyterSwapPool(payable(pools[_token0Address][_token1Address]))
                .position(_positionId);
    }

    function positionInfo(
        address _token0Address,
        address _token1Address,
        uint256 _positionId
    )
        external
        view
        override
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        poolExists(_token0Address, _token1Address);
        (
            int24 lowerTick,
            int24 upperTick,
            uint128 liquidity
        ) = IJupyterSwapPool(payable(pools[_token0Address][_token1Address]))
                .position(_positionId);
        (uint256 token0Amount, uint256 token1Amount) = IJupyterSwapPool(
            payable(pools[_token0Address][_token1Address])
        ).addPositionView(lowerTick, upperTick, liquidity);
        (uint256 fee0, uint256 fee1) = IJupyterSwapPool(
            payable(pools[_token0Address][_token1Address])
        ).getCollectedFees(_positionId);

        return (token0Amount, token1Amount, fee0, fee1);
    }

    //Transfer Callbacks
    function addPositionCallback(
        uint256 _amount0,
        uint256 _amount1,
        address _token0Address,
        address _token1Address,
        address _sender
    ) external override validPool {
        if (_amount0 > 0)
            if (_token0Address == WETH) {
                require(
                    address(this).balance >= _amount0,
                    "Ether balance 0 too low"
                );
                depositAndTransferWETH(msg.sender, _amount0);
            } else {
                require(
                    IERC20(_token0Address).balanceOf(_sender) > _amount0,
                    "Token balance 0 too low"
                );
                IERC20(_token0Address).safeTransferFrom(
                    _sender,
                    msg.sender,
                    _amount0
                );
            }
        if (_amount1 > 0)
            if (_token1Address == WETH) {
                require(
                    address(this).balance >= _amount1,
                    "Ether balance 1 too low"
                );
                depositAndTransferWETH(msg.sender, _amount1);
            } else {
                require(
                    IERC20(_token1Address).balanceOf(_sender) > _amount1,
                    "Token balance 1 too low"
                );
                IERC20(_token1Address).safeTransferFrom(
                    _sender,
                    msg.sender,
                    _amount1
                );
            }
    }

    function swapCallback(
        uint256 _amount,
        address _tokenAddress,
        address _sender
    ) external override validPool {
        if (_tokenAddress == WETH) {
            depositAndTransferWETH(msg.sender, _amount);
        } else {
            IERC20(_tokenAddress).safeTransferFrom(
                _sender,
                msg.sender,
                _amount
            );
        }
    }

    function addPosition(
        address _token0Address,
        address _token1Address,
        int24 _startTick,
        int24 _endTick,
        uint256 _amount
    ) external payable override locked {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        poolExists(_token0Address, _token1Address);
        lp_id += 1;
        IJupyterSwapPool(payable(pools[_token0Address][_token1Address]))
            .addPosition(
                _startTick,
                _endTick,
                uint128(_amount),
                lp_id,
                msg.sender
            );

        emit Liquidity_Added(
            pools[_token0Address][_token1Address],
            _amount,
            _startTick,
            _endTick,
            lp_id,
            msg.sender
        );
        //Send remaining ETH value back to user
        //if (address(this).balance > 0) {
        //    payable(msg.sender).transfer(address(this).balance);
        //}
    }

    function addPositionView(
        address _token0Address,
        address _token1Address,
        int24 _startTick,
        int24 _endTick,
        uint256 _amount
    ) external view returns (uint256 token0Amount, uint256 token1Amount) {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        poolExists(_token0Address, _token1Address);
        (token0Amount, token1Amount) = IJupyterSwapPool(
            payable(pools[_token0Address][_token1Address])
        ).addPositionView(_startTick, _endTick, uint128(_amount));
    }

    function removePosition(
        address _token0Address,
        address _token1Address,
        uint256 _positionId
    ) external override locked {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        poolExists(_token0Address, _token1Address);
        IJupyterSwapPool(payable(pools[_token0Address][_token1Address]))
            .removePosition(_positionId, msg.sender);
        emit Liquidity_Removed(
            pools[_token0Address][_token1Address],
            _positionId
        );
    }

    function createPool(
        address _token0Address,
        address _token1Address,
        int24 _startTick
    ) external payable override {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        require(
            pools[_token0Address][_token1Address] == address(0),
            "Pool already exists"
        );
        factory.createPool(_token0Address, _token1Address, _startTick);
        address pool = factory.lastPool();

        pools[_token0Address][_token1Address] = pool;

        IJupyterSwapPool(pool).initialPosition(msg.sender);

        emit Pool_Created(pool, _token0Address, _token1Address);
    }

    function swap(
        address _token0Address,
        address _token1Address,
        uint256 _amount,
        int24 _limitTick,
        uint256 _minValueOut
    ) external payable override locked {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        address pool = poolExists(_token0Address, _token1Address);
        IJupyterSwapPool(pool).swap(
            _amount,
            _minValueOut,
            _limitTick,
            msg.sender
        );
        emit Swap(
            pool,
            _amount,
            IJupyterSwapPool(pool).currentSqrtPrice(),
            IJupyterSwapPool(pool).currentTick(),
            _limitTick
        );
    }

    //TODO: Calculation needs fix
    function collectFees(
        address _token0Address,
        address _token1Address,
        uint256 _positionId
    ) external payable override locked {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        poolExists(_token0Address, _token1Address);
        IJupyterSwapPool(payable(pools[_token0Address][_token1Address]))
            .withdrawUncollectedFees(_positionId);
    }

    function swapQuote(
        address _token0Address,
        address _token1Address,
        uint256 _amount,
        int24 _limitTick,
        bool exactIn
    ) external view returns (JupyterSwapPool.Quote memory) {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        poolExists(_token0Address, _token1Address);
        return
            IJupyterSwapPool(payable(pools[_token0Address][_token1Address]))
                .swapQuote(_amount, _limitTick, exactIn);
    }

    function _orderPools(address token0, address token1)
        internal
        pure
        returns (address, address)
    {
        return token0 < token1 ? (token0, token1) : (token1, token0);
    }

    function poolExists(address _token0Address, address _token1Address)
        internal
        view
        returns (address)
    {
        //addresses Must be ordered here
        require(
            pools[_token0Address][_token1Address] != address(0),
            "Pool does not exist"
        );
        return payable(pools[_token0Address][_token1Address]);
    }

    function getPool(address _token0Address, address _token1Address)
        public
        view
        returns (address)
    {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );

        return poolExists(_token0Address, _token1Address);
    }

    function withdrawAndTransferETH(uint256 _amount, address _to) private {
        IWETH(WETH).withdraw(_amount);
        payable(_to).transfer(_amount);
    }

    function depositAndTransferWETH(address to, uint256 value) private {
        require(address(this).balance >= value, "Balance too low");
        IWETH(WETH).deposit{value: value}();
        IERC20(WETH).transfer(to, value);
    }
}
