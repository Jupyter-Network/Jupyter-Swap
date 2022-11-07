const { token1, token0 } = require("./contracts/addresses");

module.exports = {
  initTokens: (ethers, ethersProvider, erc20Abi) => {
    return {
      token1: {
        symbol: "ARM",
        contract: new ethers.Contract(
          token1,
          erc20Abi,
          ethersProvider.getSigner()
        ),
        icon: "/placeholder.svg",
        address: token1,
        name: "Amoirro",
      },
      token0: {
        symbol: "BNB",
        contract: new ethers.Contract(
          token0,
          erc20Abi,
          ethersProvider.getSigner()
        ),
        icon: "/bnb-bnb-logo.svg",
        address: token0,
        name: "Build and Build",
      },
    };
  },
};
