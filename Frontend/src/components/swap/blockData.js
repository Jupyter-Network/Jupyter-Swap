import CONST from "../../CONST.json"
import BN from "bignumber.js";
import {
  getHistory,
  getTransanctionHistory,
  getHistoryOHLC,
} from "../../utils/requests";
import { priceFromSqrtPrice, _scaleDown } from "../../utils/mathHelper";
const data = {
  tokens: ["tokenarray"],
  wallet: "activeWallet",
  ethersProvider: "provider",
  routerContract: "contract object",
};

export async function fetchBlockData(data) {
  console.log("Fetch Data: ", data);
  let p0Rate = BN(10).pow(18);
  let t0Balance = 0;
  let pool1Balances = null;
  let priceHistory = [];
  let poolBalances = null;
  let transactions = [];

  if (data.tokens["token0"].contract.address === CONST.WBNB_ADDRESS) {
    t0Balance = data.wallet
      ? await data.ethersProvider.getBalance(data.wallet.accounts[0].address)
      : 0;
    p0Rate = p0Rate.dividedBy(
      BN(
        (
          await data.routerContract.getRate(
            data.tokens["token1"].contract.address
          )
        ).toString()
      )
    );
    pool1Balances = [new BN(0), new BN(0)];
    console.log("TOKEN0 = WBNB");
    priceHistory = (
      await getHistoryOHLC(
        data.tokens["token1"].contract.address,
        data.timeBucket
      )
    ).data.map((item, index) => {
      return {
        open: BN(10).pow(36).dividedBy(BN(item.open)),
        high: BN(10).pow(36).dividedBy(BN(item.high)),
        low: BN(10).pow(36).dividedBy(BN(item.low)),
        close: BN(10).pow(36).dividedBy(BN(item.close)),
        bucket: item.bucket,
      };
    });
  } else {
    t0Balance = data.wallet
      ? await data.tokens["token0"].contract.balanceOf(
          data.wallet.accounts[0].address
        )
      : 0;
    p0Rate = BN(
      (
        await data.routerContract.getRate(
          data.tokens["token0"].contract.address
        )
      ).toString()
    ).dividedBy(BN(10).pow(18));
    pool1Balances = await data.routerContract.getPoolBalances(
      data.tokens["token0"].contract.address
    );
    transactions = [
      ...transactions,
      ...(await getTransanctionHistory(data.tokens["token0"].contract.address))
        .data,
    ];
  }

  let t1Balance = 0;
  let p1Rate = BN(BN(10).pow(18));

  if (data.tokens["token1"].contract.address === CONST.WBNB_ADDRESS) {
    t1Balance = data.wallet
      ? await data.ethersProvider.getBalance(data.wallet.accounts[0].address)
      : 0;
  } else {
    t1Balance = data.wallet
      ? await data.tokens["token1"].contract.balanceOf(
          data.wallet.accounts[0].address
        )
      : 0;
    p1Rate = BN(
      (
        await data.routerContract.getRate(
          data.tokens["token1"].contract.address
        )
      ).toString()
    ).dividedBy(BN(10).pow(18));
  }

  if (data.tokens["token1"].contract.address !== CONST.WBNB_ADDRESS) {
    poolBalances = await data.routerContract.getPoolBalances(
      data.tokens["token1"].contract.address
    );
    transactions = (
      await getTransanctionHistory(data.tokens["token1"].contract.address)
    ).data;
  } else {
    poolBalances = [BN(0), BN(0)];
    console.log("TOKEN1 === WBNB");
    priceHistory = (
      await getHistoryOHLC(
        data.tokens["token0"].contract.address,
        data.timeBucket
      )
    ).data.map((item, index) => {
      return {
        open: BN(item.open),
        high: BN(item.high),
        low: BN(item.low),
        close: BN(item.close),
        bucket: item.bucket,
      };
    });
  }

  console.log("PRICEHOSTORY: ", data.tokens["token0"], data.tokens["token1"]);
  if (
    data.tokens["token0"].contract.address !== CONST.WBNB_ADDRESS &&
    data.tokens["token1"].contract.address !== CONST.WBNB_ADDRESS
  ) {
    let p0 = await getHistoryOHLC(
      data.tokens["token0"].contract.address,
      data.timeBucket
    );
    let p1 = await getHistoryOHLC(
      data.tokens["token1"].contract.address,
      data.timeBucket
    );

    priceHistory = p0.data.map((item, index) => {
      return {
        open: BN(1).dividedBy(BN(item.open).dividedBy(BN(p1.data[index].open))),
        high: BN(item.high).dividedBy(
          BN(p1.data[index].high).dividedBy(BN(10).pow(18))
        ),
        low: BN(item.low).dividedBy(
          BN(p1.data[index].low).dividedBy(BN(10).pow(18))
        ),
        close: BN(item.close).dividedBy(
          BN(p1.data[index].close).dividedBy(BN(10).pow(18))
        ),
        bucket: item.bucket,
      };
    });
  }
  console.log("PRRRHHH:", priceHistory);

  const token0Allowance = data.wallet
    ? await data.tokens["token0"].contract.allowance(
        data.wallet.accounts[0].address,
        CONST.SWAP_ROUTER_ADDRESS
      )
    : 0;

  const token1Allowance = data.wallet
    ? await data.tokens["token1"].contract.allowance(
        data.wallet.accounts[0].address,
        CONST.SWAP_ROUTER_ADDRESS
      )
    : 0;
  console.log("History", priceHistory);
  return {
    token0Balance: _scaleDown(t0Balance),
    token1Balance: _scaleDown(t1Balance),
    poolBalances: await poolBalances,
    pool1Balances: await pool1Balances,
    token0Allowance: _scaleDown(token0Allowance),
    token1Allowance: _scaleDown(token1Allowance),
    p0Rate: p0Rate,
    p1Rate: p1Rate,
    priceHistory: priceHistory.reverse(),
    transactionHistory: transactions,
  };
}

