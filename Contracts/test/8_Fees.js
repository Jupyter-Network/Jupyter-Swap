const PriceMath = artifacts.require("PriceMath");
const Fees = artifacts.require("Fees");
const BN = require("bn.js");

let fees;
const DEC = "000000000000000000";

beforeEach("should setup the contract instance", async () => {
  fees = await Fees.new();
});

contract("Fees", ([owner, testAddress]) => {
  it("currentTick below position all fees outside up", async () => {
    let res = await fees.feesInRangeTest(
      1024,
      2048,
      4096,
      12500000,
      12500000,
      true
    );
    assert(
      res.toString() == 0,
      `Wrong amount of fees should be zero but is ${res.toString()} `
    );
  });
 
  it("currentTick below position all fees outside up", async () => {
    let res = await fees.feesInRangeTest(
      1024,
      2048,
      4096,
      12500000,
      12500000,
      true
    );
    assert(
      res.toString() == 0,
      `Wrong amount of fees should be zero but is ${res.toString()} `
    );
  });
  

 
  it("currentTick inside position 1000 fees outside up", async () => {
    let res = await fees.feesInRangeTest(
      2112,
      2048,
      4096,
      12500000,
      1000,
      true
    );
    assert(
      res.toString() == 12498000,
      `Wrong amount of fees should be 12498000 but is ${res.toString()} `
    );
  });
  it("currentTick inside position 1000 fees outside up", async () => {
    let res = await fees.feesInRangeTest(
      2112,
      2048,
      4096,
      12500000,
      1000,
      true
    );
    assert(
      res.toString() == 12498000,
      `Wrong amount of fees should be 12498000 but is ${res.toString()} `
    );
  });
  it("currentTick inside position 1000 fees outside up", async () => {
    let res = await fees.feesInRangeTest(
      2112,
      -23040,
      -8320,
      "683933529274394217715036623477110927",
      "1570056597467028823262567358220362729",
      1000,
      true
    );
    assert(
      res.toString() == 12498000,
      `Wrong amount of fees should be 12498000 but is ${res.toString()} `
    );
  });

});

/*
uint160 sqrtPrice;
uint256 endPrice;
uint128 liquidity;
uint256 amount;
*/
