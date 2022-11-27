const { wbnb } = require("../../Frontend/src/contracts/addresses");
const sql = require("./db");

module.exports = {
  createLiquidityPositionsTable: async () => {
    await sql`CREATE TABLE IF NOT EXISTS public."LiquidityPositions"
    (
        pool character varying(64) COLLATE pg_catalog."default" NOT NULL,
        lp_id bigint NOT NULL,
        type character varying(64) COLLATE pg_catalog."default" NOT NULL,
        liquidity numeric(78) NOT NULL,
        lowerTick integer NOT NULL,
        upperTick integer NOT NULL,
        tx_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
        time timestamp NOT NULL,
        removed boolean DEFAULT false,
        owner character varying(64) COLLATE pg_catalog."default" NOT NULL,
        UNIQUE(tx_id)
    )`;
    //await sql`SELECT create_hypertable('public."LiquidityPositions"','time')`;
  },
  createPoolsTable: async () => {
    await sql`CREATE TABLE IF NOT EXISTS public."Pools"
        (
            token0_address character varying(64) COLLATE pg_catalog."default" NOT NULL,
            token0_name character varying(64) COLLATE pg_catalog."default" NOT NULL,
            token0_symbol character varying(16) COLLATE pg_catalog."default" NOT NULL,
            token0_icon character varying(64) COLLATE pg_catalog."default" NOT NULL,
            token1_address character varying(64) COLLATE pg_catalog."default" NOT NULL,
            token1_name character varying(64) COLLATE pg_catalog."default" NOT NULL,
            token1_symbol character varying(16) COLLATE pg_catalog."default" NOT NULL,
            token1_icon character varying(64) COLLATE pg_catalog."default" NOT NULL,
            pool_address character varying(64) COLLATE pg_catalog."default" NOT NULL,
            pool_verified boolean DEFAULT false,
            token_description text COLLATE pg_catalog."default",
            tx_id character varying(128) COLLATE pg_catalog."default" NOT NULL UNIQUE,
            CONSTRAINT "Pools_pkey" PRIMARY KEY (pool_address),
            CONSTRAINT "Tokens_unique" UNIQUE(token0_address,token1_address)

        )`;
  },
  createSwapsTable: async () => {
    await sql`CREATE TABLE IF NOT EXISTS public."Swaps"
    (
        pool_address character varying(64) COLLATE pg_catalog."default" NOT NULL,
        amount_in numeric(78) NOT NULL,
        sqrt_price numeric(78) NOT NULL,
        current_tick integer NOT NULL,
        limit_tick integer NOT NULL,
        transaction_hash character varying(128) COLLATE  pg_catalog."default" NOT NULL,
        time timestamp NOT NULL,
        UNIQUE(time,transaction_hash)
    )`;
    await sql`SELECT create_hypertable('public."Swaps"','time')`;
  },
  createPoolEventsTable: async () => {
    await sql`CREATE TABLE IF NOT EXISTS public."PoolEvents"
    (
        pool character varying(64) COLLATE pg_catalog."default" NOT NULL,
        lp_id bigint NOT NULL,
        type character varying(64) COLLATE pg_catalog."default" NOT NULL,
        liquidity numeric(78) NOT NULL,
        lowerTick integer NOT NULL,
        upperTick integer NOT NULL,
        tx_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
        time timestamp NOT NULL,
        UNIQUE(tx_id,time)
    )`;
    await sql`SELECT create_hypertable('public."PoolEvents"','time')`;
  },

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
    if (queryObject.tokenAddress) {
      return await sql`SELECT * FROM public."Pools" WHERE token_address = ${queryObject.tokenAddress}`;
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
        pool_address,amount_in, sqrt_price, current_tick,limit_tick,transaction_hash, time)
        VALUES (${poolAddress}, ${amountIn}, ${sqrtPrice},${currentTick},${limitTick}, ${transactionHash}, ${Date.now()});`;
  },

  //History
  getHistory: async (tokenAddress) => {
    return await sql`SELECT time_bucket_gapfill('15 minutes', time,now() - INTERVAL '1 day',now()) AS bucket, 
      locf(last(rate,time)) as rate
      FROM (
      SELECT * FROM public."Swaps" 
      WHERE from_address = ${tokenAddress} AND to_address = ${wbnb}
      UNION
      SELECT * FROM public."Swaps"
      WHERE from_address = ${wbnb} AND to_address  = ${tokenAddress} 
      ) 
      AS trades
      GROUP BY bucket
      ORDER BY bucket DESC LIMIT 20;`;
  },
  getHistoryOHLC: async (tokenAddress, bucketMinutes) => {
    console.log(bucketMinutes);
    return await sql`SELECT time_bucket_gapfill(${
      bucketMinutes + " minutes"
    }, time,now() - INTERVAL '1 day',now() at time zone 'utc') AS bucket, 
    locf(first(rate,time)) as open,
    max(rate) as high,
    min(rate) as low,
    locf(last(rate,time)) as close
    FROM (
    SELECT * FROM public."Swaps" 
    WHERE from_address = ${tokenAddress} AND to_address = ${wbnb}
    UNION
    SELECT * FROM public."Swaps"
    WHERE from_address = ${wbnb} AND to_address  = ${tokenAddress} 
    ) 
    AS trades
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

    // return await sql`SELECT *
    // FROM  public."Swaps"
    // INNER JOIN public."Pools" as from_token ON from_token.token_address = from_address
    // INNER JOIN public."Pools" as to_token ON to_token.token_address = to_address
    //   WHERE (from_address = ${tokenAddress} AND to_address = ${wbnb})
    //   OR (from_address = ${wbnb} AND to_address = ${tokenAddress} )
    // ORDER BY time DESC
    // LIMIT 10;
    //   `;
  },
};
