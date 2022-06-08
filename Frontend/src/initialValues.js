module.exports = {
  initTokens: (ethers, ethersProvider, erc20Abi) => {
    return {
      token1: {
        symbol: "ARM",
        contract: new ethers.Contract(
          "0x37e81cec2f18111a86d19be082b027d01e49cfca",
          erc20Abi,
          ethersProvider.getSigner()
        ),
        icon: "/placeholder.svg",
        address: "0x37e81cec2f18111a86d19be082b027d01e49cfca",
        name: "Amoirro",
      },
      token0: {
        symbol: "BNB",
        contract: new ethers.Contract(
          "0xe6D6f7aAe0bc6d069157aeDD19e60E8395303AdE",
          erc20Abi,
          ethersProvider.getSigner()
        ),
        icon: "/bnb-bnb-logo.svg",
        address: "0xe6D6f7aAe0bc6d069157aeDD19e60E8395303AdE",
        name: "Build and Build",
      },
    };
  },
};
