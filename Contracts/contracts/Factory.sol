pragma solidity ^0.8.13;
import "./Pool.sol";
import "./interfaces/IFactory.sol";

contract JupyterFactory is IJupyterFactory {
    int24 internal constant MAX_TICK = 887272;
    int24 internal constant MIN_TICK = -MAX_TICK;
    address owner;
    address public router;
    address lastAddedPool;
    address immutable wbnb;
    modifier isOwner() {
        require(msg.sender == owner, "Only owner can do this");
        _;
    }

    modifier isRouter() {
        require(msg.sender == router, "Not Router");
        _;
    }

    mapping(address => bool) pools;

    constructor(address _wbnb) {
        owner = msg.sender;
        wbnb = _wbnb;
    }

    function transferOwnerShip(address _newOwner) external override isOwner {
        owner = _newOwner;
    }

    function renounceOwnerShip() external override isOwner {
        owner = address(0);
    }



    function changeRouter(address _newRouter) external {
        require(_newRouter != address(0), "Zero address");
        router = _newRouter;
    }

  

    function lastPool() external view override returns (address) {
        return lastAddedPool;
    }

    function createPool(
        address _token0Address,
        address _token1Address,
        int24 _startTick
    ) external override isRouter {
        require(_token0Address != address(0), "_T0 zero address");

        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );

        JupyterSwapPool pool = new JupyterSwapPool(
            _token0Address,
            _token1Address,
            _startTick,
            router,
            wbnb
        );

        pools[address(pool)] = true;
        lastAddedPool = address(pool);
    }

    function validatePool(address _pool) external view override returns (bool) {
        return pools[_pool];
    }

    function _orderPools(address token0, address token1)
        internal
        pure
        returns (address, address)
    {
        return token0 < token1 ? (token0, token1) : (token1, token0);
    }
}
