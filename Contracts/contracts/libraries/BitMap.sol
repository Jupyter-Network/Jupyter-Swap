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
