
  
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0;

interface IWETH {
    function deposit() external payable;

    function transfer(address dst, uint256 wad) external returns (bool);

    function withdraw(uint256) external;
    function balanceOf(uint256) external;
}