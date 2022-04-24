const Token = artifacts.require("Token");
const Token1 = artifacts.require("Token1");

module.exports = async function (deployer) {
  await deployer.deploy(Token);
  await deployer.deploy(Token1);

  console.log("Address:",Token.address)
};
