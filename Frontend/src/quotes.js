import BN from "bignumber.js";
import { validate } from "./utils/inputValidations";

export function token0ToToken1(blockData, maxSlippage, value) {
  let amount = new BN(value).multipliedBy(new BN(10).pow(18));
  let rate = new BN(0);
  let rateWithoutSlippage = new BN(0);

  console.log("buy calc", amount);
  rate = new BN(blockData.pool1Balances[0].toString()).dividedBy(
    new BN(blockData.pool1Balances[1].toString()).plus(amount)
  )
  .multipliedBy(amount)
  .multipliedBy(0.997);
  console.log(rate.dividedBy(BN(10).pow(18)).toString());
  rate = new BN(blockData.poolBalances[1].toString())
    .dividedBy(new BN(blockData.poolBalances[0].toString()).plus(rate))
    .multipliedBy(rate)
    .multipliedBy(0.997)
    .dividedBy(new BN(10).pow(18));

  rateWithoutSlippage = new BN(blockData.poolBalances[1].toString())
    .dividedBy(new BN(blockData.poolBalances[0].toString()))
    .multipliedBy(amount)
    .multipliedBy(0.997);
  rateWithoutSlippage = new BN(blockData.pool1Balances[0].toString())
    .dividedBy(new BN(blockData.pool1Balances[1].toString()))
    .multipliedBy(rateWithoutSlippage)
    .multipliedBy(0.997)
    .dividedBy(BN(10).pow(18));

  console.log("GetHopped: ", rate.toString(), rateWithoutSlippage.toString());

  return {
    poolHop: true,
    token0Amount: validate(value),
    token1Amount: validate(rate),
    token1AmountMin: rate
      .multipliedBy(new BN(1).minus(maxSlippage / 100))
      .multipliedBy(new BN(10).pow(18)),
    impact: validate(rateWithoutSlippage
      .minus(rate)
      .dividedBy(rateWithoutSlippage)
      .multipliedBy(100)
      .toFixed(3)),
    allowanceCheck: new BN(blockData.token0Allowance).gte(
      new BN(value).multipliedBy(new BN(10).pow(18))
    ),
  };
}

export function token1ToToken0(blockData, maxSlippage, value) {
  console.log("TOOOOKENTOOO")
  let amount = new BN(value).multipliedBy(new BN(10).pow(18));
  let rate = 0;
  let rateWithoutSlippage = new BN(0);

  let b11 = BN(blockData.pool1Balances[0].toString());
  let b10 = BN(blockData.pool1Balances[1].toString());

  let b01 = BN(blockData.poolBalances[0].toString());
  let b00 = BN(blockData.poolBalances[1].toString());

  amount = amount.dividedBy(997).multipliedBy(1000);
  rate = b10.dividedBy(b11.minus(amount)).multipliedBy(amount);
  rate = rate.dividedBy(997).multipliedBy(1000);
  rate = b01
    .dividedBy(b00.minus(rate))
    .multipliedBy(rate)
    .dividedBy(BN(10).pow(18));

  rateWithoutSlippage = b10.dividedBy(b11).multipliedBy(amount);
  rateWithoutSlippage = rateWithoutSlippage.multipliedBy(1000).dividedBy(997);
  rateWithoutSlippage = b01.dividedBy(b00).multipliedBy(rateWithoutSlippage);

  rateWithoutSlippage = rateWithoutSlippage.dividedBy(new BN(10).pow(18));

  return {
    poolHop: true,
    token0Amount: validate(rate),
    token1Amount: validate(value),
    token1AmountMin: BN(value)
      .multipliedBy(new BN(1).minus(maxSlippage / 100))
      .multipliedBy(new BN(10).pow(18)),
    impact: validate(rate
      .minus(rateWithoutSlippage)
      .dividedBy(rate)
      .multipliedBy(100)
      .toFixed(3)),
    allowanceCheck: new BN(blockData.token0Allowance).gte(
      new BN(value).multipliedBy(new BN(10).pow(18))
    ),
  };
}

