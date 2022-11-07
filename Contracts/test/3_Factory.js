const BN = require("bn.js");
const Token = artifacts.require("TestToken");
const Factory = artifacts.require("JupyterFactory");
let factory;
let token0;
let token1;
const DEC = "000000000000000000";

beforeEach("should setup the contract instance", async () => {
  token0 = await Token.new(
    "1000000000000000000000000000000000000000000000000000000"
  );
  token1 = await Token.new(
    "1000000000000000000000000000000000000000000000000000000"
  );
  factory = await Factory.new();

  //pool = await Pool.new(2000, token0.address, token1.address);

  await token0.increaseAllowance(
    factory.address,
    "100000000000000000000000000000" + DEC
  );
  await token1.increaseAllowance(
    factory.address,
    "100000000000000000000000000000" + DEC
  );
});

contract("Factory", ([owner, testAddress]) => {
  it("Create Pool", async () => {
    await factory.createPool(
      token0.address,
      token1.address,
      100000000000,
      1024);
  });
  it("Initial Position", async () => {
    await factory.createPool(
      token0.address,
      token1.address,
      100000000000,
      1024
    );
    // let res = await factory.initialPosition(token0.address, token1.address, {
    //   gas: 3000000,
    // });
    // console.log(res.toString());
  });
});
