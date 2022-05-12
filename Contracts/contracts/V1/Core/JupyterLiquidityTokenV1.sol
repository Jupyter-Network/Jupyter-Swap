// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

abstract contract JupyterLiquidityTokenV1 is ERC20("JP-LP","Jupyter Liquidity") {
    constructor() {
    }
    function decimals() public view virtual override returns (uint8) {
        return 36;
    }

    function mint(uint256 amount, address user) internal {
        _mint(user,amount);
    }

    function burn(uint256 amount, address user) internal {
        _burn(user,amount);
    }
}