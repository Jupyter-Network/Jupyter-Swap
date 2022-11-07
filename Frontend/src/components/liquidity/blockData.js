import BN from "bignumber.js";
import { _scaleDown } from "../../utils/mathHelper";
import { getAPY } from "../../utils/requests";
import { wbnb } from "../../contracts/addresses";

const data = {
  tokens: ["tokenarray"],
  wallet: "activeWallet",
  ethersProvider: "provider",
  routerContract: "contract object",
};

export async function fetchBlockData(data) {
  console.log();
  const t0Balance = data.wallet
    ? await data.ethersProvider.getBalance(data.wallet.accounts[0].address)
    : 0;
  const t1Balance = data.wallet
    ? await data.tokens["token1"].contract.balanceOf(
        data.wallet.accounts[0].address
      )
    : 0;
  const userBalance = data.wallet
    ? await data.routerContract.getBalance(
        data.tokens["token1"].contract.address
      )
    : 0;
  const rate = await data.routerContract.getRate(
    data.tokens["token1"].contract.address
  );

  const poolBalances = await data.routerContract.getPoolBalances(
    data.tokens["token1"].contract.address
  );

  const lpTotalSupply = await data.routerContract.getLPTotalSupply(
    data.tokens["token1"].contract.address
  );

  const apy = await getAPY(data.tokens.token1.contract.address);
  console.log(
    BN(apy)
      .dividedBy(BN(poolBalances[1].toString()).dividedBy(BN(10).pow(18)))
      .toString()
  );
  return {
    token0Balance: _scaleDown(t0Balance),
    token1Balance: _scaleDown(t1Balance),
    rate: _scaleDown(rate),
    userBalance: userBalance,
    poolBalances: poolBalances,
    lpTotalSupply: lpTotalSupply,
    apy: BN(apy)
      .dividedBy(
        BN(poolBalances[1].toString()).multipliedBy(2).dividedBy(BN(10).pow(18))
      )
      .multipliedBy(100)
      .toString(),
  };
}

async function getTokenBalance(token, ethersProvider, accountAddress) {
  if (token.contract.address === wbnb) {
    await ethersProvider.getBalance(accountAddress);
  }
  return await token.contract.balanceOf(accountAddress);
}
export async function fetchBlockDataNew(data) {
  console.log("Fetch: ", data);
  const t0Balance = data.wallet
    ? await getTokenBalance(
        data.tokens["token0"],
        data.ethersProvider,
        data.wallet.accounts[0].address
      )
    : 0;
  const t1Balance = data.wallet
    ? await getTokenBalance(
        data.tokens["token1"],
        data.ethersProvider,
        data.wallet.accounts[0].address
      )
    : 0;
  //  ? await data.tokens["token1"].contract.balanceOf(
  //      data.wallet.accounts[0].address
  //    )
  //  : 0;
  // const userBalance = data.wallet
  //   ? await data.routerContract.getBalance(
  //       data.tokens["token1"].contract.address
  //     )
  //   : 0;
  // const rate = await data.routerContract.getRate(
  //   data.tokens["token1"].contract.address
  // );
  //
  // const poolBalances = await data.routerContract.getPoolBalances(
  //   data.tokens["token1"].contract.address
  // );
  //
  // const lpTotalSupply = await data.routerContract.getLPTotalSupply(
  //   data.tokens["token1"].contract.address
  // );

  //const apy = await getAPY(data.tokens.token1.contract.address);
  //console.log(
  //  BN(apy)
  //    .dividedBy(BN(poolBalances[1].toString()).dividedBy(BN(10).pow(18)))
  //    .toString()
  //);
  return {
    token0Balance: _scaleDown(t0Balance),
    token1Balance: _scaleDown(t1Balance),
    userBalance: 10, //userBalance,
    poolBalances: [10, 10], //poolBalances,
    lpTotalSupply: [10, 10], //lpTotalSupply,
    apy: 10, // BN(apy)
    //.dividedBy(
    //  BN(poolBalances[1].toString()).multipliedBy(2).dividedBy(BN(10).pow(18))
    //)
    //.multipliedBy(100)
    //.toString(),
  };
}
