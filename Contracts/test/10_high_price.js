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
  router = await Router.deployed();
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

async function swapAndPrint(amount, up, min, owner) {
  console.log("Swap" + up);
  let t0Before = BigInt(await token0.balanceOf(owner));
  let t1Before = BigInt(await token1.balanceOf(owner));

  res = await router.swapQuote(
    token0.address,
    token1.address,
    amount,
    up ? 887272 : -887272,
    true
  );

  await router.swap(
    token0.address,
    token1.address,
    amount,
    up ? 887272 : -887272,
    min
  );
  let t0After = BigInt(await token0.balanceOf(owner));
  let t1After = BigInt(await token1.balanceOf(owner));

  console.log("Change: ", t0After - t0Before, t1After - t1Before);
  return [t0After - t0Before, t1After - t1Before];
}

contract("Router", ([owner, testAddress]) => {
  it("Swap Up", async () => {
    await router.createPool(token0.address, token1.address, 169792);
    await router.addPosition(
      token0.address,
      token1.address,
      140800,
      179200,
      "1000000000000000000000"
    );
    let amount = "1000000000000";
    let res = await router.swapQuote(
      token0.address,
      token1.address,
      amount,
      640000,
      true
    );
    let ideal = BigInt(amount) / 23638000n;

    assert(res.amountOut > (ideal * 995n) / 1000n, "amount too low");
    assert(res.amountOut < ideal, "amount too high");
    
    let amountOut = res.amountOut;
    res = await swapAndPrint(amount, true, (ideal * 995n) / 1000n, owner);
    assert(-res[1] == amount, "Wrong amount sent in");
    assert(res[0] == amountOut, "Wrong amount sent in");
    amount = amount + "000000000"

    res = await router.swapQuote(
        token0.address,
        token1.address,
        amount,
        640000,
        true
      );
      console.log(res)

      res = await swapAndPrint(amount, true, 0n, owner);
      amount = amount + "000"

      res = await router.swapQuote(
        token0.address,
        token1.address,
        amount,
        640000,
        true
      );
      console.log(res)

      res = await swapAndPrint(amount, true, 0n, owner);
      res = await router.swapQuote(
        token0.address,
        token1.address,
        amount,
        640000,
        true
      );
      console.log(res)

      res = await swapAndPrint(amount, true, 0n, owner);

  });
  
  it("Swap Down", async () => {
    await router.createPool(token0.address, token1.address, 169792);
    await router.addPosition(
      token0.address,
      token1.address,
      140800,
      179200,
      "1000000000000000000000"
    );
    
    let amount = "10000000000000";
    let res = await router.swapQuote(
      token0.address,
      token1.address,
      amount,
      -640000,
      true
    );
    let ideal = BigInt(amount) * 23638000n;

    assert(res.amountOut > (ideal * 995n) / 1000n, "amount too low");
    assert(res.amountOut < ideal, "amount too high");

    let amountOut = res.amountOut;
    res = await swapAndPrint(amount, false, (ideal * 995n) / 1000n, owner);
    assert(-res[0] == amount, "Wrong amount sent in");
    assert(res[1] == amountOut, "Wrong amount sent in");

        amount = amount + "0000"
     res = await router.swapQuote(
        token0.address,
        token1.address,
        amount,
        -640000,
        true
      );
      
      amountOut = res.amountOut;
      res = await swapAndPrint(amount, false, (ideal * 995n) / 1000n, owner);
      assert(-res[0] == amount, "Wrong amount sent in");
      assert(res[1] == amountOut, "Wrong amount sent in");
  });
  
});
