import BN from "bignumber.js";
import { _scaleDown } from "../../utils/mathHelper";
import { getAPY, getLiquidityPositionsForAddress } from "../../utils/requests";
import CONST from "../../CONST.json"

const data = {
  tokens: ["tokenarray"],
  wallet: "activeWallet",
  ethersProvider: "provider",
  routerContract: "contract object",
};

export async function fetchBlockData(data) {
  console.log(data);
  const t0Balance = data.wallet
    ? await data.ethersProvider.getBalance(data.wallet.accounts[0].address)
    : 0;
  const t1Balance = data.wallet
    ? await data.tokens["token1"].contract.balanceOf(
        data.wallet.accounts[0].address
      )
    : 0;
  const userBalance = 
  data.wallet
    ? await data.routerContract.getBalance(
        data.tokens["token1"].contract.address
      )
    : 0;
  const rate = 
  await data.routerContract.getRate(
    data.tokens["token1"].contract.address
  );

  const poolBalances = 
  await data.routerContract.getPoolBalances(
    data.tokens["token1"].contract.address
  );

  const lpTotalSupply = 
  await data.routerContract.getLPTotalSupply(
    data.tokens["token1"].contract.address
  );

  const apy = 
  await getAPY(data.tokens.token1.contract.address);
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
  if (token.contract.address === CONST.WBNB_ADDRESS) {
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

   // 0xc43bE04F802D1FA7d7BFc0FAE5FB100C19c2E85B

  const poolInfo = await data.routerContract.poolInfo(
    data.tokens["token0"].contract.address,
    data.tokens["token1"].contract.address
  );

  let liquidityPositions = data.wallet
  ? await getLiquidityPositionsForAddress(data.wallet.accounts[0].address,poolInfo[3])
  : { data: [] };
 
  const poolBalance0 = 
  data.wallet
    ? await getTokenBalance(
        data.tokens["token0"],
        data.ethersProvider,
        poolInfo[3]
      )
    : 0;
  const poolBalance1 = 
  data.wallet
    ? await getTokenBalance(
        data.tokens["token1"],
        data.ethersProvider,
        poolInfo[3]
      )
    : 0;

  console.log(
    poolInfo[0],
    poolInfo[1].toString(),
    poolInfo[2].toString(),
    poolInfo[3].toString()
  );
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
    token0Balance: BigInt(t0Balance),
    token1Balance: BigInt(t1Balance),
    poolBalance0:poolBalance0,
    poolBalance1:poolBalance1,
    liquidityPositions: liquidityPositions,
    currentTick: poolInfo[0], //userBalance,
    currentLiquidity: poolInfo[2], //poolBalances,
    currentSqrtPrice: poolInfo[1], //lpTotalSupply,
    apy: 10,
    liquidity: poolInfo[2].toString(), // BN(apy)
    //.dividedBy(
    //  BN(poolBalances[1].toString()).multipliedBy(2).dividedBy(BN(10).pow(18))
    //)
    //.multipliedBy(100)
    //.toString(),
  };
}
