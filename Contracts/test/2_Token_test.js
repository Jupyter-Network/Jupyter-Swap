const { TOTALSUPPLY, DECIMALS } = require("../CONSTANT");
const Token = artifacts.require("Token");
let token;
beforeEach("should setup the contract instance", async () => {
  token = await Token.new();
});

const decimals = "".padStart(DECIMALS, "0");
contract("Token", ([owner, testAddress]) => {
  it("Check Decimals", async () => {
    const res = await token.decimals();
    assert(res.toString() === DECIMALS.toString());
  });
  it("Check Total Supply", async () => {
    const res = await token.totalSupply();
    assert(res.toString() === TOTALSUPPLY + decimals);
  });

  it("Tokens succesfully transfered to owner", async () => {
    const res = await token.balanceOf(owner);
    assert(res.toString() === TOTALSUPPLY + decimals);
  });

  it("Transfer tokens to wallet", async () => {
    await token.transfer(testAddress, TOTALSUPPLY + decimals);
    const res = await token.balanceOf(testAddress);
    const res2 = await token.balanceOf(owner);
    //Test balance addition
    assert(res.toString() === TOTALSUPPLY + decimals);
    //Test balance subtraction
    assert(res2.toString() === "0");
  });

  it("Transfer tokens from wallet with no balance", async () => {
    await token.transfer(testAddress, TOTALSUPPLY + decimals);
    let res;
    try{
         res =  await token.transfer(testAddress, TOTALSUPPLY + decimals);
    }catch(e){
        assert(!res);
    }})

    it("Test Allowance", async () => {
        const allowance = await token.allowance(owner,testAddress);
        assert(allowance.toString() === "0");
        await token.increaseAllowance(testAddress,1000 + decimals);
        const newAllowance = await token.allowance(owner,testAddress);
        assert(newAllowance.toString() === 1000 + decimals);
        await token.decreaseAllowance(testAddress,1000 + decimals);
        const emptyAllowance = await token.allowance(owner,testAddress);
        assert(emptyAllowance.toString() === "0");
      });


});
