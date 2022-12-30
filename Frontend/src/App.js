import React, { useEffect } from "react";
import {
  init,
  useConnectWallet,
  useSetChain,
  useWallets,
} from "@web3-onboard/react";
import { ethers } from "ethers";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnect from "@web3-onboard/walletconnect";
import CONST from "./CONST.json"

import style from "./App.css"
import ContractWrapper from "./components/ContractWrapper";
import { ToastContainer } from "react-toastify";

const injected = injectedModule();
const web3Onboard = init({
  wallets: [walletConnect, injected],
  chains: [
    {
      id: "0x61",
      token: "BNB",
      label: "BSC TESTNET",
      rpcUrl: CONST.RPC_URL,
    },
  ],
  accountCenter: {
    desktop: {
      position: "bottomLeft",
      enabled: true,
      minimal: true,
    },
    mobile: {
      position: "bottomLeft",
      enabled: true,
      minimal: true,

    },

  },
  appMetadata: {
    name: "Jupyter-Swap",
    icon: "/tokenlogos/jupyter-iom-logo.svg",
    description: "Jupyter Token Swap V1",

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
