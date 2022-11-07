const BN = require("bn.js");

const PriceMath = artifacts.require("PriceMath");
const DEC = "000000000000000000";
const SWAP_AMOUNT = "10000000000";

let priceMath;
beforeEach("should setup the contract instance", async () => {
  priceMath = await PriceMath.deployed();
});

contract("PriceMath", ([owner, testAddress]) => {
  it("Exact In", async () => {
    let res = await priceMath.swap(
      "87760609709833776024991924139",
      "87770609709833776024991924139",
      "1000" + DEC,
      SWAP_AMOUNT
    );
    assert(res[0].gt(res[1]), "amountIn smaller than amountOut");
    assert(res[0].add(res[3]).eq(new BN(SWAP_AMOUNT)), "amountOut not equal");
  });
  it("Exact Out", async () => {
    let res = await priceMath.swapExactOut(
      "87760609709833776024991924139",
      "87770609709833776024991924139",
      "1000" + DEC,
      SWAP_AMOUNT
    );
    assert(res[0].gt(res[1]), "amountIn smaller than amountOut");
    assert(res[1].eq(new BN(SWAP_AMOUNT)), "amountIn smaller than amountOut");
  });
});
