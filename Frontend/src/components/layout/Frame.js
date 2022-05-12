import { useState, useEffect } from "react";
import { background } from "../../theme/theme";
import ContractWrapper from "../ContractWrapper";
import Liquidity from "../pages/Liquidity";
import Swap from "../pages/Swap";
import MainMenu from "./MainMenu";

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

  let content = <p></p>;
  switch (active) {
    case "Swap":
      content = <Swap block={block}/>;
      break;
    case "Liquidity":
      content = <Liquidity block={block}/>
    default:
      break;
  }

  return (

        <div style={{backgroundColor:background,minHeight:"100vh"}}>
          <MainMenu
            block={block}
            onclick={(item) => setActive(item)}
            active={active}
          ></MainMenu>
          <br/>
          {content}
        </div>

  );
}
