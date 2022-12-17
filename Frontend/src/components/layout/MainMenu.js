import { useEffect, useState } from "react";
import { MainMenuItem } from "../../theme";
import {
  background,
  backgroundGradient,
  primary,
  secondary,
} from "../../theme/theme";
import styles from "./MainMenu.module.css";

export default function MainMenu({ onclick, active, block }) {
  const items = [ "Swap", "Liquidity", "Build"];
  useEffect(() => {
    //get balances here
    if (block) {
      console.log("block changed");
    }
  }, [block]);
  return (
    <div style={{ zIndex:2,position:"sticky",top:0,backgroundColor:background,boxShadow:"0px 4px 4px rgba(0,0,0,0.1)"}}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: 40,
        }}
      >
        {items.map((item) => (
          <Item
            active={active === item}
            onclick={onclick}
            key={item}
            name={item}
          ></Item>
        ))}
      </div>
    </div>
  );
}

function Item({ name, active, onclick }) {
  return (
    <MainMenuItem
      onClick={() => {
        onclick(name);
      }}
    >
      <p>{name}</p>
    </MainMenuItem>
  );
}
