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
  it("Create Pool", async () => {
    console.log("Router1:", router.address);
    console.log("Factory:", factory.address);

    await router.createPool(token0.address, token1.address, 1024);
  });
  it("Try Create on existing Pool", async () => {
    await router.createPool(token0.address, token1.address, 1024);
    try {
      await router.createPool(
        token0.address,
        token1.address,
        100000000000,
        1024
      );

      assert.fail("should have trown");
    } catch (e) {
      console.log("Failed as expected");
    }
  });
  it("Add Position", async () => {
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
  });

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
  it("View Reverse Position", async () => {
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
      -64000,
      64000,
      100000000000000,
      {
        from: owner,
        value: amounts.token0Amount,
      }
    );
    console.log(await router.poolInfo(token0.address,token1.address));
      let res = await router.swapQuote(token0.address,token1.address,1000000,-64000,false)
  
      console.log(res);
  });
  it("Remove Position", async () => {
    await router.createPool(token0.address, token1.address, 1024);
    let amounts = await router.addPositionView(
      token0.address,
      token1.address,
      -5120,
      5120,
      100000000000000
    );
    console.log(amounts[0].toString(), amounts[1].toString());
    await testSending(
      router.addPosition,
      [token0.address, token1.address, -5120, 5120, 100000000000000],
      owner,
      {
        from: owner,
      }
    );
    await testReceiving(
      router.removePosition,
      [token0.address, token1.address, 1],
      owner
    );
  });
  it("Try removing already removed Position", async () => {
    await router.createPool(token0.address, token1.address, 1024);

    await testSending(
      router.addPosition,
      [token0.address, token1.address, -64000, 64000, 100000000],
      owner
    );
    await testReceiving(
      router.removePosition,
      [token0.address, token1.address, 1],
      owner
    );
    try {
      await testReceiving(
        router.removePosition,
        [token0.address, token1.address, 1],
        owner
      );
      assert.fail("Should have thrown");
    } catch (e) {
      console.log("Failed as expected");
    }
  });
  it("Try removing not my own Position", async () => {
    await router.createPool(token0.address, token1.address, 1024);
    await testSending(
      router.addPosition,
      [token0.address, token1.address, -64000, 64000, 100000000],
      owner
    );
    try {
      await testReceiving(
        router.removePosition,
        [token0.address, token1.address, 0],
        testAddress
      );
      assert.fail("Should have thrown");
    } catch (e) {
      console.log("Failed as expected");
    }
  });

  it("Swap", async () => {
    await router.createPool(token0.address, token1.address, 1024);

    let poolAddress = await router.getPool(token0.address, token1.address);

    await testSending(
      router.addPosition,
      [token0.address, token1.address, -64000, 64000, 100000000],
      owner
    );

    await testSending(
      router.addPosition,
      [token0.address, token1.address, -64000, 64000, 100000000],
      owner
    );

    let balance0Before = await token0.balanceOf(poolAddress);
    let balance1Before = await token1.balanceOf(poolAddress);
    let amounts = await router.swapQuote(
      token0.address,
      token1.address,
      10000,
      -64000,
      true
    );
    await router.swap(token0.address, token1.address, 10000, -64000);

    let balance0After = await token0.balanceOf(poolAddress);
    let balance1After = await token1.balanceOf(poolAddress);
    assert(
      balance1Before.eq(balance1After.add(new BN(amounts[1]))),
      "Wronng amount 1 sent"
    );
    assert(
      balance0Before.eq(balance0After.sub(new BN(amounts[0]))),
      "Wronng amount 0 sent"
    );
  });

  it("Create WBNB Pool", async () => {
    await router.createPool(wbnb.address, token1.address, 1024);
  });
  it("Add WBNB Position", async () => {
    await router.createPool(token1.address, wbnb.address, 1024);
    let tokens = sort(token1.address, wbnb.address);
    let ethBalanceBefore = new BN(await web3.eth.getBalance(owner));
    let tokenBalanceBefore = await token1.balanceOf(owner);
    let amounts = await router.addPositionView(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000
    );
    let receipt = await router.addPosition(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000,
      {
        from: owner,
        value: amounts.token1Amount,
      }
    );

    let gasAmount = new BN(receipt.receipt.gasUsed).mul(
      new BN(receipt.receipt.effectiveGasPrice)
    );
    let ethBalanceAfter = new BN(await web3.eth.getBalance(owner));
    let tokenBalanceAfter = await token1.balanceOf(owner);

    assert(
      ethBalanceAfter
        .add(gasAmount)
        .eq(ethBalanceBefore.sub(new BN(amounts[1]))),
      "Wrong amount of ether sent"
    );
    assert(
      tokenBalanceAfter.eq(tokenBalanceBefore.sub(new BN(amounts[0]))),
      "Wrong amount of token sent"
    );
    assert(
      new BN(await web3.eth.getBalance(router.address)).eq(new BN(0)),
      "Not all funds transfered from router"
    );
  });
  /*

  it("WBNB Position", async () => {
    await router.createPool(token1.address, wbnb.address, 1024);
    let tokens = sort(token1.address, wbnb.address);

    let ethBalanceBefore =  new BN(await web3.eth.getBalance(owner));
    let tokenBalanceBefore = await token1.balanceOf(owner);

    let amounts = await router.addPositionView(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000
    );
    let receipt = await router.addPosition(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000,
      {
        from: owner,
        value:  amounts.token1Amount ,
      }
    );

    let gasAmount = new BN(receipt.receipt.gasUsed).mul(
      new BN(receipt.receipt.effectiveGasPrice)
    );
    let ethBalanceAfter = sorted
      ? new BN(await web3.eth.getBalance(owner)).add(gasAmount)
      : await token1.balanceOf(owner);
    let tokenBalanceAfter = sorted
      ? await token1.balanceOf(owner)
      : new BN(await web3.eth.getBalance(owner)).add(gasAmount);
    console.log(ethBalanceBefore.toString(), tokenBalanceBefore.toString());
    console.log(
      ethBalanceAfter.sub(ethBalanceBefore).toString(),
      tokenBalanceBefore.sub(tokenBalanceAfter).toString()
    );

    assert(
      ethBalanceAfter.eq(ethBalanceBefore.sub(new BN(amounts.token1Amount))),
      "Wrong amount of ether sent"
    );
    assert(
      tokenBalanceAfter.eq(
        tokenBalanceBefore.sub(new BN(amounts.token0Amount))
      ),
      "Wrong amount of token sent"
    );
  });
*/
  it("Swap WBNB up wbnb lt token1", async () => {
    await router.createPool(token1.address, wbnb.address, 1024);
    let tokens = sort(token1.address, wbnb.address);
    let Sorted = sorted(token1.address, wbnb.address);
    let amounts = await router.addPositionView(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000
    );
    await router.addPosition(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000,
      {
        from: owner,
        value: amounts.token1Amount,
      }
    );
    // amounts = await router.swapQuote(
    //   tokens[0],
    //   tokens[1],
    //   100000000,
    //   10240,
    //   true
    // );
    //
    // await router.swap(tokens[0], tokens[1], 100000000, 10240, {
    //   value: amounts[0],
    // });

    amounts = await router.swapQuote(
      tokens[0],
      tokens[1],
      100000000,
      20480,
      true
    );

    let ethBalanceBefore = new BN(await web3.eth.getBalance(owner));
    let tokenBalanceBefore = new BN(await token1.balanceOf(owner));

    let receipt = await router.swap(tokens[0], tokens[1], 100000000, 20480, {
      from: owner,
      value: amounts[0],
    });

    let gasAmount = new BN(receipt.receipt.gasUsed).mul(
      new BN(receipt.receipt.effectiveGasPrice)
    );
    let ethBalanceAfter = new BN(await web3.eth.getBalance(owner)).add(
      gasAmount
    );
    let tokenBalanceAfter = new BN(await token1.balanceOf(owner));
    console.log("Sorted ?: ", Sorted);
    console.log("eth: ", amounts[0].toString(), amounts[1].toString());
    console.log(
      "token: ",
      tokenBalanceBefore.toString(),
      tokenBalanceBefore.sub(tokenBalanceAfter).toString()
    );
    console.log(
      "eth: ",
      ethBalanceBefore.toString(),
      ethBalanceBefore.sub(ethBalanceAfter).toString()
    );
    assert(!ethBalanceBefore.eq(ethBalanceAfter), "No ETH received");

    assert(
      ethBalanceBefore.eq(ethBalanceAfter.add(new BN(amounts[0]))),
      "Wrong amount of ETH sent"
    );
    assert(
      tokenBalanceBefore.eq(tokenBalanceAfter.sub(new BN(amounts[1]))),
      "Wrong amount of tokens sent"
    );
  });
  it("Swap WBNB up token1 lt wbnb", async () => {
    await router.createPool(token1.address, wbnb.address, 1024);
    let tokens = sort(token1.address, wbnb.address);
    let Sorted = sorted(token1.address, wbnb.address);
    let amounts = await router.addPositionView(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000
    );
    await router.addPosition(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000,
      {
        from: owner,
        value: amounts.token1Amount,
      }
    );

    amounts = await router.swapQuote(
      tokens[0],
      tokens[1],
      100000000,
      10240,
      true
    );

    await router.swap(tokens[0], tokens[1], 100000000, 10240, {
      value: amounts[0],
    });

    amounts = await router.swapQuote(
      tokens[0],
      tokens[1],
      100000000,
      20480,
      true
    );

    let ethBalanceBefore = new BN(await web3.eth.getBalance(owner));
    let tokenBalanceBefore = new BN(await token1.balanceOf(owner));

    let receipt = await router.swap(tokens[0], tokens[1], 100000000, 20480, {
      from: owner,
      value: amounts[0],
    });

    let gasAmount = new BN(receipt.receipt.gasUsed).mul(
      new BN(receipt.receipt.effectiveGasPrice)
    );
    let ethBalanceAfter = new BN(await web3.eth.getBalance(owner)).add(
      gasAmount
    );
    let tokenBalanceAfter = new BN(await token1.balanceOf(owner));

    console.log("Sorted ?: ", Sorted);
    console.log("eth: ", amounts[0].toString(), amounts[1].toString());
    console.log(
      "token: ",
      tokenBalanceBefore.toString(),
      tokenBalanceBefore.sub(tokenBalanceAfter).toString()
    );
    console.log(
      "eth: ",
      ethBalanceBefore.toString(),
      ethBalanceBefore.sub(ethBalanceAfter).toString()
    );
    assert(!ethBalanceBefore.eq(ethBalanceAfter), "No ETH received");

    assert(
      ethBalanceBefore.eq(ethBalanceAfter.add(new BN(amounts[0]))),
      "Wrong amount of ETH sent"
    );
    assert(
      tokenBalanceBefore.eq(tokenBalanceAfter.sub(new BN(amounts[1]))),
      "Wrong amount of tokens sent"
    );
  });
  it("Swap WBNB down wbnb lt token1", async () => {
    await router.createPool(wbnb.address, token1.address, 1024);

    let tokens = sort(token1.address, wbnb.address);
    let Sorted = sorted(token1.address, wbnb.address);
    let wbnbFirst = sort(wbnb.address, token1.address)[0] == wbnb.address;
    let amounts = await router.addPositionView(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000
    );
    console.log("Sorted?: ", Sorted);
    await router.addPosition(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000,
      {
        from: owner,
        value: amounts.token1Amount,
      }
    );

    amounts = await router.swapQuote(
      tokens[0],
      tokens[1],
      10000000000,
      -20480,
      true
    );

    //TODO:Some wrong amount is sent both eth an dtokenBalance from
    //owner are smaller than before
    let tokenBalanceBefore = await token1.balanceOf(owner);
    let ethBalanceBefore = new BN(await web3.eth.getBalance(owner));
    console.log("eth: ", amounts[0].toString(), amounts[1].toString());
    let receipt = await router.swap(tokens[0], tokens[1], 10000000000, -20480, {
      value: amounts[0],
    });

    let gasAmount = new BN(receipt.receipt.gasUsed).mul(
      new BN(receipt.receipt.effectiveGasPrice)
    );
    let tokenBalanceAfter = await token1.balanceOf(owner);
    let ethBalanceAfter = new BN(await web3.eth.getBalance(owner)).add(
      gasAmount
    );
    console.log(
      "token: ",
      tokenBalanceBefore.toString(),
      tokenBalanceBefore.sub(tokenBalanceAfter).toString()
    );
    console.log(
      "eth: ",
      ethBalanceBefore.toString(),
      ethBalanceBefore.sub(ethBalanceAfter).toString()
    );
    assert(!ethBalanceBefore.eq(ethBalanceAfter), "No ETH received");

    assert(
      ethBalanceBefore.eq(ethBalanceAfter.add(new BN(amounts[0]))),
      "Wrong amount of ETH sent"
    );

    assert(
      tokenBalanceAfter.sub(tokenBalanceBefore).eq(new BN(amounts[1])),
      "Wrong amount of tokens sent"
    );
  });
  it("Swap WBNB down token1 lt wbnb", async () => {
    await router.createPool(wbnb.address, token1.address, 1024);

    let tokens = sort(token1.address, wbnb.address);
    let Sorted = sorted(token1.address, wbnb.address);
    let wbnbFirst = sort(wbnb.address, token1.address)[0] == wbnb.address;
    let amounts = await router.addPositionView(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000
    );
    console.log("Sorted?: ", Sorted);
    await router.addPosition(
      tokens[0],
      tokens[1],
      -5120,
      5120,
      100000000000000,
      {
        from: owner,
        value: amounts.token1Amount,
      }
    );

    amounts = await router.swapQuote(
      tokens[0],
      tokens[1],
      10000000000,
      -20480,
      true
    );

    let tokenBalanceBefore = await token1.balanceOf(owner);
    let ethBalanceBefore = new BN(await web3.eth.getBalance(owner));
    console.log("eth: ", amounts[0].toString(), amounts[1].toString());
    let receipt = await router.swap(tokens[0], tokens[1], 10000000000, -20480);

    let gasAmount = new BN(receipt.receipt.gasUsed).mul(
      new BN(receipt.receipt.effectiveGasPrice)
    );
    let tokenBalanceAfter = await token1.balanceOf(owner);
    let ethBalanceAfter = new BN(await web3.eth.getBalance(owner)).add(
      gasAmount
    );
    console.log(
      "token: ",
      tokenBalanceBefore.toString(),
      tokenBalanceBefore.sub(tokenBalanceAfter).toString()
    );
    console.log(
      "eth: ",
      ethBalanceBefore.toString(),
      ethBalanceBefore.sub(ethBalanceAfter).toString()
    );
    assert(!ethBalanceBefore.eq(ethBalanceAfter), "No ETH received");

    assert(
      ethBalanceBefore.eq(ethBalanceAfter.sub(new BN(amounts[1]))),
      "Wrong amount of ETH sent"
    );

    assert(
      tokenBalanceBefore.eq(tokenBalanceAfter.add(new BN(amounts[0]))),
      "Wrong amount of tokens sent"
    );
  });

  it("Try callbacks from non pool", async () => {
    await router.createPool(wbnb.address, token1.address, 1024);

    let amounts = await router.addPositionView(
      wbnb.address,
      token1.address,
      -5120,
      5120,
      100000000000000
    );

    await router.addPosition(
      wbnb.address,
      token1.address,
      -5120,
      5120,
      100000000000000,
      {
        from: owner,
        value: amounts[1],
      }
    );
    try {
      await router.swapCallback(1000000, token1.address, owner);
      assert.fail("Should have thrown");
    } catch (e) {
      console.log("Failed as expected");
    }
    try {
      await router.addPositionCallback(
        1000000,
        1000,
        wbnb.address,
        token1.address,
        owner
      );
      assert.fail("Should have thrown");
    } catch (e) {
      console.log("Failed as expected");
    }
  });
  it("Check Quotes", async () => {
    await router.createPool(wbnb.address, token1.address, 1024);

    let amounts = await router.addPositionView(
      wbnb.address,
      token1.address,
      -5120,
      5120,
      100000000000000
    );
    await router.addPosition(
      wbnb.address,
      token1.address,
      -5120,
      5120,
      100000000000000,
      {
        from: owner,
        value: amounts[1],
      }
    );

    let res = await router.swapQuote(
      wbnb.address,
      token1.address,
      12564544,
      20480,
      true
    );
    let res1 = await router.swapQuote(
      wbnb.address,
      token1.address,
      11318989,
      20480,
      false
    );

    assert(
      new BN(res1[0]).eq(new BN(res[0])),
      "ExactIn and ExactOut not equal"
    );
    assert(
      new BN(res1[1]).eq(new BN(res[1])),
      "ExactIn and ExactOut not equal"
    );
  });
});
