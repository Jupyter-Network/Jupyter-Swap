
const PriceMath = artifacts.require("PriceMath");



let priceMath;
const DEC = "000000000000000000";

beforeEach("should setup the contract instance", async () => {

  priceMath = await PriceMath.new();
});

contract("PriceMath Down", ([owner, testAddress]) => {
  it("swapExactOut", async () => {
    let res = await priceMath.swapExactOut(
      "83389287696090579861520777216",
    "73389387696090579861520777216",
      "1000000000000000"+DEC,
      "100000000000000000",
    
  );
    console.log(res);
    console.log(res.priceAfterSwap > "83389287696090579861520777216" ? "Swapped Up":"Swapped Down")
  });
  it("swapExactOut Up", async () => {
  let res = await priceMath.swapExactOut([
    "83389287696090579861520777216",
    "93389287696090579861520777216",
    "1000000000000000"+DEC,
    "100000000000000000",]
  
);
  console.log(res);
  console.log(res.priceAfterSwap > "83389287696090579861520777216" ? "Swapped Up":"Swapped Down")
});
});

/*
uint160 sqrtPrice;
uint256 endPrice;
uint128 liquidity;
uint256 amount;
*/