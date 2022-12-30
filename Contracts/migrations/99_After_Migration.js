const fs = require("fs")
const Router = artifacts.require("Router");
//const LM = artifacts.require("LiquidityManager");
const WETH = artifacts.require("WBNB");
const Factory = artifacts.require("JupyterFactory");
const Token = artifacts.require("TestToken");
const DynamicToken = artifacts.require("DynamicToken");

module.exports = async function (deployer, network, accounts) {
  let weth = await WETH.deployed()
  let factory = await Factory.deployed();
  let router = await Router.deployed();

  //deploy tokens and create first pool
  let token0 = await Token.new("100000000000000000000000000000");
  let token1 = await Token.new("100000000000000000000000000000");
  let token2 = await DynamicToken.new("Jupyter","IOM","100000000");

  await token0.approve(router.address, "10000000000000000000000000000");
  await token1.approve(router.address, "10000000000000000000000000000");
  await token2.approve(router.address, "10000000000000000000000000000");

  //TODO: Write to file once the whole contracts folder is migrated

  await factory.changeRouter(router.address.toString());
  await router.createPool(token0.address, token1.address, 1024);
  await router.createPool(token0.address, token2.address, 204800);



  await token0.transfer("0xb9e418fF608d6155263bb4d8472Ec8aDDc3E1E88","10000000000000000000000000000");
  await token1.transfer("0xb9e418fF608d6155263bb4d8472Ec8aDDc3E1E88","10000000000000000000000000000");



  //fs.writeFile(
  //  "./addresses/addresses.json",
  //  JSON.stringify({
  //    token0: token0.address,
  //    token1: token1.address,
  //    router: router.address,
  //    wbnb: weth.address,
  //  }),
  //  (err) => {
  //    if (err) {
  //      throw err;
  //    }
  //    console.log("JSON data is saved.");
  //  }
  //);

  fs.writeFile(
    "../Frontend/src/contracts/addresses.json",
    JSON.stringify({
      token0: token0.address,
      token1: token1.address,
      router: router.address,
      wbnb: weth.address,
    }),
    (err) => {
      if (err) {
        throw err;
      }
      console.log("JSON data is saved.");
    }
  );

  fs.writeFile(
    "../Backend/addresses.json",
    JSON.stringify({
      token0: token0.address,
      token1: token1.address,
      router: router.address,
      wbnb: weth.address,
    }),
    (err) => {
      if (err) {
        throw err;
      }
      console.log("JSON data is saved.");
    }
  );

  fs.writeFile(
    "../addresses.json",
    JSON.stringify({
      token0: token0.address,
      token1: token1.address,
      router: router.address,
      wbnb: weth.address,
    }),
    (err) => {
      if (err) {
        throw err;
      }
      console.log("JSON data is saved.");
    }
  );

};




