const Factory = artifacts.require("JupyterFactory");
const WETH = artifacts.require("WBNB");

module.exports = async function (deployer) {
  let weth = await WETH.deployed();
  await deployer.deploy(Factory,weth.address);
};
