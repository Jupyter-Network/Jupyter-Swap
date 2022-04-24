
const Router = artifacts.require("JupyterRouterV1");
module.exports = async function (deployer,network,accounts) {
  await deployer.deploy(Router,accounts[1]);
};
