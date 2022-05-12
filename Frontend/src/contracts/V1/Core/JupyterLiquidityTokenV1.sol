// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

abstract contract JupyterLiquidityTokenV1 {
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor() {
        totalSupply = 0;
    }

    function mint(uint256 amount, address user) internal {
        totalSupply += amount;
        balanceOf[user] += amount;
    }

    function burn(uint256 amount, address user) internal {
        totalSupply -= amount;
        balanceOf[user] -= amount;
    }
}