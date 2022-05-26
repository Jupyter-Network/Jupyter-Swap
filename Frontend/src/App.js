import React, { useEffect } from "react";
import {
  init,
  useConnectWallet,
  useSetChain,
  useWallets,
} from "@web3-onboard/react";
import { ethers } from "ethers";
import injectedModule from "@web3-onboard/injected-wallets";
import { router, token0, token1 } from "./contracts/addresses";
import routerAbi from "./contracts/build/JupyterRouterV1.json";
import erc20Abi from "./contracts/build/ERC20.json";
import Frame from "./components/layout/Frame";
import ContractWrapper from "./components/ContractWrapper";
import { ToastContainer } from "react-toastify";

const injected = injectedModule();
const web3Onboard = init({
  wallets: [injected],
  chains: [
    {
      id: "0x1",
      token: "ETH",
      label: "Ethereum Mainnet",
      rpcUrl: "https://mainnet.infura.io/v3/ababf9851fd845d0a167825f97eeb12b",
    },
    {
      id: "0x3",
      token: "tROP",
      label: "Ethereum Ropsten Testnet",
      rpcUrl: "https://ropsten.infura.io/v3/ababf9851fd845d0a167825f97eeb12b",
    },
    {
      id: "0x4",
      token: "rETH",
      label: "Ethereum Rinkeby Testnet",
      rpcUrl: "https://rinkeby.infura.io/v3/ababf9851fd845d0a167825f97eeb12b",
    },
    {
      id: "0x89",
      token: "MATIC",
      label: "Matic Mainnet",
      rpcUrl: "https://matic-mainnet.chainstacklabs.com",
    },
    {
      id: "0x38",
      token: "BNB",
      label: "Smart Chain",
      rpcUrl: "https://bsc-dataseed.binance.org/",
    },
    {
      id: "0x1691",
      token: "BNB",
      label: "Ganache",
      rpcUrl: "http://localhost:8545",
    },
  ],
  appMetadata: {
    name: "Jupyter-Swap",
    icon: "<svg><svg/>",
    description: "Jupyter Token Swap V1",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
    ],
  },
});

function App() {
  return (
    <div>
      
         <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <ContractWrapper></ContractWrapper>
 
    </div>
  );
}

export default App;
//connect to wallet
//<button onClick={() => connect()}>
//{connecting ? "connecting" : "connect"}
//</button>