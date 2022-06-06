import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { ethers, utils } from "ethers";
import { useEffect, useState } from "react";
import { token0, token1 } from "../contracts/addresses";
import erc20Abi from "../contracts/build/ERC20.json";
import useInterval from "react-useinterval";
import Frame from "./layout/Frame";

export default function ContractWrapper() {
  const connectedWallets = useWallets();
  const [block, setBlock] = useState(0);
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  let ethersProvider;
  let tokenContract;



  if (!tokenContract && connectedWallets.length > 0) {
    //Setup provider
    ethersProvider = new ethers.providers.Web3Provider(
      connectedWallets[0].provider
    );

    //Add all contracts
  }

  //Check if new block is out
  async function checkBlock() {
    if (ethersProvider) {
      let result = await ethersProvider.getBlockNumber();
      if (result !== block) {
        setBlock(result);
      }
    }
  }


  let refreshTime = 100000; //ms
  useInterval(checkBlock, refreshTime);

  return (
    <div>
          <Frame></Frame>
    </div>
  );
}
