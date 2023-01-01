import BN from "bignumber.js";
import { _scaleDown } from "../../utils/mathHelper";
import {
  getAPY,
  getLiquidityPositionsForAddress,
  getPool,
} from "../../utils/requests";
import CONST from "../../CONST.json";

const data = {
  tokens: ["tokenarray"],
  wallet: "activeWallet",
  ethersProvider: "provider",
  routerContract: "contract object",
};

export async function fetchBlockData(data) {
  console.log(data);
  let promises = [];
  data.wallet
    ? promises.push(
        data.ethersProvider.getBalance(data.wallet.accounts[0].address)
      )
    : promises.push(
        (async function () {
          return 0;
        })()
      );

  data.wallet
    ? promises.push(
        data.tokens["token1"].contract.balanceOf(
          data.wallet.accounts[0].address
        )
      )
    : promises.push(
        (async function () {
          return 0;
        })()
      );

  data.wallet
    ? promises.push(
        data.routerContract.getBalance(data.tokens["token1"].contract.address)
      )
    : promises.push(
        (async function () {
          return 0;
        })()
      );

  promises.push(
    data.routerContract.getRate(data.tokens["token1"].contract.address)
  );

  promises.push(
    data.routerContract.getPoolBalances(data.tokens["token1"].contract.address)
  );

  promises.push(
    data.routerContract.getLPTotalSupply(data.tokens["token1"].contract.address)
  );

  const [t0Balance, t1Balance, userBalance, rate, poolBalances, lpTotalSupply] =
    await Promise.all(promises);

  const apy = await getAPY(data.tokens.token1.contract.address);

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
  let promises = [];
  const pool = await getPool(
    data.tokens["token0"].contract.address,
    data.tokens["token1"].contract.address
  );
  console.log("Fetch: ", data);
  data.wallet
    ? promises.push(
        getTokenBalance(
          data.tokens["token0"],
          data.ethersProvider,
          data.wallet.accounts[0].address
        )
      )
    : promises.push(
        (async function () {
          return 0;
        })()
      );

  data.wallet
    ? promises.push(
        getTokenBalance(
          data.tokens["token1"],
          data.ethersProvider,
          data.wallet.accounts[0].address
        )
      )
    : promises.push(
        (async function () {
          return 0;
        })()
      );

  promises.push(
    data.routerContract.poolInfo(
      data.tokens["token0"].contract.address,
      data.tokens["token1"].contract.address
    )
  );
  data.wallet
    ? promises.push(
        getLiquidityPositionsForAddress(
          data.wallet.accounts[0].address,
          pool.data.pool_address
        )
      )
    : promises.push(
        (async function () {
          return { data: [] };
        })()
      );

  data.wallet
    ? promises.push(
        getTokenBalance(
          data.tokens["token0"],
          data.ethersProvider,
          pool.data.pool_address
        )
      )
    : promises.push(
        (async function () {
          return 0;
        })()
      );
  data.wallet
    ? promises.push(
        getTokenBalance(
          data.tokens["token1"],
          data.ethersProvider,
          pool.data.pool_address
        )
      )
    : promises.push(
        (async function () {
          return 0;
        })()
      );
  const [
    t0Balance,
    t1Balance,
    poolInfo,
    liquidityPositions,
    poolBalance0,
    poolBalance1,
  ] = await Promise.all(promises);

  return {
    token0Balance: BigInt(t0Balance),
    token1Balance: BigInt(t1Balance),
    poolBalance0: poolBalance0,
    poolBalance1: poolBalance1,
    liquidityPositions: liquidityPositions,
    currentTick: poolInfo[0], //userBalance,
    currentLiquidity: poolInfo[2], //poolBalances,
    currentSqrtPrice: poolInfo[1], //lpTotalSupply,
    apy: 10,
    liquidity: poolInfo[2].toString(),
  };
}
