const { wbnb } = require("../../Frontend/src/contracts/addresses");
const sql = require("./localDb");

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
        price DOUBLE PRECISION NOT NULL,
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

};
