const Swap = artifacts.require("JupyterCoreV1");
const Token = artifacts.require("Token");
const Token1 = artifacts.require("Token1");

module.exports = async function (deployer,network,accounts) {
  //const token = await Token.deployed();
  await deployer.deploy(Swap, Token.address,Token1.address,accounts[1]);
};