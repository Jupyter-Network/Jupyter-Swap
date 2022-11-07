pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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


