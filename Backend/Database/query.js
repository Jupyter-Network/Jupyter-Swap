const { wbnb } = require("../../Frontend/src/contracts/addresses");
const sql = require("./db");

module.exports = {
  createPoolsTable: async () => {
    await sql`CREATE TABLE IF NOT EXISTS public."Pools"
        (
            token_address character varying(64) COLLATE pg_catalog."default" NOT NULL UNIQUE,
            token_name character varying(64) COLLATE pg_catalog."default" NOT NULL UNIQUE,
            token_symbol character varying(16) COLLATE pg_catalog."default" NOT NULL,
            token_icon character varying(64) COLLATE pg_catalog."default" NOT NULL,
            pool_address character varying(64) COLLATE pg_catalog."default" NOT NULL,
            CONSTRAINT "Pools_pkey" PRIMARY KEY (token_address)
        )`;
  },
  createSwapsTable: async () => {
    await sql`CREATE TABLE IF NOT EXISTS public."Swaps"
    (
        from_address character varying(64) COLLATE pg_catalog."default" NOT NULL,
        to_address character varying(64) COLLATE pg_catalog."default" NOT NULL,
        from_amount double precision,
        to_amount double precision,
        transaction_hash character varying(128) COLLATE  pg_catalog."default" NOT NULL,
        rate double precision,
        time timestamp NOT NULL,
        UNIQUE(time,from_address,to_address)
    )`;
    await sql`SELECT create_hypertable('public."Swaps"','time');`;
  },

  //Pool
  createPool: async (
    tokenAddress,
    tokenSymbol,
    tokenName,
    poolAddress,
    tokenIcon = "placeholder.svg"
  ) => {
    await sql`INSERT INTO public."Pools"(
            token_address, token_name, token_symbol, token_icon, pool_address)
            VALUES (${tokenAddress}, ${tokenName}, ${tokenSymbol}, ${tokenIcon}, ${poolAddress});`;
  },
  getPool: async (queryObject) => {
    if (queryObject.tokenAddress) {
      return await sql`SELECT * FROM public."Pools" WHERE token_address = ${queryObject.tokenAddress}`;
    } else if (queryObject.poolAddress) {
      return await sql`SELECT * FROM public."Pools" WHERE pool_address = ${queryObject.poolAddress}`;
    } else if (queryObject.tokenSymbol) {
      return await sql`SELECT * FROM public."Pools" WHERE token_symbol LIKE '%' || ${queryObject.tokenSymbol} || '%'`;
    }
  },
  deletePool: async (tokenAddress) => {
    await sql`DELETE from public."Pools" WHERE token_address = ${tokenAddress}`;
  },

  //Swaps
  createSwap: async (
    fromAddress,
    toAddress,
    fromAmount,
    toAmount,
    rate,
    transactionHash
  ) => {
    await sql`INSERT INTO public."Swaps"(
        from_address,to_address, from_amount, to_amount, rate, time, transaction_hash)
        VALUES (${fromAddress}, ${toAddress}, ${fromAmount},${toAmount} ,${rate}, ${Date.now()} , ${transactionHash});`;
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
  getTransanctionHistory: async (tokenAddress) => {
    return await sql`SELECT from_address,
    from_token.token_symbol as from_symbol,
    from_token.token_icon as from_icon,
    from_amount,
    to_address,
    to_token.token_symbol as to_symbol,
    to_token.token_icon as to_icon,
    to_amount,
    time,
    transaction_hash
    FROM  public."Swaps" 
    INNER JOIN public."Pools" as from_token ON from_token.token_address = from_address
    INNER JOIN public."Pools" as to_token ON to_token.token_address = to_address
      WHERE (from_address = ${tokenAddress} AND to_address = ${wbnb}) 
      OR (from_address = ${wbnb} AND to_address = ${tokenAddress} )
    ORDER BY time DESC
    LIMIT 10;
      `;
  },
};
