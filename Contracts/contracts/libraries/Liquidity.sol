pragma solidity ^0.8.13;
import "./Math.sol";
import "./Fees.sol";
import "./PriceMath.sol";
import "./BitMap.sol";
import "./Tick.sol";
import "./Shared.sol";

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
    ) internal view returns (uint256 amount0, uint256 amount1) {
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
