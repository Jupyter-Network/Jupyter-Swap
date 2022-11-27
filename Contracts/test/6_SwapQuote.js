const BN = require("bn.js");
const Token = artifacts.require("TestToken");
const Factory = artifacts.require("JupyterFactory");
const Router = artifacts.require("Router");
const WBNB = artifacts.require("WBNB");

let router;
let token0;
let token1;
let wbnb;
let factory;
const DEC = "000000000000000000";

beforeEach("should setup the contract instance", async () => {
  wbnb = await WBNB.new();

  factory = await Factory.new(wbnb.address);
  token0 = await Token.new(
    "1000000000000000000000000000000000000000000000000000000"
  );
  token1 = await Token.new(
    "1000000000000000000000000000000000000000000000000000000"
  );

  router = await Router.new(wbnb.address, factory.address);
  await factory.changeRouter(router.address);

  //pool = await Pool.new(2000, token0.address, token1.address);

  await token0.increaseAllowance(
    router.address,
    "100000000000000000000000000000" + DEC
  );
  await token1.increaseAllowance(
    router.address,
    "100000000000000000000000000000" + DEC
  );
});

function sort(adress0, adress1) {
  if (BigInt(adress0) < BigInt(adress1)) {
    return [adress0, adress1];
  }
  return [adress0, adress1];
}
function sorted(adress0, adress1) {
  return BigInt(adress0) < BigInt(adress1);
}

async function testSending(methodToTest, params, owner) {
  let balance0Before = await token0.balanceOf(owner);
  let balance1Before = await token1.balanceOf(owner);
  await methodToTest(...params);
  let balance0After = await token0.balanceOf(owner);
  let balance1After = await token1.balanceOf(owner);
  console.log(balance0Before.toString(), balance1Before.toString());
  console.log(balance0After.toString(), balance1After.toString());
  assert(balance0After.lt(balance0Before), "Wrong amount sent 0");
  assert(balance1After.lt(balance1Before), "Wrong amount sent 1");
}

async function testReceiving(methodToTest, params, owner) {
  let balance0Before = await token0.balanceOf(owner);
  let balance1Before = await token1.balanceOf(owner);
  await methodToTest(...params);
  let balance0After = await token0.balanceOf(owner);
  let balance1After = await token1.balanceOf(owner);
  assert(balance0After.gt(balance0Before), "Wrong amount received 0");
  assert(balance1After.gt(balance1Before), "Wrong amount received 1");
}

contract("Router", ([owner, testAddress]) => {
 
  it("View Position", async () => {
    await router.createPool(token0.address, token1.address, 1024);
    let amounts = await router.addPositionView(
      token0.address,
      token1.address,
      -5120,
      5120,
      100000000000000
    );
    console.log(
      "AMOUNTS:",
      amounts.token0Amount.toString(),
      amounts.token1Amount.toString()
    );

    await router.addPosition(
      token1.address,
      token0.address,
      -5120,
      5120,
      100000000000000,
      {
        from: owner,
        value: amounts.token0Amount,
      }
    );

    console.log(await router.positionInfo(token0.address, token1.address, 1));
  });
  it("View ExactOut minus", async () => {
    await router.createPool(token0.address, token1.address, 1024);
    let amounts = await router.addPositionView(
      token0.address,
      token1.address,
      -5120,
      5120,
      100000000000000
    );
    console.log(
      "AMOUNTS:",
      amounts.token0Amount.toString(),
      amounts.token1Amount.toString()
    );

    await router.addPosition(
      token1.address,
      token0.address,
      -10240,
      64000,
      100000000000000,
      {
        from: owner,
        value: amounts.token0Amount,
      }
    );
      let res = await router.swapQuote(token0.address,token1.address,1000000,-128000,false)
      console.log(res);
  });
  it("View ExactOut plus", async () => {
    await router.createPool(token0.address, token1.address, 1024);
    let amounts = await router.addPositionView(
      token0.address,
      token1.address,
      -5120,
      5120,
      100000000000000
    );
    console.log(
      "AMOUNTS:",
      amounts.token0Amount.toString(),
      amounts.token1Amount.toString()
    );

    await router.addPosition(
      token1.address,
      token0.address,
      -10240,
      64000,
      100000000000000,
      {
        from: owner,
        value: amounts.token0Amount,
      }
    );
      let res = await router.swapQuote(token0.address,token1.address,1000000,64000,false)
      console.log(res);
      //res = await router.swapQuote(token0.address,token1.address,1000000,-64000,true)
      //console.log(res);
      //res = await router.swapQuote(token0.address,token1.address,1000000,64000,true)
      //console.log(res);
  });
  it("View ExactIn minus", async () => {
    await router.createPool(token0.address, token1.address, 1024);
    let amounts = await router.addPositionView(
      token0.address,
      token1.address,
      -5120,
      5120,
      100000000000000
    );
    console.log(
      "AMOUNTS:",
      amounts.token0Amount.toString(),
      amounts.token1Amount.toString()
    );

    await router.addPosition(
      token1.address,
      token0.address,
      -10240,
      64000,
      100000000000000,
      {
        from: owner,
        value: amounts.token0Amount,
      }
    );
      let res = await router.swapQuote(token0.address,token1.address,1000000,-64000,true)
      console.log(res);
    
  });
  it("View ExactIn plus", async () => {
    await router.createPool(token0.address, token1.address, 1024);
    let amounts = await router.addPositionView(
      token0.address,
      token1.address,
      -5120,
      5120,
      100000000000000
    );
    console.log(
      "AMOUNTS:",
      amounts.token0Amount.toString(),
      amounts.token1Amount.toString()
    );

    await router.addPosition(
      token1.address,
      token0.address,
      -10240,
      64000,
      100000000000000,
      {
        from: owner,
        value: amounts.token0Amount,
      }
    );
      let res = await router.swapQuote(token0.address,token1.address,1000000,64000,true)
      console.log(res);
  });
  
  
});
