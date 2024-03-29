const ethers = require("ethers");
const routerMetadata = require("../Contracts/build/contracts/Router.json");
const erc20Metadata = require("../Contracts/build/contracts/ERC20.json");
const erc20Abi = erc20Metadata.abi;
//const addresses = require("./addresses.json");
const CONST = require("./Database/CONST.json");
const query = require("./Database/query");

const { lpValue } = require("./utils/Math");
const routerAbi = routerMetadata.abi;
const routerAddress = CONST.SWAP_ROUTER_ADDRESS;
const provider = new ethers.providers.JsonRpcProvider(CONST.RPC_URL);
const routerContract = new ethers.Contract(routerAddress, routerAbi, provider);
console.log(routerAddress);
const BN = require("bignumber.js");
let lastBlock = 23964661;
//routerContract.queryFilter("*", lastBlock);
//On router Events
routerContract.on("*", async (tx) => {
  lastBlock = tx.blockNumber;
  try {
    switch (tx.event) {
      case "Pool_Created":
        let token = new ethers.Contract(tx.args.Token0, erc20Abi, provider);
        let token1 = new ethers.Contract(tx.args.Token1, erc20Abi, provider);
        const pool = {
          poolAddress: tx.args.Pool,
          token0:
            tx.args.Token0 == CONST.WBNB_ADDRESS
              ? {
                  address: CONST.WBNB_ADDRESS,
                  symbol: "BNB",
                  name: "Build-and-Build",
                  icon: "bnb-bnb-logo.svg",
                }
              : {
                  address: tx.args.Token0,
                  symbol: await token.symbol(),
                  name: await token.name(),
                  icon: "placeholder.svg",
                },
          token1:
            tx.args.Token1 == CONST.WBNB_ADDRESS
              ? {
                  address: CONST.WBNB_ADDRESS,
                  symbol: "BNB",
                  name: "Build-and-Build",
                  icon: "bnb-bnb-logo.svg",
                }
              : {
                  address: tx.args.Token1,
                  symbol: await token1.symbol(),
                  name: await token1.name(),
                  icon: "placeholder.svg",
                },
          tx_id: tx.transactionHash,
        };
        try {
          await query.createPool(pool); //tx.args.token, symbol, name, tx.args.pool);
        } catch (e) {
          console.log(e);
        }
        break;

      case "Liquidity_Added":
        var event = {
          poolAddress: tx.args.Pool,
          liquidity: tx.args.Liquidity.toString(),
          lowerTick: tx.args.LowerTick,
          upperTick: tx.args.UpperTick,
          tx_id: tx.transactionHash,
          lp_id: tx.args.Id,
          type: "addLiquidity",
          owner: tx.args.owner,
        };
        await query.createLiquidityPosition(event);
        break;

      case "ClosePool":
        await query.deletePool(tx.args.pool);
        break;
      case "Liquidity_Removed":
        var event = {
          poolAddress: tx.args.Pool,
          lp_id: tx.args.Id,
          tx_id: tx.transactionHash,
        };

        await query.removeLiquidityPosition(event);
        break;
      case "Swap":
        try {
          console.log(tx);
          await query.createSwap(
            tx.args.Pool,
            tx.args.amountIn,
            tx.args.sqrtPrice,
            tx.args.currentTick,
            tx.args.limitTick,
            tx.transactionHash
          );
        } catch (e) {
          console.log(e);
        }
        break;
    }
  } catch (e) {
    console.log(e);
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
