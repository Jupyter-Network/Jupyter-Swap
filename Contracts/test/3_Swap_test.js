const { NAME, SYMBOL, TOTALSUPPLY, DECIMALS } = require("../CONSTANT");
const Swap = artifacts.require("JupyterCoreV1");
const Token = artifacts.require("Token");
const BN = require("bn.js");

const decimals = "".padStart(7, "0");
const amount = new BN("1" + decimals);

let swap;
let token0;
let token1;
beforeEach("should setup the contract instance", async () => {
  token0 = await Token.new();
  token1 = await Token.new();
  swap = await Swap.new(token0.address, token1.address, token0.address);
});
contract("Swap", ([owner, testAddress, testAddress2]) => {
  it("Initial Deposit", async () => {
    await token0.increaseAllowance(swap.address, amount);
    await token1.increaseAllowance(swap.address, amount);

    await swap.initialDeposit(amount, amount, owner);

    let swapTokenBalance = await swap.balanceOf(owner);

    assert(swapTokenBalance.eq(amount.sqr()), "SwapToken not received by user");
    let swapTokenTotalSupply = await swap.totalSupply();
    assert(swapTokenTotalSupply.eq(amount.sqr()), "SwapToken mint error");

    let token1Balance = await swap.token1Balance();
    assert(
      token1Balance.eq(amount),
      "Pool did not receive token1" + token1Balance.toString()
    );
  });

  it("Deposit", async () => {
    await token0.increaseAllowance(swap.address, amount * 5);
    await token1.increaseAllowance(swap.address, amount * 5);

    await swap.initialDeposit(amount, amount, owner);
    await token0.increaseAllowance(swap.address, amount * 5);
    await token1.increaseAllowance(swap.address, amount * 5);
    await swap.deposit(amount, amount, owner);
    //
    let swapTokenBalance = await swap.balanceOf(owner);

    assert(
      swapTokenBalance.eq(amount.sqr().mul(new BN(2))),
      "SwapToken not received by user"
    );
    //
    let swapTokenTotalSupply = await swap.totalSupply();
    assert(
      swapTokenTotalSupply.eq(amount.sqr().mul(new BN(2))),
      "SwapToken mint error"
    );
    //
    let token1Balance = await swap.token1Balance();
    assert(
      token1Balance.eq(amount.mul(new BN(2))),
      "Pool did not receive token1" + token1Balance.toString()
    );
    //
    let tokenBalance = await swap.token0Balance();
    assert(
      tokenBalance.eq(amount.mul(new BN(2))),
      "Pool did not receive tokens"
    );
  });
  /*
  it("Deposit second user", async () => {
    await token0.transfer(testAddress, amount);
    await token1.transfer(testAddress, amount);
    await token0.increaseAllowance(swap.address, amount);
    await token1.increaseAllowance(swap.address, amount);
    await swap.initialDeposit(amount, amount,owner);
    await token0.increaseAllowance(swap.address, amount, { from: testAddress });
    await token1.increaseAllowance(swap.address, amount, { from: testAddress });

    await swap.deposit(amount,amount,testAddress, { from: testAddress });

    //
    let swapTokenBalance = await swap.balanceOf(testAddress);
    assert(
      swapTokenBalance.eq(amount.sqr()),
      "SwapToken not received by user"
    );
    //
    let swapTokenTotalSupply = await swap.totalSupply();
    assert(
      swapTokenTotalSupply.eq(amount.sqr().mul(new BN(2))),
      "SwapToken mint error"
    );
    //
    let etherBalance = await swap.token1Balance();
    assert(
      etherBalance.toString() === "2" + decimals,
      "Pool did not receive token 1"
    );
    //
    let tokenBalance = await swap.token0Balance();
    assert(
      tokenBalance.toString() === "2" + decimals,
      "Pool did not receive token 0"
    );
  });

  it("Withdraw", async () => {
    await token0.transfer(testAddress, amount);
    await token1.transfer(testAddress, amount);

    await token0.increaseAllowance(swap.address, amount);
    await token1.increaseAllowance(swap.address, amount);

    await swap.initialDeposit(amount, amount,owner);
    await token0.increaseAllowance(swap.address, amount, { from: testAddress });
    await token1.increaseAllowance(swap.address, amount, { from: testAddress });

    await swap.depositToken0(amount, { from: testAddress });

    let ethWallet = await token1.balanceOf(testAddress);
    await swap.withdraw({ from: testAddress });
    assert(
      ethWallet < (await token1.balanceOf(testAddress)),
      "No ether received"
    );
    //
    let swapTokenBalance = await swap.balanceOf(testAddress);
    assert(swapTokenBalance.toString() == "0" , "SwapToken not burnt"-swapTokenBalance.toString());
    //
    let swapTokenTotalSupply = await swap.totalSupply();
    assert(
      swapTokenTotalSupply.toString() == "1" + (amount * amount).toString().slice(1),
      "SwapToken not burnt"
    );
    //
    let etherBalance = await swap.token1Balance();
    assert(
      etherBalance.toString() === "1" + decimals,
      "ether not withdrawn from pool"
    );
    //
    let tokenBalance = await swap.token0Balance();
    assert(
      tokenBalance.toString() === "1" + decimals,
      "tokens not withdrawn from pool"
    );
  });
/*
  it("Swap token0 to token1", async () => {
    await token0.transfer(testAddress, amount * 2);
    await token1.transfer(testAddress, amount * 2);

    await token0.increaseAllowance(swap.address, amount);
    await token1.increaseAllowance(swap.address, amount);

    await swap.initialDeposit(amount, amount);

    await token0.increaseAllowance(swap.address, amount * 2, {
      from: testAddress,
    });
    await token1.increaseAllowance(swap.address, amount * 2, {
      from: testAddress,
    });

    await swap.depositToken0(amount, { from: testAddress });
    await token0.increaseAllowance(swap.address, amount * 2, {
      from: testAddress,
    });
    await token1.increaseAllowance(swap.address, amount * 2, {
      from: testAddress,
    });

    let token0Wallet = await token0.balanceOf(testAddress);
    let ethWallet = await token1.balanceOf(testAddress);

    let etherAmount = await swap.getToken1AmountFromToken0Amount(amount);
    await swap.swapToken0ToToken1(amount, { from: testAddress });

    assert(
      parseInt(amount) ===
        parseInt(token0Wallet) - parseInt(await token0.balanceOf(testAddress)),
      "Tokens not withdrawn"
    );
    assert(
      parseInt(ethWallet) + parseInt(etherAmount) ==
        parseInt(await token1.balanceOf(testAddress)),
      "Ether was not sent"
    );
  });

  it("Swap token1 to token0", async () => {
    await token0.transfer(testAddress, amount * 3);
    await token1.transfer(testAddress, amount * 3);

    await token0.increaseAllowance(swap.address, amount * 3);
    await token1.increaseAllowance(swap.address, amount * 3);

    await token0.increaseAllowance(swap.address, amount * 3, {
      from: testAddress,
    });
    await token1.increaseAllowance(swap.address, amount * 3, {
      from: testAddress,
    });

    await swap.initialDeposit(amount, amount);

    await swap.depositToken0(amount, {
      from: testAddress,
    });

    let ethWallet = parseInt(await token1.balanceOf(testAddress));
    let tokenWallet = parseInt(await token0.balanceOf(testAddress));
    let tokenAmount = parseInt(
      await swap.getToken0AmountFromToken1Amount(amount)
    );
    await swap.swapToken1ToToken0(amount, { from: testAddress });
    assert(
      tokenWallet + tokenAmount ===
        parseInt(await token0.balanceOf(testAddress)),
      "Tokens not sent"
    );
    assert(
      ethWallet - parseInt(amount) ===
        parseInt(await token1.balanceOf(testAddress)),
      "Ether was not withdrawn"
    );
  });
/*
  it("Swap it", async () => {
    await token0.transfer(testAddress, amount * 10);
    await token1.transfer(testAddress, amount * 10);
    await token0.increaseAllowance(swap.address, amount);
    await token1.increaseAllowance(swap.address, amount);
    await token0.increaseAllowance(swap.address, amount*10, { from: testAddress });
    await token1.increaseAllowance(swap.address, amount*10, { from: testAddress });

    await swap.initialDeposit(amount, amount);
    await swap.depositToken0(amount, {
      from: testAddress,
    });


    //for (let i = 0; i < 2; i++) {truffle deve
    //Testaddress spending
    let amt = 1000000000000;
    await token.transfer(testAddress, parseInt(amt));
   
    let tokenWallet = parseInt(await token.balanceOf(testAddress));
    let balanceNow = parseInt(await web3.eth.getBalance(testAddress));
    let receivingAmount = parseInt(
      await swap.getEtherAmountFromTokenAmount(amt)
    );
    await swap.swapTokenToEther(amt, { from: testAddress });
    assert(
      tokenWallet - amt === parseInt(await token.balanceOf(testAddress)),
      "Tokens not withdrawn"
    );

    assert(
      receivingAmount + balanceNow ===
        parseInt(await web3.eth.getBalance(testAddress)),
      `Ether not received :${receivingAmount + balanceNow} :${parseInt(
        await web3.eth.getBalance(testAddress)
      )}`
    );
    //owner
    //amt = 1000000000000;
    //await token.increaseAllowance(swap.address, amt);
    //await swap.swapEtherToToken({ from: owner, value: amt });
    //  }
  });
  */
});
