const Router = artifacts.require("Router");
const PriceMath = artifacts.require("PriceMath");
const WETH = artifacts.require("WBNB");
const Factory = artifacts.require("JupyterFactory");

module.exports = async function (deployer, network, accounts) {
  let factory = await Factory.deployed();
  let weth = await WETH.deployed();
  await deployer.deploy(Router, weth.address, factory.address);
  //console.log(accounts[0]);
};
