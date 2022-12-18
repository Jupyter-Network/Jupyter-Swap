const fs = require("fs");
const devAddresses = require("./addresses.json");
const CONST = {
  RPC_URL:
    process.env.ENV == "production"
      ? "https://data-seed-prebsc-1-s1.binance.org:8545/"
      : "http://127.0.0.1:8545",
  BACKEND_URL:
    process.env.ENV == "production"
      ? "https://api.jupyter.tech"
      : "http://127.0.0.1:3001",
  SWAP_ROUTER_ADDRESS:
    process.env.ENV == "production"
      ? "0xAD377EA2D993B09A58261c925C4DE3351D45b07d"
      : devAddresses.router,
  WBNB_ADDDRESS:
    process.env.ENV == "production"
      ? "0x6356560cEc59Dde1b9A2eDdbaA2c43AE7e6b024B"
      : devAddresses.wbnb,
  TOKEN0_ADDRESS:
    process.env.ENV == "production"
      ? "0x0858446Eb45AEB7E162B65b2eb783C2A96f374dD"
      : devAddresses.token0,
  TOKEN1_ADDRESS:
    process.env.ENV == "production"
      ? "0x45827ef3FAC73e1F734d3A20f7de41DFd27dE981"
      : devAddresses.token1,
};

fs.writeFile("./Frontend/src/CONST.json", JSON.stringify(CONST), (err) => {
  if (err) {
    throw err;
  }
  console.log("JSON data is saved.");
});

fs.writeFile("./Backend/Database/CONST.json", JSON.stringify(CONST), (err) => {
  if (err) {
    throw err;
  }
  console.log("JSON data is saved.");
});
