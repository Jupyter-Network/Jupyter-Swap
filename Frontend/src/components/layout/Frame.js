import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { router } from "../../contracts/addresses";
import { background } from "../../theme/theme";
import ContractWrapper from "../ContractWrapper";
import Liquidity from "../pages/Liquidity";
import Swap from "../pages/Swap";
import MainMenu from "./MainMenu";
import routerMeta from "../../contracts/build/JupyterRouterV1.json";
import Build from "../pages/Build";
import { ToastContainer } from "react-toastify";
const routerAbi = routerMeta.abi;

export default function Frame({ block }) {
  const [active, setActive] = useState("Home");
  //Check if mobile
  const [width, setWidth] = useState(window.innerWidth);
  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  const isMobile = width <= 768;

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
    "http://127.0.0.1:8545"
  );

  const [state, setState] = useState({
    provider: ethersProvider,
    routerContract: new ethers.Contract(router, routerAbi, ethersProvider),
  });

  const [content, setContent] = useState(<p></p>);
  console.log("Load Frame", wallet?.accounts[0].address);

  useEffect(() => {
    console.log("Wallet reload");
    if (wallet) {
      let ethersProvider = new ethers.providers.Web3Provider(wallet.provider);
      setState({
        provider: ethersProvider,
        routerContract: new ethers.Contract(
          router,
          routerAbi,
          ethersProvider.getSigner()
        ),
      });
    }
    setActive("Home");
  }, [wallet]);

  useEffect(() => {
    select();
  }, [active]);

  //Init contracts
  //if (wallet) {
  //  ethersProvider = new ethers.providers.Web3Provider(wallet.provider);
  //
  //  routerContract = new ethers.Contract(
  //    router,
  //    routerAbi,
  //    ethersProvider.getSigner()
  //  );
  //} else {
  //  ethersProvider = new ethers.providers.JsonRpcProvider(
  //    "http://127.0.0.1:8545"
  //  );
  //  routerContract = new ethers.Contract(router, routerAbi, ethersProvider);
  //}

  //let content = <p></p>;
  function select() {
    switch (active) {
      case "Swap":
        setContent(
          <Swap
            routerContract={state.routerContract}
            ethersProvider={state.provider}
            block={block}
          />
        );
        break;
      case "Liquidity":
        setContent(
          <Liquidity
            routerContract={state.routerContract}
            ethersProvider={state.provider}
            block={block}
          />
        );
        break;

      case "Build":
        setContent(
          <Build
            routerContract={state.routerContract}
            ethersProvider={state.provider}
            block={block}
          />
        );
        break;
      default:
        break;
    }
  }

  return (
    <div style={{ backgroundColor: background, minHeight: "100vh" }}>
      <MainMenu
        block={block}
        onclick={(item) => setActive(item)}
        active={active}
      ></MainMenu>
      <br />

      {content}
    
    </div>
  );
}
