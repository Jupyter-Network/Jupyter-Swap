pragma solidity ^0.8.13;
import "./IPool.sol";

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
        int24 _limitTick
    ) external payable;

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
