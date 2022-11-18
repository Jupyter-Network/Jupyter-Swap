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

fastify.get("/historyOHLC/:tokenAddress/:bucket", async (request, reply) => {
  return await query.getHistoryOHLC(
    request.params.tokenAddress,
    request.params.bucket.toString()
  );
});

fastify.get("/transactionHistory/:tokenAddress", async (request, reply) => {
  return await query.getTransanctionHistory(request.params.tokenAddress);
});

fastify.get("/tokens/:tokenSymbol", async (request, reply) => {
  return await query.getPool({ tokenSymbol: request.params.tokenSymbol });
});

fastify.get("/lp/:ownerAddress", async (request, reply) => {
  return await query.getLiquidityPositionsForAddress({
    owner: request.params.ownerAddress,
  });
});


fastify.get("/apy/:tokenAddress", async (request, reply) => {
  let d = await query.getPoolProfit(request.params.tokenAddress);
  if (d[0].sum) {
    return (d[0].sum + d[1].sum) * 121.66;
  }
  return 0;
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
