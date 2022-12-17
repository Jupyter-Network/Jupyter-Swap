import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import CONST from "../../CONST.json"
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
const routerAbi = routerMeta.abi;

export default function Frame() {
  const [active, setActive] = useState("Home");
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
  ethersProvider = new ethers.providers.JsonRpcProvider(
    CONST.RPC_URL
  );

  const [state, setState] = useState({
    provider: ethersProvider,
    routerContract: new ethers.Contract(CONST.SWAP_ROUTER_ADDRESS, routerAbi, ethersProvider),
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
      setSelected(select("Home"));
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
      <MainMenu
        block={block}
        onclick={(item) => setSelected(select(item))}
        active={active}
      ></MainMenu>
      <br />

      {selected}
    </div>
  );
}
