
const Router = artifacts.require("JupyterRouterV1");
const WBNB = artifacts.require("WBNB");

module.exports = async function (deployer,network,accounts) {
  await deployer.deploy(Router,accounts[1],WBNB.address);
};
