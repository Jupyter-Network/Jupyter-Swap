const BN = require("bn.js");

const { NAME, SYMBOL, TOTALSUPPLY, DECIMALS } = require("../CONSTANT");
const Router = artifacts.require("JupyterRouterV1");
const Token = artifacts.require("Token");

const decimals = "".padStart(7, "0");
const amount = "1" + decimals;

let router;
let token0;
let token1;
beforeEach("should setup the contract instance", async () => {
  token0 = await Token.new();
  token1 = await Token.new();
});

contract("Router", ([owner, testAddress, testAddress2]) => {
  
  it("Create Pool", async () => {
    router = await Router.new(testAddress2);    await token0.transfer(testAddress, amount * 10);
    await token1.transfer(testAddress, amount * 10);
    await token0.increaseAllowance(router.address, amount * 10);
    await token1.increaseAllowance(router.address, amount * 10);
    await token0.increaseAllowance(router.address, amount * 10, {
      from: testAddress,
    });
    await token1.increaseAllowance(router.address, amount * 10, {
      from: testAddress,
    });

    await router.createLiquidityPool(
      token0.address,
      token1.address,
      amount,
      amount
    );
    assert(
      parseInt(await router.getBalance(token0.address, token1.address)) ===
        parseInt(amount) * parseInt(amount),
      "Mint failed"
    );
  });
  it("Add Liquidity", async () => {
    await token0.transfer(testAddress, amount * 10);
    await token1.transfer(testAddress, amount * 10);
    await token0.increaseAllowance(router.address, amount * 10);
    await token1.increaseAllowance(router.address, amount * 10);
    await token0.increaseAllowance(router.address, amount * 10, {
      from: testAddress,
    });
    await token1.increaseAllowance(router.address, amount * 10, {
      from: testAddress,
    });

    await router.createLiquidityPool(
      token0.address,
      token1.address,
      amount,
      amount
    );

    await router.addLiquidity(token0.address, token1.address, amount, amount);
    assert(
      parseInt(await router.getBalance(token0.address, token1.address)) ===
        2 * parseInt(amount) * parseInt(amount),
      "Mint failed"
    );
  });
  it("Remove Liquidity", async () => {
    await token0.transfer(testAddress, amount * 10);
    await token1.transfer(testAddress, amount * 10);
    await token0.increaseAllowance(router.address, amount * 10);
    await token1.increaseAllowance(router.address, amount * 10);
    await token0.increaseAllowance(router.address, amount * 10, {
      from: testAddress,
    });
    await token1.increaseAllowance(router.address, amount * 10, {
      from: testAddress,
    });

    await router.createLiquidityPool(
      token0.address,
      token1.address,
      amount,
      amount
    );

    await router.addLiquidity(token0.address, token1.address, amount, amount);

    await router.addLiquidity(token0.address, token1.address, amount, amount, {
      from: testAddress,
    });

    await router.removeLiquidity(token0.address, token1.address);
    //assert(parseInt(await router.getBalance(token0.address,token1.address)) ===  0,"Burn failed");
    assert(
      parseInt(await router.getBalance(token0.address, token1.address)) === 0,
      "Burn failed"
    );

    assert(
      parseInt(
        await router.getBalance(token0.address, token1.address, {
          from: testAddress,
        })
      ) ===
        parseInt(amount) * parseInt(amount),
      "Burn failed"
    );

    await router.removeLiquidity(token0.address, token1.address, {
      from: testAddress,
    });
    assert(
      parseInt(
        await router.getBalance(token0.address, token1.address, {
          from: testAddress,
        })
      ) === 0,
      "Burn failed"
    );
  });
  it("Swap", async () => {
    await token0.transfer(testAddress, amount * 10);
    await token1.transfer(testAddress, amount * 10);
    await token0.increaseAllowance(router.address, amount * 10);
    await token1.increaseAllowance(router.address, amount * 10);
    await token0.increaseAllowance(router.address, amount * 10, {
      from: testAddress,
    });
    await token1.increaseAllowance(router.address, amount * 10, {
      from: testAddress,
    });

    await router.createLiquidityPool(
      token0.address,
      token1.address,
      amount,
      amount
    );

    await router.addLiquidity(token0.address, token1.address, amount, amount);
    await router.addLiquidity(token0.address, token1.address, amount, amount);
    await router.addLiquidity(token0.address, token1.address, amount, amount);
    await router.addLiquidity(token0.address, token1.address, amount, amount);

    await router.addLiquidity(token0.address, token1.address, amount, amount, {
      from: testAddress,
    });

    const tok =
      token0.address < token1.address ? [token0, token1] : [token1, token0];

    let token0Wallet = await tok[0].balanceOf(owner);
    let token1Wallet = await tok[1].balanceOf(owner);

    let changeAmount = parseInt(
      await router.getToken1AmountFromToken0Amount(
        token0.address,
        token1.address,
        amount
      )
    );

    await router.swapToken0ToToken1(
      token0.address,
      token1.address,
      amount,
      changeAmount
    );

    assert(
      (await tok[0].balanceOf(owner)).eq(token0Wallet.sub(new BN(amount))),
      "Swap error: token 0 not sent"
    );

    assert(
      (await tok[1].balanceOf(owner)).eq(
        token1Wallet.add(new BN(changeAmount))
      ),
      "Swap error: token 1 not received"
    );

    token0Wallet = await tok[0].balanceOf(owner);
    token1Wallet = await tok[1].balanceOf(owner);

    changeAmount = parseInt(
      await router.getToken0AmountFromToken1Amount(
        token0.address,
        token1.address,
        amount
      )
    );

    await router.swapToken1ToToken0(
      token0.address,
      token1.address,
      amount,
      changeAmount
    );

    assert(
      (await tok[0].balanceOf(owner)).eq(
        token0Wallet.add(new BN(changeAmount))
      ),
      "Swap error: token 0 not received"
    );

    assert(
      (await tok[1].balanceOf(owner)).eq(token1Wallet.sub(new BN(amount))),
      "Swap error: token 1 not sent"
    );
  });
  it("Protocol Fees", async () => {
    router = await Router.new(testAddress2);    await token0.transfer(testAddress, amount * 100);
    await token1.transfer(testAddress, amount * 100);
    await token0.increaseAllowance(router.address, amount * 1000);
    await token1.increaseAllowance(router.address, amount * 1000);
    await token0.increaseAllowance(router.address, amount * 100, {
      from: testAddress,
    });
    await token1.increaseAllowance(router.address, amount * 10, {
      from: testAddress,
    });

    await router.createLiquidityPool(
      token0.address,
      token1.address,
      amount,
      amount
    );

    await router.addLiquidity(
      token0.address,
      token1.address,
      amount * 100,
      amount * 100
    );

    changeAmount = parseInt(
      await router.getToken1AmountFromToken0Amount(
        token0.address,
        token1.address,
        amount,
        { from: testAddress }
      )
    );

    await router.swapToken0ToToken1(
      token0.address,
      token1.address,
      amount,
      changeAmount,
      { from: testAddress }
    );

    changeAmount = parseInt(
      await router.getToken0AmountFromToken1Amount(
        token0.address,
        token1.address,
        amount,
        { from: testAddress }
      )
    );

    await router.swapToken1ToToken0(
      token0.address,
      token1.address,
      amount,
      changeAmount,
      { from: testAddress }
    );

    const tok =
      token0.address < token1.address ? [token0, token1] : [token1, token0];

    let rate = await router.getRate(token0.address, token1.address);
    let scaleFactor = new BN(10).pow(new BN(18));

    //Beneficiary
    let token0BalanceBefore = new BN(await tok[0].balanceOf(testAddress2));
    let token1BalanceBefore = new BN(await tok[1].balanceOf(testAddress2));
    await router.removeLiquidity(token0.address, token1.address, {
      from: testAddress2,
    });
    let token0BalanceAfter = new BN(await tok[0].balanceOf(testAddress2));
    let token1BalanceAfter = new BN(await tok[1].balanceOf(testAddress2));

    let delta0 = token0BalanceAfter.sub(token0BalanceBefore);

    let delta1 = token1BalanceAfter.sub(token1BalanceBefore);

    delta1 = delta1.mul(rate).div(scaleFactor);

    delta0 = delta0.mul(scaleFactor).div(rate);
    total = delta0.add(delta1);

    let percentage = (total.toNumber() / new BN(amount).toNumber()) * 100;
    assert(
      percentage > 0.053 && percentage <= 0.066,
      "Beneficiary Earnings are too low / high"
    );

    //owner account[0]
    token0BalanceBefore = new BN(await tok[0].balanceOf(owner));
    token1BalanceBefore = new BN(await tok[1].balanceOf(owner));
    await router.removeLiquidity(token0.address, token1.address, {
      from: owner,
    });
    token0BalanceAfter = new BN(await tok[0].balanceOf(owner));
    token1BalanceAfter = new BN(await tok[1].balanceOf(owner));
    delta0 = token0BalanceAfter.sub(
      token0BalanceBefore.add(new BN(amount).mul(new BN(101)))
    );

    delta1 = token1BalanceAfter.sub(
      token1BalanceBefore.add(new BN(amount).mul(new BN(101)))
    );

    delta1 = delta1.mul(rate).div(scaleFactor);
    delta0 = delta0.mul(scaleFactor).div(rate);
    total = delta0.add(delta1);
    percentage = (total.toNumber() / new BN(amount).toNumber()) * 100;
    assert(
      percentage > 0.53 && percentage <= 0.66,
      "Owner Earnings are too low / high"
    );
  });
  it("Force Feed", async () => {
    router = await Router.new(testAddress2);
    await token0.transfer(testAddress, amount * 100);
    await token1.transfer(testAddress, amount * 100);
    await token0.increaseAllowance(router.address, amount * 10000000);
    await token1.increaseAllowance(router.address, amount * 10000000);
    await token0.increaseAllowance(router.address, amount * 10000, {
      from: testAddress,
    });
    await token1.increaseAllowance(router.address, amount * 100000, {
      from: testAddress,
    });

    await router.createLiquidityPool(
      token0.address,
      token1.address,
      new BN(amount).mul(new BN(100))
      ,
      new BN(amount).mul(new BN(1))
    );

    await router.addLiquidity(
      token0.address,
      token1.address,
      new BN(amount).mul(new BN(100))
      ,
      new BN(amount).mul(new BN(1))
    );

    changeAmount = parseInt(
      await router.getToken1AmountFromToken0Amount(
        token0.address,
        token1.address,
        amount,
        { from: testAddress }
      )
    );

    await router.swapToken0ToToken1(
      token0.address,
      token1.address,
      amount,
      changeAmount,
      { from: testAddress }
    );

    for (let i = 0; i < 3; i++) {
      changeAmount = parseInt(
        await router.getToken0AmountFromToken1Amount(
          token0.address,
          token1.address,
          amount,
          { from: testAddress }
        )
      );

      await router.swapToken1ToToken0(
        token0.address,
        token1.address,
        amount,
        changeAmount,
        { from: testAddress }
      );
    }

    let rate = await router.getRate(token0.address, token1.address);

    let depositAmount = await router.getDepositAmount(
      token0.address,
      token1.address,
      new BN(amount).mul(new BN(20))
    );
    let balances = await router.getPoolBalances(token0.address, token1.address);


     await token1.transfer(
      await router.getAddress(token0.address, token1.address),
      new BN(amount).mul(new BN(100))
    );


    let rate1 = await router.getRate(token0.address, token1.address);

    balances = await router.getPoolBalances(token0.address, token1.address);
    assert(
      rate.eq(rate1),
      "Possible Force Feed Vulnerability"
    );
  });

});