export function ETHToToken(blockData, maxSlippage, value) {
  console.log("PoolBalances: ", blockData);
  let amount = new BN(value).multipliedBy(new BN(10).pow(18));
  let rate = new BN(0);
  rate = new BN(blockData.poolBalances[0].toString());
  let rateWithoutSlippage = new BN(0);
  console.log("buy ETH TO Token");
  //(value * blockData.poolBalances[0]) / (blockData.poolBalances[1] + value)
  rate = new BN(blockData.poolBalances[1].toString())
    .dividedBy(new BN(blockData.poolBalances[0].toString()).plus(amount))
    .multipliedBy(amount)
    //.dividedBy(new BN(blockData.poolBalances[0].toString()).multipliedBy(amount))
    .dividedBy(new BN(10).pow(18))
    .multipliedBy(0.997);
  if (rate.eq(0)) {
    rate = new BN(blockData.pool1Balances[0].toString())
      .dividedBy(new BN(blockData.pool1Balances[1].toString()).plus(amount))
      .multipliedBy(amount)
      //.dividedBy(new BN(blockData.poolBalances[0].toString()).multipliedBy(amount))
      .dividedBy(new BN(10).pow(18))
      .multipliedBy(0.997);
  }
  //
  //rateWithoutSlippage = new BN(blockData.poolBalances[1].toString())
  //  .dividedBy(new BN(blockData.poolBalances[0].toString()))
  //  .multipliedBy(amount)
  //  .dividedBy(
  //    new BN(blockData.poolBalances[0].toString()).multipliedBy(amount)
  //  )
  //  .dividedBy(new BN(10).pow(18))
  //  .multipliedBy(0.997);
  rateWithoutSlippage = new BN(blockData.poolBalances[1].toString())
    .dividedBy(new BN(blockData.poolBalances[0].toString()))
    .multipliedBy(amount)
    //.dividedBy(new BN(blockData.poolBalances[0].toString()).multipliedBy(amount))
    .dividedBy(new BN(10).pow(18));

  if (new BN(blockData.poolBalances[1].toString()).eq(0)) {
    rateWithoutSlippage = new BN(blockData.pool1Balances[0].toString())
      .dividedBy(new BN(blockData.pool1Balances[1].toString()))
      .multipliedBy(amount)
      //.dividedBy(new BN(blockData.poolBalances[0].toString()).multipliedBy(amount))
      .dividedBy(new BN(10).pow(18))
      .multipliedBy(0.997);
  }
  // rateWithoutSlippage = new BN(blockData.poolBalances[1].toString()).dividedBy(
  //   new BN(blockData.poolBalances[0].toString())
  // );
  console.log(rate.toString(), rateWithoutSlippage.toString());
  amount
    .multipliedBy(new BN(blockData.poolBalances[0].toString()))
    .dividedBy(new BN(blockData.poolBalances[1].toString()).plus(amount))
    .multipliedBy(0.997)
    .dividedBy(new BN(10).pow(18));

  return {
    token0Amount: validate(value),
    token1Amount: validate(rate),
    token1AmountMin: BN(rate)
      .multipliedBy(new BN(1).minus(maxSlippage / 100))
      .multipliedBy(new BN(10).pow(18)),
    impact: rateWithoutSlippage
      .minus(rate)
      .dividedBy(rateWithoutSlippage)
      .multipliedBy(100)
      .toFixed(3),
    allowanceCheck: new BN(blockData.token0Allowance).gte(
      new BN(value).multipliedBy(new BN(10).pow(18))
    ),
  };
}

export function TokenToETH(blockData, maxSlippage, value) {
  //value = new BN(value).multipliedBy(new BN(10).pow(18));
  let amount = new BN(value).multipliedBy(new BN(10).pow(18));
  let rate = new BN(0);
  let rateWithoutSlippage = new BN(0);

  if (blockData.poolBalances[1].toString()) {
    rate = new BN(blockData.poolBalances[1].toString());
    rate = new BN(blockData.poolBalances[0].toString()).div(rate);

    let balance0 = new BN(blockData.poolBalances[0].toString());
    let balance1 = new BN(blockData.poolBalances[1].toString());
    let b0 = balance1;
    let b1 = balance0;
    if (balance0.plus(balance1).eq(0)) {
      b0 = new BN(blockData.pool1Balances[0].toString());
      b1 = new BN(blockData.pool1Balances[1].toString());
    }

    amount = amount.dividedBy(997).multipliedBy(1000);
    rate = b1
      .dividedBy(b0.minus(amount))
      .multipliedBy(amount)
      .dividedBy(new BN(10).pow(18));

    rateWithoutSlippage = b1
      .dividedBy(b0)
      .multipliedBy(amount.multipliedBy(0.997))
      .dividedBy(new BN(10).pow(18));

    console.log("TokentoETH ", rateWithoutSlippage);


    return {
      poolHop: false,
      token0Amount: validate(rate),
      token1Amount: validate(value),
      token1AmountMin: BN(value)
        .multipliedBy(new BN(1).minus(maxSlippage / 100))
        .multipliedBy(new BN(10).pow(18)),
      impact: rate
        .minus(rateWithoutSlippage)
        .dividedBy(rate)
        .multipliedBy(100)
        .toFixed(3),
      allowanceCheck: new BN(blockData.token0Allowance).gte(
        new BN(rate).multipliedBy(new BN(10).pow(18))
      ),
    };
  }
}



