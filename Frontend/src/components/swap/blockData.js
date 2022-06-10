import { router, wbnb } from "../../contracts/addresses";
import BN from "bignumber.js";
import { getHistory, getTransanctionHistory } from "../../utils/requests";
import { _scaleDown } from "../../utils/mathHelper";
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

  if (data.tokens["token0"].contract.address === wbnb) {
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
    priceHistory = (
      await getHistory(data.tokens["token1"].contract.address)
    ).data.map((item, index) => {
      return {
        rate: BN(10).pow(36).dividedBy(BN(item.rate)).toString(),
        time: item.bucket,
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

  if (data.tokens["token1"].contract.address === wbnb) {
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

  if (data.tokens["token1"].contract.address !== wbnb) {
    poolBalances = await data.routerContract.getPoolBalances(
      data.tokens["token1"].contract.address
    );
    transactions = (
      await getTransanctionHistory(data.tokens["token1"].contract.address)
    ).data;
  } else {
    poolBalances = [BN(0), BN(0)];
    priceHistory = (
      await getHistory(data.tokens["token0"].contract.address)
    ).data.map((item, index) => {
      return {
        rate: BN(item.rate).toString(),
        time: item.bucket,
      };
    });
  }

  if (priceHistory.length === 0) {
    let p0 = await getHistory(data.tokens["token0"].contract.address);
    let p1 = await getHistory(data.tokens["token1"].contract.address);

    priceHistory = p0.data.map((item, index) => {
      return {
        rate: BN(item.rate)
          .dividedBy(BN(p1.data[index].rate).dividedBy(BN(10).pow(18)))

          .toString(),
        time: item.bucket,
      };
    });
  }

  const token0Allowance = data.wallet
    ? await data.tokens["token0"].contract.allowance(
        data.wallet.accounts[0].address,
        router
      )
    : 0;

  const token1Allowance = data.wallet
    ? await data.tokens["token1"].contract.allowance(
        data.wallet.accounts[0].address,
        router
      )
    : 0;
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
