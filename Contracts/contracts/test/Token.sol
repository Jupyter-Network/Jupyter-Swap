// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Gold", "GLD") {
        _mint(msg.sender, initialSupply);
    }
}

contract DynamicToken is ERC20 {
  constructor(string memory name, string memory symbol,uint256 supply) ERC20 (name,symbol)  {
    _mint(msg.sender, supply * 1 ether);
  }
}