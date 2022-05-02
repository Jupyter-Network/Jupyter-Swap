const Token = artifacts.require("Token");
const Token1 = artifacts.require("Token1");
const WBNB = artifacts.require("WBNB");

module.exports = async function (deployer) {
  await deployer.deploy(Token);
  await deployer.deploy(Token1);
  await deployer.deploy(WBNB);
  console.log("Address:", Token.address);
};
