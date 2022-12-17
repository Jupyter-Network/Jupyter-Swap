const Factory = artifacts.require("JupyterFactory");
const WETH = artifacts.require("WBNB");
const PriceMath = artifacts.require("PriceMath");
const Tick = artifacts.require("Tick");

module.exports = async function (deployer) {
  let weth = await WETH.deployed();
  await deployer.deploy(PriceMath);
  deployer.link(PriceMath, Factory);

  await deployer.deploy(Factory, weth.address);
};
