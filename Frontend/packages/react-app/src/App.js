import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";

import { Body, Button, Container, Header } from "./components";

import { addresses, abis } from "@my-app/contracts";
import GET_TRANSFERS from "./graphql/subgraph";
import Frame from "./components/Frame";

function WalletButton() {
  const [rendered, setRendered] = useState("");

  const ens = useLookupAddress();
  const { account, activateBrowserWallet, deactivate, error } = useEthers();

  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered(shortenAddress(account));
    } else {
      setRendered("");
    }
  }, [account, ens, setRendered]);

  useEffect(() => {
    if (error) {
      console.error("Error while connecting wallet:", error.message);
    }
  }, [error]);

  return (
    <Button
      onClick={() => {
        if (!account) {
          activateBrowserWallet();
        } else {
          deactivate();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}

function App() {
  // Read more about useDapp on https://usedapp.io/
  //const { error: contractCallError, value: tokenBalance } =
  //  useCall({
  //     contract: new Contract(addresses.ceaErc20, abis.erc20),
  //     method: "balanceOf",
  //     args: ["0x6eA8e0a2bA67984f813950460ed7C6431680bff1"],
  //  }) ?? {};

  const { loading, error: subgraphQueryError, data } = useQuery(GET_TRANSFERS);

  useEffect(() => {
    if (subgraphQueryError) {
      console.error("Error while querying subgraph:", subgraphQueryError.message);
      return;
    }
    if (!loading && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, subgraphQueryError, data]);

    
  return (
    <Container>
      <Header>
        <WalletButton />
      </Header>
      <Body>
     <Frame page="home"/>
      </Body>
    </Container>
  );
}

export default App;

/*

//Get tokenBalance with useCall hook
  const { error: contractCallError, value: tokenBalance } =
    useCall({
       contract: new Contract(addresses.ceaErc20, abis.erc20),
       method: "balanceOf",
       args: ["0x6eA8e0a2bA67984f813950460ed7C6431680bff1"],
    }) ?? {};
  {!tokenBalance ? <p>Loading...</p>:<p>{tokenBalance[0].toString()}</p>}
*/