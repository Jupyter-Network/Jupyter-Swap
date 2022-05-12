
const axios = require('axios').default;

module.exports = {
    getHistory:async (tokenAddress)=>{
        let res = await axios.get(`http://127.0.0.1:3001/history/${tokenAddress}`)
        return res;
    },
    getTransanctionHistory:async (tokenAddress)=>{
        let res = await axios.get(`http://127.0.01:3001/transactionHistory/${tokenAddress}`)
        return res;
    },
    getPools:async(searchString)=>{
        let res = await axios.get(`http://127.0.01:3001/tokens/${searchString}`)
        return res;
    } 
}