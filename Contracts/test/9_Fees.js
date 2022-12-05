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

async function swapAndPrint(amount, up) {
  console.log("Swap" + up);

  //console.log("Swap up: ");
  //await router.swap(token0.address, token1.address, 100000000, 256000);

  let tableBefore = [];
  res = await router.positionInfo(token0.address, token1.address, 1);
  tableBefore.push(Object.keys(res).map((e) => res[e].toString()));
  res = await router.positionInfo(token0.address, token1.address, 2);
  tableBefore.push(Object.keys(res).map((e) => res[e].toString()));
  res = await router.positionInfo(token0.address, token1.address, 3);
  tableBefore.push(Object.keys(res).map((e) => res[e].toString()));

  await router.swap(
    token0.address,
    token1.address,
    amount,
    up ? 256000 : -256000
  );

  let table = [];

  res = await router.positionInfo(token0.address, token1.address, 1);
  table.push(Object.keys(res).map((e) => res[e].toString()));
  res = await router.positionInfo(token0.address, token1.address, 2);
  table.push(Object.keys(res).map((e) => res[e].toString()));
  res = await router.positionInfo(token0.address, token1.address, 3);
  table.push(Object.keys(res).map((e) => res[e].toString()));

  console.table(
    table.map((i1, k1) => {
      return i1.map((i2, k2) => {
        return i2 - tableBefore[k1][k2];
      });
    })
  );

  res = await router.poolInfo(token0.address, token1.address);
  console.log("Tick: ", res[0].toString());
  console.log("Liquidity: ", res[2].toString());
}
contract("Router", ([owner, testAddress]) => {
  it("Swap Up", async () => {
    await router.createPool(token0.address, token1.address, 1024);

    let poolAddress = await router.getPool(token0.address, token1.address);

    await router.addPosition(
      token0.address,
      token1.address,
      -64000,
      64000,
      100000000
    );
    await router.addPosition(
      token0.address,
      token1.address,
      -63936,
      -12800,
      100000000
    );
    await router.addPosition(
      token0.address,
      token1.address,
      12800,
      63936,
      100000000
    );

    await swapAndPrint(100000000, true);
  });
  it("Swap Down", async () => {
    await router.createPool(token0.address, token1.address, 1024);

    let poolAddress = await router.getPool(token0.address, token1.address);

    await router.addPosition(
      token0.address,
      token1.address,
      -64000,
      64000,
      100000000
    );
    await router.addPosition(
      token0.address,
      token1.address,
      -63936,
      -12800,
      100000000
    );
    await router.addPosition(
      token0.address,
      token1.address,
      12800,
      63936,
      100000000
    );

    await swapAndPrint(100000000, false);
  });
  it("Swap Collect and swap more", async () => {
    await router.createPool(token0.address, token1.address, 1024);

    let poolAddress = await router.getPool(token0.address, token1.address);

    await router.addPosition(
      token0.address,
      token1.address,
      -64000,
      64000,
      100000000
    );
    await router.addPosition(
      token0.address,
      token1.address,
      -63936,
      -12800,
      100000000
    );
    await router.addPosition(
      token0.address,
      token1.address,
      12800,
      63936,
      100000000
    );

    await swapAndPrint(100000000, false);
    await swapAndPrint(1000000000, true);
    await swapAndPrint(100000, true);
    await swapAndPrint(100000, true);
    await swapAndPrint(100000, false);
    await swapAndPrint(100000, false);

    //After collect only pos 0 and zero should be updated, pos 1 should stay at zero
    let res = await router.position(token0.address, token1.address, 2);
    console.log(Object.keys(res).map((e) => res[e].toString()));
    await router.removePosition(token0.address, token1.address, 2);

    res = await router.positionInfo(token0.address, token1.address, 2);
    console.log(Object.keys(res).map((e) => res[e].toString()));
    //
    //
    await swapAndPrint(1000000, true);
    await swapAndPrint(1000000, false);
    await swapAndPrint(1000000, true);
    await swapAndPrint(1000000, true);
    await swapAndPrint(1000000, true);
    await swapAndPrint(1000000, false);
    await swapAndPrint(1000000, false);
    await swapAndPrint(100000000, false);
    await swapAndPrint(100000000, false);
    await swapAndPrint(100000000, false);
    await swapAndPrint(100000000, true);
  });
});
