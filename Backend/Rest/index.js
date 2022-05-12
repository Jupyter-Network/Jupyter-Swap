// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
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
