const fs = require("fs");
const devAddresses = require("./addresses.json");
const CONST = {
  RPC_URL:
    process.env.ENV == "production"
      ? "https://data-seed-prebsc-1-s1.binance.org:8545/"
      : "http://127.0.0.1:8545",
  BACKEND_URL:
    process.env.ENV == "production"
      ? "http://127.0.0.1:3001"
      : "http://127.0.0.1:3001",
  SWAP_ROUTER_ADDRESS:
    process.env.ENV == "production"
      ? "0xfa1f5facBBea22ffDEA3CF112c60D3FD3d5F5db7"
      : devAddresses.router,
  WBNB_ADDDRESS:
    process.env.ENV == "production"
      ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
      : devAddresses.wbnb,
  TOKEN0_ADDRESS:
    process.env.ENV == "production"
      ? "0xbb311372Ea97982698DBB36877620F7d88bB2752"
      : devAddresses.token0,
  TOKEN1_ADDRESS:
    process.env.ENV == "production"
      ? "0x2c6974C8B65cB4e878762299e51259EFE5550257"
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
