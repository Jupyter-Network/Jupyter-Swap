const { wbnb } = require("../../Frontend/src/contracts/addresses");
const sql = require("./db");

module.exports = {
  //Pool
  createPool: async (pool) => {
    await sql`INSERT INTO public."Pools"(
            token0_address, token0_name, token0_symbol, token0_icon,
            token1_address, token1_name, token1_symbol, token1_icon,
            pool_address,tx_id)
            VALUES (${pool.token0.address}, ${pool.token0.name}, ${pool.token0.symbol}, ${pool.token0.icon},
              ${pool.token1.address}, ${pool.token1.name}, ${pool.token1.symbol}, ${pool.token1.icon},
              ${pool.poolAddress},${pool.tx_id});`;
  },
  getPool: async (queryObject) => {
    if (queryObject.token0Address && queryObject.token1Address) {
      return await sql`SELECT * FROM public."Pools" WHERE token0_address = ${queryObject.token0Address} AND token1_address = ${queryObject.token1Address}`;
    } else if (queryObject.poolAddress) {
      return await sql`SELECT * FROM public."Pools" WHERE pool_address = ${queryObject.poolAddress}`;
    } else if (queryObject.tokenSymbol) {
      console.log(queryObject.tokenSymbol);
      return await sql`SELECT * FROM public."Pools" WHERE token0_symbol ILIKE '%' || ${queryObject.tokenSymbol} || '%' or token1_symbol ILIKE '%' || ${queryObject.tokenSymbol} || '%'`;
    }
  },
  deletePool: async (poolAddress) => {
    await sql`DELETE from public."Pools" WHERE pool_address = ${poolAddress}`;
  },

  createLiquidityPosition: async (event) => {
    await sql`INSERT INTO public."LiquidityPositions" (
      pool,lp_id,type,liquidity,lowerTick,upperTick,time,tx_id,owner
    )VALUES (${event.poolAddress.toLowerCase()},${event.lp_id},${event.type},${
      event.liquidity
    },${event.lowerTick},${
      event.upperTick
    },${Date.now()},${event.tx_id.toLowerCase()} , ${event.owner.toLowerCase()})`;
  },
  removeLiquidityPosition: async (event) => {
    await sql`DELETE FROM public."LiquidityPositions" WHERE lp_id = ${event.lp_id}`;
    //If updating
    //await sql`UPDATE public."LiquidityPositions" SET removed=true
    //WHERE lp_id = ${event.lp_id}`;
  },
  getLiquidityPositionsForAddress: async (event) => {
    return await sql`SELECT * FROM public."LiquidityPositions" where owner=${event.owner}`;
  },
  getLiquidityPositionsForOwnerByPool: async (event) => {
    console.log(`select * FROM public."LiquidityPositions" WHERE owner = ${event.owner} AND  pool = ${event.poolAddress}`);
    return await sql`select * FROM public."LiquidityPositions" WHERE owner ILIKE ${event.owner} AND  pool ILIKE ${event.poolAddress}`;
  },
  getPoolProfit: async (tokenAddress) => {
    return await sql`
      select sum(from_amount / rate * 0.003)  from "Swaps" where from_address=${tokenAddress} and
      "time"  > (now() at time zone 'utc') - interval '3 days' 
  union select sum(from_amount *( rate / 1000000000000000000000000000000000000) * 0.003)  from "Swaps" where to_address=${tokenAddress}  and
      "time"  > (now() at time zone 'utc') - interval '3 days'`;
  },

  //Swaps
  createSwap: async (
    poolAddress,
    amountIn,
    sqrtPrice,
    currentTick,
    limitTick,
    transactionHash
  ) => {
    await sql`INSERT INTO public."Swaps"(
        pool_address,amount_in, sqrt_price, price, current_tick,limit_tick,transaction_hash, time)
        VALUES (${poolAddress}, ${amountIn}, ${sqrtPrice},${priceFromSqrtPrice(
      BigInt(sqrtPrice)
    )},${currentTick},${limitTick}, ${transactionHash}, ${Date.now()});`;
  },

  //History
  getHistory: async (tokenAddress) => {
    return await sql`SELECT time_bucket_gapfill('15 minutes', time,now() - INTERVAL '1 day',now()) AS bucket, 
      locf(last(rate,time)) as rate
      FROM public."Swaps" AS trades
      GROUP BY bucket
      ORDER BY bucket DESC LIMIT 20;`;
  },
  getHistoryOHLC: async (poolAddress, bucketMinutes) => {
    console.log(bucketMinutes);
    return await sql`SELECT time_bucket_gapfill(${
      bucketMinutes + " minutes"
    }, time,now() - INTERVAL '1 day',now() at time zone 'utc') AS bucket, 
    locf(first(price ,
      time)) as open,
      max(price) as high,
      min(price) as low,
      locf(last(price ,
      time)) as close
    from
    (select * from public."Swaps" where pool_address=${poolAddress})
      as trades
    GROUP BY bucket
    ORDER BY bucket DESC LIMIT 50;`;
  },
  getTransanctionHistory: async (poolAddress, bucketMinutes) => {
    return await sql`select "Swaps".amount_in ,"Swaps".sqrt_price ,"Swaps".limit_tick,"Swaps".current_tick,"Swaps".transaction_hash,"Swaps"."time"  from "Pools" 
    inner join "Swaps" on "Swaps".pool_address = "Pools"."pool_address" 
    where  "Pools"."pool_address" = ${poolAddress}
    order by "Swaps"."time" desc
    limit 30;
      `;
  },
};
function priceFromSqrtPrice(sqrtPrice) {
  let num = (sqrtPrice ** 2n / 2n ** 64n).toString();
  //let frac = num.slice(-18)
  //num = num.split(frac)[0] + "." +  frac
  return num / 2 ** 128;
}
