const Router = artifacts.require("JupyterRouterV1");
const Token0 = artifacts.require("Token");
const Token1 = artifacts.require("Token1");
const WBNB = artifacts.require("WBNB");

module.exports = async function initTest(deployer, network, accounts) {
  deployer.deploy(Token1).then(async () => {
    //const token0 = await Token0.deployed();
    const token1 = await Token1.deployed();
    const router = await Router.deployed();
    const wbnb = await WBNB.deployed();
    console.log(
      `Token 0: ${wbnb.address} Token1: ${token1.address} Router: ${router.address}`
    );
    //await token0.increaseAllowance(router.address,"1"+"000000000000000000");
    await token1.increaseAllowance(
      router.address,
      "1" + "0000000000000000000000"
    );
    console.log("Transfered 1000000000 to ", accounts[1]);
    await token1.transfer(accounts[1], "32500025002", { from: accounts[0] });
    //await wbnb.deposit({value:"100000000000"});
    await router.createLiquidityPool(
      token1.address,
      "1" + "0000000000000000000",
      { value: "1" + "0000000000000000000" }
    );

    //await router.addLiquidity(token1.address, "1" + "000000000000000000", {
    //  value: "1" + "000000000000000000",
    //});

    await router.swapTokenToETH(token1.address,"1" + "000000000000000000","1" + "00000000000000000")
    await router.removeLiquidity(token1.address);

    console.log("Test environment initialised");
  });
};
