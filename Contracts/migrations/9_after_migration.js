const Router = artifacts.require("JupyterRouterV1");
const Token0 = artifacts.require("Token");
const Token1 = artifacts.require("Token1");

module.exports = async function initTest(deployer, network, accounts) {
  deployer.deploy(Token1).then(async ()=>{
    const token0 = await Token0.deployed();
    const token1 = await Token1.deployed();
    const router = await Router.deployed();
    console.log(
      `Token 0: ${token0.address} Token1: ${token1.address} Router: ${router.address}`
    );
    await token0.increaseAllowance(router.address,"1"+"000000000000000000");
    await token1.increaseAllowance(router.address, "1" +"000000000000000000");
    console.log("Transfered 1000000000 to ", accounts[1]);
    await token1.transfer(accounts[1], "32500025002",{from:accounts[0]});
  
    await router.createLiquidityPool(
      token0.address,
      token1.address,
      "1" +"000000000000000000",
      "1" +"000000000000000000"
    );
    console.log("Test environment initialised");
  })

};
