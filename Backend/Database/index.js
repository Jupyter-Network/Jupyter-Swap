const process = require("process");
const { token0, wbnb,token1 } = require("../../Frontend/src/contracts/addresses");
const query = require("./query");

initDB();
//main()

async function initDB() {
  await query.createPoolsTable();
  await query.createSwapsTable();
  await query.createPoolEventsTable();
  await query.createLiquidityPositionsTable();
  //Add wbnb

/*
  await query.createPool("0x0", "IOM", "Jupyter", "0x02");
  await query.createPool("0x03", "ARM", "Murraca", "0x04");

  await query.createSwap("0x0", 100, 200, 1025);
  
  //query by {tokenAddress or poolAddress or tokenSymbol}
  console.log(await query.readPool({ tokenAddress: "0x0" }));
  console.log(await query.readPool({ poolAddress: "0x02" }));
  await query.deletePool("0x0");
  await query.getHistory(token0);
*/
  console.log("Done");
  process.exit(0);
}
