import { useEffect } from "react";
import Home from "./Home";
import Swap from "./Swap";

export default function MainComponent({ page }) {
  switch (page) {
    case "home":
      return <Home></Home>;

    case "swap":
      return <Swap></Swap>;
  }
}
