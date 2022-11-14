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
