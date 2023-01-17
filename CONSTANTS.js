const fs = require("fs");
const devAddresses = require("./addresses.json");
const CONST = {
  RPC_URL:
    process.env.ENV == "production"
      ? "https://proportionate-proportionate-pallet.bsc-testnet.discover.quiknode.pro/1e9362438617484ea0607b2e5284917435c630d9/"
      : "http://127.0.0.1:8545",
  BACKEND_URL:
    process.env.ENV == "production"
      ? "https://api.jupyter.tech"
      : "http://127.0.0.1:3001",
  SWAP_ROUTER_ADDRESS:
    process.env.ENV == "production"
      ? "0xBD00ac5Dfd0653B77FB3961dAf2c0CfF73F77732"
      : devAddresses.router,
  WBNB_ADDRESS:
    process.env.ENV == "production"
      ? "0x832c3F1Fa8Cf5dE8C25b537BAD38994676007fC3"
      : devAddresses.wbnb,
  TOKEN0_ADDRESS:
    process.env.ENV == "production"
      ? "0x0858446Eb45AEB7E162B65b2eb783C2A96f374dD"
      : devAddresses.token0,
  TOKEN1_ADDRESS:
    process.env.ENV == "production"
      ? "0x45827ef3FAC73e1F734d3A20f7de41DFd27dE981"
      : devAddresses.token1,
  DATABASE:
  process.env.ENV == "production"
  ? "10.131.0.4"
  : "127.0.0.1",
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
