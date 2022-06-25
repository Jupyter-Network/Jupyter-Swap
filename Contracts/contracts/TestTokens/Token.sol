// SPDX-License-Identifier: MIT
pragma solidity^0.8.7;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

//Used for testing JupyterCore and JupyterRouter
contract Token is ERC20 {
  constructor() ERC20 ("Tether","USDT")  {
    _mint(msg.sender, 1000000000 ether);
  }
}