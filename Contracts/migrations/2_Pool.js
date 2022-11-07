
const WETH = artifacts.require("WBNB");


module.exports = async function (deployer) {
    await deployer.deploy(WETH);

//  deployer.deploy(BitMap);
//  deployer.deploy(Math);
//  deployer.deploy(Fees);
//  deployer.deploy(Math);
//  deployer.link(Math, PriceMath);
//
//  deployer.deploy(safeCast);
//  deployer.link(safeCast, PriceMath);
//
//  deployer.deploy(Tick);
//  deployer.link(Tick, Pool);
//
//  deployer.deploy(PriceMath);
//  deployer.link(PriceMath, Pool);
//
//  deployer.deploy(LM);
//  deployer.link(LM, Pool);
//  //
//  deployer.link(BitMap, Pool);
//  deployer.link(Math, Pool);
//  deployer.link(Fees, Pool);
//
//
//  //deployer.deploy(Pool,2000,0x0000,0x0000);
};
