const axios = require("axios").default;
const CONST = require("../CONST.json");
export async function getHistory(tokenAddress) {
  let res = await axios.get(`${CONST.BACKEND_URL}/history/${tokenAddress}`);
  return res;
}
export async function getTransanctionHistory(tokenAddress) {
  let res = await axios.get(
    `${CONST.BACKEND_URL}/transactionHistory/${tokenAddress}`
  );
  return res;
}
export async function getPools(searchString) {
  let res = await axios.get(`${CONST.BACKEND_URL}/tokens/${searchString}`);
  return res;
}
export async function getPool(token0Address, token1Address) {
  let res = await axios.get(
    `${CONST.BACKEND_URL}/pool/${token0Address}/${token1Address}`
  );
  return res;
}
export async function getAPY(tokenAddress) {
  let res = await axios.get(`${CONST.BACKEND_URL}/apy/${tokenAddress}`);
  return res.data;
}

export async function getHistoryOHLC(tokenAddress, bucket) {
  let res = await axios.get(
    `${CONST.BACKEND_URL}/historyOHLC/${tokenAddress}/${bucket}`
  );
  return res;
}
export async function getLiquidityPositionsForAddress(
  token0Address,
  poolAddress
) {
  let res = await axios.get(
    `${CONST.BACKEND_URL}/lp/${token0Address}/${poolAddress}`
  );
  return res;
}
