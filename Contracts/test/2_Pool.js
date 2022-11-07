const BN = require("bn.js");
const Pool = artifacts.require("JupyterSwapPool");
const Token = artifacts.require("TestToken");
let pool;
let token0;
let token1;
const DEC = "000000000000000000";

beforeEach("should setup the contract instance", async () => {
  token0 = await Token.new(
    "1000000000000000000000000000000000000000000000000000000"
  );
  token1 = await Token.new(
    "1000000000000000000000000000000000000000000000000000000"
  );
  pool = await Pool.new(2000, token0.address, token1.address,1024,token0.address);

  await token0.increaseAllowance(
    pool.address,
    "100000000000000000000000000000" + DEC
  );
  await token1.increaseAllowance(
    pool.address,
    "100000000000000000000000000000" + DEC
  );
});
async function swapAndPrint(_in, _limit) {
  await pool.swap(_in, _limit);
  let res = await pool.lastSwap();

  console.table([
    {
      in: res[0].toString(),
      out: res[1].toString(),
      remaining: res[2].toString(),
      loops: res[3].toString(),
      startTick: res[4].toString(),
      endTick: res[5].toString(),
      startPrice: res[6].toString(),
      endPrice: res[7].toString(),
      swapFees: res[8].toString(),
    },
  ]);
}

