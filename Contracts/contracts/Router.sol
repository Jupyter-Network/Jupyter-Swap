pragma solidity ^0.8.13;
import "./Pool.sol";
import "./libraries/PositionCallback.sol";
import "./interfaces/IRouter.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IPool.sol";
import "./interfaces/IFactory.sol";
import "./test/WBNB.sol";

contract Router is IRouter, IPositionCallback {
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
        uint256 Id
    );
    event Liquidity_Removed(address Pool, uint256 RemovedLiquidity);

    constructor(address _WETH, address _factory) {
        require(_WETH != address(0), "WETH address must be defined");
        WETH = _WETH;
        require(_factory != address(0), "Factory address must be defined");
        factory = IJupyterFactory(_factory);
    }

    receive() external payable {
        // React to receiving ether
    }

    //Transfer Callbacks
    function addPositionCallback(
        uint256 _amount0,
        uint256 _amount1,
        address _token0Address,
        address _token1Address,
        address _sender
    ) external override validPool {
        require(_amount0 >  0,"amount0 = 0");
                require(_amount1 >  0,"amount1 = 0")
;
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
    ) external payable override {
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
            lp_id
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
    ) external override {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        poolExists(_token0Address, _token1Address);
        IJupyterSwapPool(payable(pools[_token0Address][_token1Address]))
            .removePosition(_positionId, msg.sender);
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
        //JupyterSwapPool pool = new JupyterSwapPool(
        //    2000,
        //    _token0Address,
        //    _token1Address,
        //    _startTick,
        //    msg.sender,
        //    WETH
        //);

        pools[_token0Address][_token1Address] = pool;
        //validPools[address(pool)] = 1;
        //Send remaining ETH value back to user
        //if (address(this).balance > 0) {
        //    payable(msg.sender).transfer(address(this).balance);
        //}
        emit Pool_Created(pool, _token0Address, _token1Address);
    }

    function swap(
        address _token0Address,
        address _token1Address,
        uint256 _amount,
        int24 _limitTick
    ) external payable override {
        (_token0Address, _token1Address) = _orderPools(
            _token0Address,
            _token1Address
        );
        poolExists(_token0Address, _token1Address);
        IJupyterSwapPool(payable(pools[_token0Address][_token1Address])).swap(
            _amount,
            _limitTick,
            msg.sender
        );
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
    {
        //addresses Must be ordered here
        require(
            pools[_token0Address][_token1Address] != address(0),
            "Pool does not exist"
        );
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
        poolExists(_token0Address, _token1Address);
        return pools[_token0Address][_token1Address];
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