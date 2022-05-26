// SPDX-License-Identifier: MIT
pragma solidity^0.8.7;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

//Used for testing JupyterCore and JupyterRouter
contract DynamicToken is ERC20 {
  constructor(string memory name, string memory symbol,uint256 supply) ERC20 (name,symbol)  {
    _mint(msg.sender, supply * 1 ether);
  }
}