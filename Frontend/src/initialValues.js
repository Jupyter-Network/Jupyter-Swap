const { token1, wbnb } = require("./contracts/addresses");

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
          wbnb,
          erc20Abi,
          ethersProvider.getSigner()
        ),
        icon: "/bnb-bnb-logo.svg",
        address: wbnb,
        name: "Build and Build",
      },
    };
  },
};
