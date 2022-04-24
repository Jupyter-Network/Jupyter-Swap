
export const TestChain = {
  chainId: 1337,
  chainName: 'TestChain',
  isTestChain: true,
  isLocalChain: true,
  getExplorerAddressLink: (address) => `https://tutorialchain.etherscan.io/address/${address}`,
  getExplorerTransactionLink: (transactionHash) => `https://tutorialchain.etherscan.io/tx/${transactionHash}`,
}