contract("Pool", ([owner, testAddress]) => {
  it("Add Position", async () => {
    let liquidity = new BN("1" + DEC);
    let lowerTick = new BN(-5120);
    let upperTick = new BN(256);
    await pool.addPosition(lowerTick, upperTick, liquidity);

    let res = await pool.positions(0);
    assert(res[0].eq(liquidity), "Wrong liquidity added");
    assert(
      res[1].eq(await token0.balanceOf(pool.address)),
      "Wrong balance0 added"
    );
    assert(
      res[2].eq(await token1.balanceOf(pool.address)),
      "Wrong balance1 added"
    );
    assert(res[3].eq(lowerTick), "Wrong lowerTick selected");
    assert(res[4].eq(upperTick), "Wrong upperTick selected");
    assert(res[5].toString() == owner, "Wrong owner");
  });
  it("Remove Position", async () => {
    let liquidity = new BN("1" + DEC);
    let lowerTick = new BN(-5120);
    let upperTick = new BN(256);
    await pool.addPosition(lowerTick, upperTick, liquidity);
    await pool.removePosition(0);
    let balance0 = await token0.balanceOf(pool.address);
    let balance1 = await token1.balanceOf(pool.address);

    assert(
      balance0.lt(new BN(100)),
      "Not all funds of token0 returned from position"
    );
    assert(
      balance1.lt(new BN(100)),
      "Not all funds of token1 returned from position"
    );
  });

  it("Try removing position not as owner", async () => {
    let liquidity = new BN("1000" + DEC);
    let lowerTick = new BN(-20480);
    let upperTick = new BN(5120);
    await pool.addPosition(lowerTick, upperTick, liquidity);

    try {
      await pool.removePosition(0, { from: testAddress });
      assert.fail("Should have thrown");
    } catch (err) {}
  });

  it("Try removing same position twice", async () => {
    let liquidity = new BN("1000" + DEC);
    let lowerTick = new BN(-20480);
    let upperTick = new BN(5120);
    await pool.addPosition(lowerTick, upperTick, liquidity);
    try {
      await pool.removePosition(0);
      await pool.removePosition(0);
      assert.fail("Should have thrown");
    } catch (err) {}
  });

  it("Swap 1 to 0", async () => {
    let liquidity = new BN("1000" + DEC);
    let lowerTick = new BN(-20480);
    let upperTick = new BN(5120);
    await pool.addPosition(lowerTick, upperTick, liquidity);

    let amount = new BN("1" + DEC);
    let balance0Before = await token0.balanceOf(pool.address);
    let balance1Before = await token1.balanceOf(pool.address);

    await pool.swap(amount, upperTick);
    let res = await pool.lastSwap();
    let balance0After = await token0.balanceOf(pool.address);
    let balance1After = await token1.balanceOf(pool.address);
    assert(
      balance0After.add(res[1]).eq(balance0Before),
      "Wrong amount of token0 sent"
    );
    assert(
      balance1Before.eq(balance1After.sub(amount)),
      "Wrong amount of token1 sent"
    );
  });

  it("Swap 0 to 1", async () => {
    let liquidity = new BN("1000" + DEC);
    let lowerTick = new BN(-20480);
    let upperTick = new BN(5120);
    await pool.addPosition(lowerTick, upperTick, liquidity);

    let amount = new BN("1" + DEC);
    let balance0Before = await token0.balanceOf(pool.address);
    let balance1Before = await token1.balanceOf(pool.address);
    await pool.swap(amount, -64000);
    let res = await pool.lastSwap();
    let balance0After = await token0.balanceOf(pool.address);
    let balance1After = await token1.balanceOf(pool.address);
    assert(
      balance1After.add(res[1]).eq(balance1Before),
      "Wrong amount of token1 sent"
    );

    assert(
      balance0Before.eq(balance0After.sub(amount)),
      "Wrong amount of token0 sent"
    );
  });
  it("Withdraw uncollected fees swapping down", async () => {
    let liquidity = new BN("1000" + DEC);
    let lowerTick = new BN(-20480);
    let upperTick = new BN(5120);
    await pool.addPosition(lowerTick, upperTick, liquidity);
    let amount = new BN("1" + DEC);
    await pool.swap(amount, -64000);
    let balance0Before = await token0.balanceOf(pool.address);
    let balance1Before = await token1.balanceOf(pool.address);
    await pool.withdrawUncollectedFees(0);
    let balance0After = await token0.balanceOf(pool.address);
    let balance1After = await token1.balanceOf(pool.address);
    assert(balance0After < balance0Before, "Fees not withdrwan");
    assert(balance1Before.eq(balance1After), "Fees withdrawn from wrong side");
    await pool.removePosition(0);
    await pool.withdrawUncollectedProtocolFees();
    let res0 = await token0.balanceOf(pool.address);
    let res1 = await token1.balanceOf(pool.address);
    assert(res0.lt(new BN(5)), "Calculation error res 0");
    assert(res1.lt(new BN(5)), "Calculation error res 1");
  });
  it("Withdraw uncollected fees swapping up", async () => {
    let liquidity = new BN("1000" + DEC);
    let lowerTick = new BN(-20480);
    let upperTick = new BN(5120);
    await pool.addPosition(lowerTick, upperTick, liquidity);
    let amount = new BN("1" + DEC);
    await pool.swap(amount, 64000);
    let balance0Before = await token0.balanceOf(pool.address);
    let balance1Before = await token1.balanceOf(pool.address);
    await pool.withdrawUncollectedFees(0);
    let balance0After = await token0.balanceOf(pool.address);
    let balance1After = await token1.balanceOf(pool.address);
    assert(balance1After < balance1Before, "Fees not withdrwan");
    assert(balance0Before.eq(balance0After), "Fees withdrawn from wrong side");
    await pool.removePosition(0);
    await pool.withdrawUncollectedProtocolFees();
    let res0 = await token0.balanceOf(pool.address);
    let res1 = await token1.balanceOf(pool.address);
    assert(res0.lt(new BN(5)), "Calculation error res 0");
    assert(res1.lt(new BN(5)), "Calculation error res 1");
  });

  it("Withdraw uncollected protocol fees swapping up", async () => {
    let liquidity = new BN("1000" + DEC);
    let lowerTick = new BN(-20480);
    let upperTick = new BN(5120);
    await pool.addPosition(lowerTick, upperTick, liquidity);
    let amount = new BN("1" + DEC);
    await pool.swap(amount, 64000);
    let balance0Before = await token0.balanceOf(pool.address);
    let balance1Before = await token1.balanceOf(pool.address);
    await pool.withdrawUncollectedProtocolFees();
    let balance0After = await token0.balanceOf(pool.address);
    let balance1After = await token1.balanceOf(pool.address);
    assert(balance1After < balance1Before, "Fees not withdrwan");
    assert(balance0Before.eq(balance0After), "Fees withdrawn from wrong side");
    await pool.removePosition(0);
    await pool.withdrawUncollectedProtocolFees();
    let res0 = await token0.balanceOf(pool.address);
    let res1 = await token1.balanceOf(pool.address);
    assert(res0.lt(new BN(5)), "Calculation error res 0");
    assert(res1.lt(new BN(5)), "Calculation error res 1");
  });

  it("Withdraw uncollected protocol fees swapping down", async () => {
    let liquidity = new BN("1000" + DEC);
    let lowerTick = new BN(-20480);
    let upperTick = new BN(5120);
    await pool.addPosition(lowerTick, upperTick, liquidity);
    let amount = new BN("1" + DEC);
    await pool.swap(amount, -64000);
    let balance0Before = await token0.balanceOf(pool.address);
    let balance1Before = await token1.balanceOf(pool.address);
    await pool.withdrawUncollectedProtocolFees();
    let balance0After = await token0.balanceOf(pool.address);
    let balance1After = await token1.balanceOf(pool.address);
    assert(balance0After < balance0Before, "Fees not withdrwan");
    assert(balance1Before.eq(balance1After), "Fees withdrawn from wrong side");
    await pool.removePosition(0);
    await pool.withdrawUncollectedProtocolFees();
    let res0 = await token0.balanceOf(pool.address);
    let res1 = await token1.balanceOf(pool.address);
    assert(res0.lt(new BN(5)), "Calculation error res 0");
    assert(res1.lt(new BN(5)), "Calculation error res 1");
  });

  it("Withdraw multiple", async () => {
    let liquidity = new BN("1000" + DEC);
    let lowerTick = new BN(-20480);
    let upperTick = new BN(5120);
    await pool.addPosition(lowerTick, upperTick, liquidity);
    await pool.addPosition(lowerTick, -upperTick, liquidity);
    await pool.addPosition(-upperTick, -lowerTick, liquidity);

    let amount = new BN("1" + DEC);
    await pool.swap(amount, -64000);
    await pool.removePosition(0);
    await pool.withdrawUncollectedProtocolFees();
    await pool.removePosition(1);
    await pool.withdrawUncollectedFees(2);
    await pool.removePosition(2);

    let res0 = await token0.balanceOf(pool.address);
    let res1 = await token1.balanceOf(pool.address);
    assert(res0.lt(new BN(5)), "Calculation error res 0");
    assert(res1.lt(new BN(5)), "Calculation error res 1");
  });

  /*
  it("Positions tick inside down", async () => {
    const LIQUIDITY_AMOUNT = "100" + DEC;
    await token0.increaseAllowance(
      pool.address,
      "100000000000000000000000000000" + DEC
    );
    await token1.increaseAllowance(
      pool.address,
      "100000000000000000000000000000" + DEC
    );
    await pool.addPosition(-256000, 256000, LIQUIDITY_AMOUNT);
    await pool.addPosition(-256, 20480, LIQUIDITY_AMOUNT);
    await pool.addPosition(5120, 20480, LIQUIDITY_AMOUNT);
    await pool.addPosition(-20480, 64000, LIQUIDITY_AMOUNT);
    await pool.addPosition(-40960, 64000, LIQUIDITY_AMOUNT);
    await pool.addPosition(-128, 10240, LIQUIDITY_AMOUNT);
    await pool.addPosition(5120, 20480, LIQUIDITY_AMOUNT);

    res = await token0.balanceOf(pool.address);
    console.log("Balance: ", res.toString());
    res = await token1.balanceOf(pool.address);
    console.log("Balance: ", res.toString());

    res = await pool.positions(0);
    console.log(
      res[0].toString(),
      res[1].toString(),
      res[2].toString(),
      res[3].toString(),
      res[4].toString()
    );

    //await pool.removePosition(0);
    res = await pool.positions(1);
    console.log(
      res[0].toString(),
      res[1].toString(),
      res[2].toString(),
      res[3].toString(),
      res[4].toString()
    );
    res = await pool.positions(2);
    console.log(
      res[0].toString(),
      res[1].toString(),
      res[2].toString(),
      res[3].toString(),
      res[4].toString()
    );
    res = await pool.positions(3);
    console.log(
      res[0].toString(),
      res[1].toString(),
      res[2].toString(),
      res[3].toString(),
      res[4].toString()
    );
    res = await pool.positions(4);
    console.log(
      res[0].toString(),
      res[1].toString(),
      res[2].toString(),
      res[3].toString(),
      res[4].toString()
    );
    res = await pool.positions(5);
    console.log(
      res[0].toString(),
      res[1].toString(),
      res[2].toString(),
      res[3].toString(),
      res[4].toString()
    );
    res = await pool.positions(6);
    console.log(
      res[0].toString(),
      res[1].toString(),
      res[2].toString(),
      res[3].toString(),
      res[4].toString()
    );

    //53193937935976156735087099518t
    res = await pool.liquidity();
    console.log(res.toString());

    //await pool.removePosition(0);
    //await pool.removePosition(1);
    //await pool.removePosition(2);
    //await pool.removePosition(3);
    //await pool.removePosition(4);
    //await pool.removePosition(5);
    //await pool.removePosition(5);
    //await pool.removePosition(6);

    res = await pool.getFlag(-16384);
    console.log(res.toString());
    res = await token0.balanceOf(pool.address);
    console.log("Balance: ", res.toString());
    res = await token1.balanceOf(pool.address);
    console.log("Balance: ", res.toString());

    //await swapAndPrint("10000" + "000000000000000000000", 64000,{gas:3000000});
    //await swapAndPrint("10000" + "000000000000000000000", 64000,{gas:3000000});

    const SWAP_AMOUNT = "100" + DEC;

    //await swapAndPrint(SWAP_AMOUNT, -64000, { gas: 3000000 });
    await pool.addPosition(-64000, 640000,  LIQUIDITY_AMOUNT);

    //await swapAndPrint(SWAP_AMOUNT, -64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT,64000, { gas: 3000000 });
    for (let i = 0; i < 64; i++) {
      await swapAndPrint(
        (Math.random() * 100).toFixed(0).toString() + DEC,
        i % 2 == 0 ? -256000 : 256000,
        {
          gas: 3000000,
        }
      );
    }

    //await swapAndPrint(SWAP_AMOUNT, -64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, -64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, -64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, -64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, -64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, -64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, -64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, -64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    //
    res = await pool.ticks(5120);
    console.log(
      res[0].toString(),
      res[1].toString(),
      res[2].toString(),
      res[3].toString(),
      res[4].toString()
    );
    res = await pool.ticks(20480);
    console.log(
      res[0].toString(),
      res[1].toString(),
      res[2].toString(),
      res[3].toString(),
      res[4].toString()
    );

    //await swapAndPrint(SWAP_AMOUNT,-64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT,-64000, { gas: 3000000 });

    //await swapAndPrint(SWAP_AMOUNT,-64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT,64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT,64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT,64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT,64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT,-64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT,64000, { gas: 3000000 });

    //await swapAndPrint(SWAP_AMOUNT,64000, { gas: 3000000 });

    //await swapAndPrint(SWAP_AMOUNT,64000, { gas: 3000000 });
    //

    //await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    //await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });

    //await balances(owner, pool.address);
    //await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    //await balances(owner, pool.address);

    res = await token0.balanceOf(pool.address);
    console.log("Balance: ", res.toString());
    res = await token1.balanceOf(pool.address);
    console.log("Balance: ", res.toString());

    res = await pool.feeGlobal0();
    console.log("Collected Global Fees: ", res.toString());
    res = await pool.feeGlobal1();
    console.log("Collected Global Fees: ", res.toString());

    let sum0 = new BN(0);
    let sum1 = new BN(0);
    res = await pool.getCollectedFees(0);
    console.log("Collected Fees: ", res[0].toString(), res[1].toString());
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    res = await pool.getCollectedFees(1);
    console.log("Collected Fees: ", res[0].toString(), res[1].toString());
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    res = await pool.getCollectedFees(2);
    console.log("Collected Fees: ", res[0].toString(), res[1].toString());
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    res = await pool.getCollectedFees(3);
    console.log("Collected Fees: ", res[0].toString(), res[1].toString());
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    res = await pool.getCollectedFees(4);
    console.log("Collected Fees: ", res[0].toString(), res[1].toString());
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    res = await pool.getCollectedFees(5);
    console.log("Collected Fees: ", res[0].toString(), res[1].toString());
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    res = await pool.getCollectedFees(6);
    console.log("Collected Fees: ", res[0].toString(), res[1].toString());
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    console.log("Sum0: ", sum0.toString());
    console.log("Sum1: ", sum1.toString());
    //await pool.removePosition(2);
    //await pool.removePosition(3);
    //await pool.removePosition(4);

    //res = await pool.removePosition(1);
    //res = await pool.removePosition(0);

    sum0 = new BN(0);
    sum1 = new BN(0);
    res = await pool.removePositionView(0);
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    console.log(res[0].toString(), res[1].toString());
    res = await pool.removePositionView(1);
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    console.log(res[0].toString(), res[1].toString());
    res = await pool.removePositionView(2);
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    console.log(res[0].toString(), res[1].toString());
    res = await pool.removePositionView(3);
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    console.log(res[0].toString(), res[1].toString());
    res = await pool.removePositionView(4);
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    console.log(res[0].toString(), res[1].toString());
    res = await pool.removePositionView(5);
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    console.log(res[0].toString(), res[1].toString());
    res = await pool.removePositionView(6);
    sum0 = sum0.add(res[0]);
    sum1 = sum1.add(res[1]);
    console.log(res[0].toString(), res[1].toString());
    console.log("Sum0: ", sum0.toString());
    console.log("Sum1: ", sum1.toString());

    //await pool.removePosition(5);
    res = await token0.balanceOf(pool.address);
    console.log("Balance: ", res.toString());
    res = await token1.balanceOf(pool.address);
    console.log("Balance: ", res.toString());
    res = await pool.liquidity();
    console.log(res.toString());


    await pool.removePosition(0);
    res = await pool.liquidity();
    console.log(res.toString());
    await pool.removePosition(1);
    res = await pool.liquidity();
    console.log(res.toString());
    await pool.removePosition(2);
    res = await pool.liquidity();
    console.log(res.toString());
    await pool.removePosition(3);
    res = await pool.liquidity();
    console.log(res.toString());
    await pool.removePosition(4);
    res = await pool.liquidity();
    console.log(res.toString());
    await pool.removePosition(5);
    res = await pool.liquidity();
    console.log(res.toString());
    await pool.removePosition(6);
    res = await pool.liquidity();
    console.log(res.toString());



    await pool.addPosition(-64000, 640000,  LIQUIDITY_AMOUNT);


    res = await pool.currentSqrtPrice();
    console.log(res.toString());

    res = await pool.currentTick();
    console.log(res.toString());

    res = await pool.liquidity();
    console.log(res.toString());

    //await swapAndPrint(SWAP_AMOUNT, -64000, { gas: 3000000 });
    await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });
    await swapAndPrint(SWAP_AMOUNT, 64000, { gas: 3000000 });



    res = await token0.balanceOf(pool.address);
    console.log("Balance: ", res.toString());
    res = await token1.balanceOf(pool.address);
    console.log("Balance: ", res.toString());


    res = await pool.getCollectedFees(7);
    console.log("Collected Fees: ", res[0].toString(), res[1].toString());

    res = await pool.getCollectedFees(8);
    console.log("Collected Fees: ", res[0].toString(), res[1].toString());

    res = await pool.removePositionView(7);
    console.log(res[0].toString(), res[1].toString());
    await pool.removePosition(7);

    res = await pool.removePositionView(8);
    console.log(res[0].toString(), res[1].toString());
    await pool.removePosition(8);

    res = await token0.balanceOf(pool.address);
    console.log("Balance: ", res.toString());
    res = await token1.balanceOf(pool.address);
    console.log("Balance: ", res.toString());

    res = await pool.collectedProtocolFees0();
    console.log("ProtocolFees0: ", res.toString());
    res = await pool.collectedProtocolFees1();
    console.log("ProtocolFees1: ", res.toString());

  });
  /*
    res = await pool.ticks(1088);
    console.log(
      res[0].toString(),
      res[1].toString(),
      res[2].toString(),
      res[3].toString(),
      res[4].toString(),
    );
    res = await pool.liquidity();
    console.log(res.toString());
    29850091448963849696232905952056236525
    14924310199681572304359913598297653670
  });
  */
  /*
  it("Buy", async () => {
    await pool.addPosition(64, 256, "1" + "000000000000000000000000000");
    let res = await pool.positions(0);
    await pool.addPosition(512, 1024, "1" + "000000000000000000000000000");
    await pool.addPosition(1088, 5120, "1" + "0000000000000000000000000000000");
    res = await pool.liquidity();
    console.log(res.toString());

    await swapAndPrint("1" + "0000000000000000000", 1088);
    await swapAndPrint("100" + "0000000000000000000", 1088);
    await swapAndPrint("200" + "0000000000000000000", 1088);
    await swapAndPrint("500" + "0000000000000000000", 1088);
    await swapAndPrint("1000000" + "0000000000000000000", 1088);
    await swapAndPrint("1000000" + "0000000000000000000", 1088);

    await swapAndPrint("1000000" + "0000000000000000000", 1088);
    await swapAndPrint("1000000" + "0000000000000000000", 5120);

    res = await pool.getCollectedFees(1);
    console.log("Collected Fees: ", res.toString());
  });
  
  });
*/
});

/*
Collected Fees:  3139408267788015517922562 10020040080160320641
Collected Fees:  3139408267788015517922562 10020040080160320641
Collected Fees:  9408815987376669883883 10020040080160320641
Collected Fees:  144040673714402946006244825 10020040080160320641
Collected Fees:  144040673714402946006244825 10020040080160320641
*/
