const { BigNumber, isBigNumber } = require("bignumber.js");
const BN = BigNumber;
module.exports = {
  lpValue: (totalSupply, token0Balance, token1Balance) => {
    let amount = BN("5000000000000000000000000");
    let rate = token1Balance.dividedBy(token0Balance);
    console.log("Rate: ", rate.toString());
    let pp = totalSupply.dividedBy(token1Balance);
    console.log("PP1: ", pp.toString());

    let t1 = amount.dividedBy(pp);
    console.log("t1: ", t1.toString());
    pp = totalSupply.dividedBy(token0Balance);
    console.log("PP: ", pp.toString());
    console.log(
      "Return Amount: ",
      amount
        .dividedBy(pp)
        .multipliedBy(rate)
        .plus(t1.dividedBy(rate))
        .toString()
    );
    return amount.dividedBy(pp).multipliedBy(rate).plus(t1.dividedBy(rate));
  },
};
