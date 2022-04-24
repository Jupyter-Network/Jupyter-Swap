import "./index.css";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { DAppProvider, Mainnet,DEFAULT_SUPPORTED_CHAINS } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import { TestChain } from "./chains";

const config = {
  readOnlyChainId: TestChain.chainId,
  readOnlyUrls: {
    //[Mainnet.chainId]: "https://mainnet.infura.io/v3/" + INFURA_PROJECT_ID,
    [TestChain.chainId]:"http://127.0.0.1:9545"
  },
  networks:[...DEFAULT_SUPPORTED_CHAINS,TestChain]
}

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app",
});

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
