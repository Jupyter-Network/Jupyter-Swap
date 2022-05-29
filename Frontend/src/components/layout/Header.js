import { useConnectWallet } from "@web3-onboard/react";
import {
  LargeButton,
  MediumButton,
  MediumButtonInverted,
} from "../../theme/buttons";
import { highlight, primary, secondary } from "../../theme/theme";
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
    <div style={{ display: "flex", justifyContent: "space-evenly",boxShadow:"0px 0px 2px black" }}>
      <h3
        style={{
          color: secondary,
          textAlign: "center",
        }}
      >
        Jupyter Swap
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
          {wallet.accounts[0].address.slice(0, 4) +
            "..." +
            wallet.accounts[0].address.slice(39)}
        </LargeButton>
      )}
    </div>
  );
}
