import { useEffect } from "react";
import Home from "./Home";
import Swap from "./Swap";
import { useEthers } from "@usedapp/core";
export default function MainComponent({ page }) {
  const { account } = useEthers();

  switch (page) {
    case "home":
      return <Home></Home>;

    case "swap":

      return <Swap account={account}></Swap>;
  }
}
