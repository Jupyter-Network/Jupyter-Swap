// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
const { default: BN } = require("bignumber.js");
const query = require("../Database/query");

fastify.register(require("@fastify/cors"), {
  origin: true,
});
// Declare a route
fastify.get("/history/:tokenAddress", async (request, reply) => {
  return await query.getHistory(request.params.tokenAddress);
});

fastify.get("/transactionHistory/:tokenAddress", async (request, reply) => {
  return await query.getTransanctionHistory(request.params.tokenAddress);
});

fastify.get("/tokens/:token_symbol", async (request, reply) => {
  return await query.getPool({ tokenSymbol: request.params.token_symbol });
});

fastify.get("/apy/:tokenAddress", async (request, reply) => {
  let d = await query.getAPY(request.params.tokenAddress);
  let timeFrac = 365 / ((d[0].lasttime - d[0].firsttime) / 1000 / 60 / 60 / 24);
  return  BN(d[0].lastvalue)
  .dividedBy(d[0].firstvalue)
  .minus(1)
  .multipliedBy(100)
  .multipliedBy(timeFrac)
  .toString();
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3001);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
