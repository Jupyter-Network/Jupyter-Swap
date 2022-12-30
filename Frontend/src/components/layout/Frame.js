import {
  useConnectWallet,
  useWallets,
  init,
  useSetChain,
} from "@web3-onboard/react";
import walletConnectModule from "@web3-onboard/walletconnect";
import injectedModule from "@web3-onboard/injected-wallets";

import { ethers } from "ethers";
import { useState, useEffect } from "react";
import CONST from "../../CONST.json";
import { background } from "../../theme/theme";
import ContractWrapper from "../ContractWrapper";
import Liquidity from "../pages/Liquidity";
import Swap from "../pages/Swap";
import MainMenu from "./MainMenu";
import routerMeta from "../../contracts/build/Router.json";
import Build from "../pages/Build";
import { ToastContainer } from "react-toastify";
import Header from "./Header";
import useInterval from "react-useinterval";
import Home from "../pages/Home";

const routerAbi = routerMeta.abi;
const walletConnect = walletConnectModule({
  qrcodeModalOptions: {
    desktopLinks: [
      "ledger",
      "tokenary",
      "wallet",
      "wallet 3",
      "secuX",
      "ambire",
      "wallet3",
      "apolloX",
      "zerion",
      "sequence",
      "punkWallet",
      "kryptoGO",
      "nft",
      "riceWallet",
      "vision",
      "keyring",
    ],
    mobileLinks: [
      "rainbow",
      "metamask",
      "argent",
      "trust",
      "imtoken",
      "pillar",
    ],
  },
});
const injected = injectedModule();

export default function Frame() {
  const maintenance = false;
  const [active, setActive] = useState("Swap");
  let connectedWallets = useWallets();
  //Check if mobile
  const [width, setWidth] = useState(window.innerWidth);
  const [selected, setSelected] = useState();
  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, [window]);
  const isMobile = width <= 768;
  console.log("rerender frame");
  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
    disconnect, // function to call to with wallet<DisconnectOptions> to disconnect wallet
  ] = useConnectWallet();
  let ethersProvider = null;
  let routerContract = null;
  ethersProvider = new ethers.providers.JsonRpcProvider(CONST.RPC_URL);
  //ethersProvider = new ethers.providers.WebSocketProvider(
  //  "wss://proportionate-proportionate-pallet.bsc-testnet.discover.quiknode.pro/1e9362438617484ea0607b2e5284917435c630d9/"
  //);

  const [state, setState] = useState({
    provider: ethersProvider,
    routerContract: new ethers.Contract(
      CONST.SWAP_ROUTER_ADDRESS,
      routerAbi,
      ethersProvider
    ),
  });
  const [index, setIndex] = useState(0);
  const [block, setBlock] = useState(0);

  const [content, setContent] = useState(<p></p>);

  //Check if new block is out
  async function checkBlock() {
    if (state.provider) {
      let result = await ethersProvider.getBlockNumber();
      console.log("Interval:", result);
      if (result !== block) {
        setBlock(result);
      }
    }
  }

  useEffect(() => {
    init({
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
    });
  }, []);

  useEffect(() => {
    console.log("Wallet reload");
    if (wallet) {
      console.log("Wallet reload");

      let ethersProvider = new ethers.providers.Web3Provider(wallet.provider);
      setState({
        wallet: wallet,
        provider: ethersProvider,
        routerContract: new ethers.Contract(
          CONST.SWAP_ROUTER_ADDRESS,
          routerAbi,
          ethersProvider.getSigner()
        ),
      });
      setSelected(select("Swap"));
    }
  }, [connectedWallets]);

  console.log(block);
  let refreshTime = 100000; //ms
  useInterval(checkBlock, refreshTime);
  //let content = <p></p>;
  function select(value) {
    console.log("Select");
    switch (value) {
      case "Swap":
        return (
          <Swap
            routerContract={state.routerContract}
            ethersProvider={state.provider}
            block={block}
          />
        );
      case "Liquidity":
        return (
          <Liquidity
            routerContract={state.routerContract}
            ethersProvider={state.provider}
            block={block}
          />
        );

      case "Build":
        return (
          <Build
            routerContract={state.routerContract}
            ethersProvider={state.provider}
            block={1}
          />
        );
      default:
        break;
    }
  }

  return (
    <div style={{ backgroundColor: background, minHeight: "100vh" }}>
      <Header></Header>
      {maintenance ? (
        <h3>Coming soon..</h3>
      ) : (
        <>
          <MainMenu
            block={block}
            onclick={(item) => setSelected(select(item))}
            active={active}
          ></MainMenu>
          <br />

          {selected}
        </>
      )}
    </div>
  );
}
