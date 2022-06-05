const fs = require("fs");

const Router = artifacts.require("JupyterRouterV1");
const Token0 = artifacts.require("Token");
const Token1 = artifacts.require("Token1");
const WBNB = artifacts.require("WBNB");

module.exports = async function initTest(deployer, network, accounts) {
  deployer.deploy(Token1).then(async () => {
    const token0 = await Token0.deployed();
    const token1 = await Token1.deployed();
    const router = await Router.deployed();
    const wbnb = await WBNB.deployed();
    console.log(
      `Token 0: ${token0.address} Token1: ${token1.address} Router: ${router.address} WBNB: ${wbnb.address}`
    );

    fs.writeFile(
      "../Frontend/src/contracts/addresses.json",
      JSON.stringify({
        token0: token0.address,
        token1: token1.address,
        router: router.address,
        wbnb: wbnb.address,
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
        wbnb: wbnb.address,
      }),
      (err) => {
        if (err) {
          throw err;
        }
        console.log("JSON data is saved.");
      }
    );

    await token0.increaseAllowance(
      router.address,
      "1" + "000000000000000000000000000"
    );
    await token1.increaseAllowance(
      router.address,
      "1" + "00000000000000000000000000000000"
    );
    console.log("Transfered 1000000000 to ", accounts[1]);
    await token1.transfer(accounts[1], "32500025002", { from: accounts[0] });
    //await wbnb.deposit({value:"100000000000"});
    await router.createLiquidityPool(
      token1.address,
      "1" + "0000000000000000000",
      Date.now() + 900000,
      { value: "1" + "0000000000000000000" }
    );
    await router.createLiquidityPool(
      token0.address,
      "1" + "0000000000000000000",
      Date.now() + 900000,

      { value: "1" + "0000000000000000000" }
    );
    /*
    await router.addLiquidity(token1.address, "1" + "00000000000000000000", {
      value: "1" + "00000000000000000000",
    });
    //Balances
    console.log(await token0.balanceOf(accounts[0]));
    console.log(await token1.balanceOf(accounts[0]));
    let quote = await router.getTokenToTokenQuote(
      token1.address,
      token0.address,
      "1000000"
    );
    console.log("Quote: ",quote * 0.995)

    await router.swapTokens(token1.address, token0.address, "1000000", parseInt(quote * 0.995));

    await router.swapTokenToETH(
      token1.address,
      "1" + "000000000000000000",
      "1" + "00000000000000000"
    );
    //await router.removeLiquidity(token1.address);

    console.log("Test environment initialised");
    */
  });
};
