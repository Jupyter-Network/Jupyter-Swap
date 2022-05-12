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

  //Contract Functions
  //BEP-20
  async function getTokenBalance(tokenAddress, walletAddress) {
    if (ethersProvider) {
      let token = new ethers.Contract(tokenAddress, erc20Abi, ethersProvider);
      console.log(await token.balanceOf(walletAddress));
    }
  }

  if (!tokenContract && connectedWallets.length > 0) {
    //Setup provider
    ethersProvider = new ethers.providers.Web3Provider(
      connectedWallets[0].provider
    );

    //Add all contracts
    tokenContract = new ethers.Contract(token0, erc20Abi, ethersProvider);
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

  let refreshTime = 1500; //ms
  useInterval(checkBlock, refreshTime);


  return (
    <div>
      {connectedWallets.length > 0 ? (
        <div>
          <Frame block={block}></Frame>
          //Work here bring all contracts to this wrapper and make them usable
          in the child components also create a state here with the balances
          allowances similar to
        </div>
      ) : (
        <div>
          <p>ContractWrapper</p>
          <button onClick={() => connect()}>Connect</button>
        </div>
      )}
    </div>
  );
}
