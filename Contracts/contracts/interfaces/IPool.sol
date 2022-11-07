pragma solidity ^0.8.13;

interface IJupyterSwapPool {
    struct Quote {
        uint256 amountIn;
        uint256 amountOut;
    }

    function swap(
        uint256 _in,
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
}
