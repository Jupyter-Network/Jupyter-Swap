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
