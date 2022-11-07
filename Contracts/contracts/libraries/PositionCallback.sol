pragma solidity ^0.8.13;
import "./Transfer.sol";

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
