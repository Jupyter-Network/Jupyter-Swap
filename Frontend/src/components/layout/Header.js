import { useConnectWallet } from "@web3-onboard/react";
import {
  LargeButton,
  MediumButton,
  MediumButtonInverted,
} from "../../theme/buttons";
import { backgroundGradient, highlight, highlightGradient, primary, secondary } from "../../theme/theme";
import { addressFormat, txHashFormat } from "../../utils/inputValidations";
export default function Header() {
  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
    disconnect, // function to call to with wallet<DisconnectOptions> to disconnect wallet
  ] = useConnectWallet();
  return (
    <>
     <div style={{ display: "flex", justifyContent: "space-evenly"}}>
      <img src="/tokenlogos/jupyterSwap.svg" style={{width:40}}></img>
      <h3
        style={{
          color: highlight,
          textAlign: "center",
        }}
      >
        Jupyter - Swap
      </h3>
      {!wallet ? (
        <LargeButton
          onClick={() => {
            connect();
          }}
        >
          Connect
        </LargeButton>
      ) : (
        <LargeButton
          onClick={() => {
            disconnect(wallet);
          }}
        >
          {addressFormat(wallet.accounts[0].address)}
  
        </LargeButton>
      )}
    </div>
          <div style={{height:1,width:"100%",background:highlightGradient}}></div>
    </>
   

  );
}
