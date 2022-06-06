const axios = require("axios").default;

export async function getHistory(tokenAddress) {
  let res = await axios.get(`http://127.0.0.1:3001/history/${tokenAddress}`);
  return res;
}
export async function getTransanctionHistory(tokenAddress) {
  let res = await axios.get(
    `http://127.0.01:3001/transactionHistory/${tokenAddress}`
  );
  return res;
}
export async function getPools(searchString) {
  let res = await axios.get(`http://127.0.01:3001/tokens/${searchString}`);
  return res;
}
export async function getAPY(tokenAddress) {
  let res = await axios.get(`http://127.0.0.1:3001/apy/${tokenAddress}`);
  return res.data;
}
