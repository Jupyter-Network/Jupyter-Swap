const { token1, token0 } = require("./contracts/addresses");
const CONST = require("./CONST.json")
module.exports = {
  initTokens: (ethers, ethersProvider, erc20Abi) => {
    return {
      token1: {
        symbol: "IOM",
        contract: new ethers.Contract(
          CONST.TOKEN0_ADDRESS,
          erc20Abi,
          ethersProvider.getSigner()
        ),
        icon: "/placeholder.svg",
        address: CONST.TOKEN0_ADDRESS,
        name: "Jupyter",
      },
      token0: {
        symbol: "BNB",
        contract: new ethers.Contract(
          CONST.TOKEN1_ADDRESS,
          erc20Abi,
          ethersProvider.getSigner()
        ),
        icon: "/bnb-bnb-logo.svg",
        address: CONST.TOKEN1_ADDRESS,
        name: "Build and Build",
      },
    };
  },
};
