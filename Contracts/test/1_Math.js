const Math = artifacts.require("Math");
const PriceMath = artifacts.require("PriceMath");
const Fees = artifacts.require("Fees");
/*
let math;
let priceMath;
let tickMath;
let fees;
beforeEach("should setup the contract instance", async () => {
  math = await Math.new();
  priceMath = await PriceMath.new();
  tickMath = await TickMath.new();
  fees = await Fees.new();
});
contract("Math", ([owner, testAddress]) => {
  it("Reserves", async () => {
    console.log("price", (87560223330309670419052669889 / 2 ** 96) ** 2);
    let res = await priceMath.swap(
      "87560223330309670419052669889",
      "88760223330309670419052669889",
      "1000000000000000",
      "10000000000000"
    );
    console.log(res[0].toString(), res[1].toString(), res[2].toString());
    res = await priceMath.swap(
      res[2].toString(),
      "87060223330309670419052669889",
      "1000000000000000",
      res[1].toString()
    );
    console.log(res[0].toString(), res[1].toString(), res[2].toString());
    res = await fees.subtractFee(100000,2000);
    res = await fees.subtractFee(100000,1000);
    res = await fees.subtractFee(100000,400);


    console.log(res[0].toString(), res[1].toString());



    //
    // res = await sqrtPriceMath.swap("87560223330309670419052669889","87660223330309670419052669889",10000000000000,100000)
    // console.log(res[0].toString(),res[1].toString(),res[2].toString())
    //res = await sqrtPriceMath.swapDown("87560223330309670419052669889",1000000,1000)
    //console.log(res[0].toString(),res[1].toString())

    //res = await tickMath.getPriceFromTick(10)
    //console.log(res.toString())
    // let res = await math.getToken0Reserve(
    //   10000,
    //   "87560223330309670419052669889"
    // );
    // assert(res.toString() === "9048");
    // res = await math.getToken1Reserve(10000, "87560223330309670419052669889");
    // assert(res.toString() === "11051");
  });
});
*/