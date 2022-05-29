const ethers = require("ethers");
const routerMetadata = require("../Contracts/build/contracts/JupyterRouterV1.json");
const erc20Metadata = require("../Contracts/build/contracts/ERC20.json");
const erc20Abi = erc20Metadata.abi;
const addresses = require("./addresses.json");
const query = require("./Database/query");
const { wbnb } = require("../Frontend/src/contracts/addresses");
const routerAbi = routerMetadata.abi;
const routerAddress = addresses.router;
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const routerContract = new ethers.Contract(routerAddress, routerAbi, provider);
let lastBlock = 1000;
routerContract.queryFilter("*", lastBlock);
routerContract.on("*", async (tx) => {
  lastBlock = tx.blockNumber;
  switch (tx.event) {
    case "CreateLiquidityPool":
      console.log(tx);
      let token = new ethers.Contract(tx.args.token, erc20Abi, provider);
      const symbol = await token.symbol();
      const name = await token.name();
      try {
        await query.createPool(tx.args.token, symbol, name, tx.args.pool);
      } catch (e) {
        console.log(e);
      }
      break;

    case "AddLiquidity":
      break;
    case "ClosePool":
      console.log(tx);
      await query.deletePool(tx.args.pool);
      break;
    case "ExchangeTokens":
      try {
        await query.createSwap(
          tx.args.from,
          tx.args.to,
          tx.args.fromAmount.toString(),
          tx.args.toAmount.toString(),
          tx.args.rate,
          tx.transactionHash
        );
      } catch (e) {
        console.log(e);
      }
      break;
  }
});

/*
SELECT time_bucket_gapfill('15 minutes', time,now() - INTERVAL '1 day',now()) AS bucket, 
locf(first(rate,time)) as open,
locf(max(rate)) as high,
locf(min(rate)) as low,
locf(last(rate,time)) as close
FROM (
SELECT * FROM public."Swaps" 
WHERE from_address = '0x36163D28611c31D1F0d96853c265d5EbA57026F0'
UNION
SELECT * FROM public."Swaps"
WHERE from_address = '0xc472c49A1b818D6D0DdE3C145830D41Fd8511E5f') 
AS trades
GROUP BY bucket
ORDER BY bucket DESC LIMIT 24;
*/