async function getBalance(data, zeroOrOne) {
  if (data.tokens[zeroOrOne ? "token0" : "token1"].contract.address === CONST.WBNB_ADDRESS) {
    return data.wallet
      ? await data.ethersProvider.getBalance(data.wallet.accounts[0].address)
      : 0;
  } else {
    return data.wallet
      ? await data.tokens[zeroOrOne ? "token0" : "token1"].contract.balanceOf(
          data.wallet.accounts[0].address
        )
      : 0;
  }
}
export async function fetchBlockDataNew(data) {
  console.log("Fetch Data: ", data);
  //Get users token balances
  const t0Balance = await getBalance(data, true);
  const t1Balance = await getBalance(data, false);

  //Get Sqrt Price
  const poolInfo = await data.routerContract.poolInfo(
    data.tokens["token0"].address,
    data.tokens["token1"].address
  );
console.log(poolInfo)
  //Get users allowances
  const token0Allowance = data.wallet
    ? await data.tokens["token0"].contract.allowance(
        data.wallet.accounts[0].address,
        CONST.SWAP_ROUTER_ADDRESS
      )
    : 0;

  const token1Allowance = data.wallet
    ? await data.tokens["token1"].contract.allowance(
        data.wallet.accounts[0].address,
        CONST.SWAP_ROUTER_ADDRESS
      )
    : 0;
    const transactions = (
      await getTransanctionHistory(poolInfo.pool)
    ).data;
    let priceHistory = (
      await getHistoryOHLC(
        poolInfo.pool,
        data.timeBucket
      )
    ).data.map((item, index) => {
      return {
        open: item.open, //BN(10).pow(36).dividedBy(BN(item.open)),
        high: item.high, //BN(10).pow(36).dividedBy(BN(item.high)),
        low: item.low,  //BN(10).pow(36).dividedBy(BN(item.low)),
        close: item.close, //BN(10).pow(36).dividedBy(BN(item.close)),
        bucket: item.bucket,
      };
    });


  
  return {
    token0Balance: _scaleDown(t0Balance),
    token1Balance: _scaleDown(t1Balance),
    token0Allowance: _scaleDown(token0Allowance),
    token1Allowance: _scaleDown(token1Allowance),
    price: priceFromSqrtPrice(BigInt(poolInfo.price.toString())),
    currentTick:poolInfo.tick,
    currentSqrtPrice:poolInfo.currentSqrtPrice,
    transactionHistory:transactions,
    priceHistory:priceHistory
  };
}
