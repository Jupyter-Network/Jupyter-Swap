import { useEffect, useState } from "react";
import { MainMenuItem } from "../../theme";
import { background, backgroundGradient, primary, secondary } from "../../theme/theme";
import styles from "./MainMenu.module.css";

export default function MainMenu({ onclick, active, block }) {
  const items = ["Home", "Swap", "Liquidity"];
  useEffect(() => {
    //get balances here
    if (block) {
      console.log("block changed");
    }
  }, [block]);
  return (
    <div
      style={{
        backgroundColor: background,
      }}
    >
      <h3
        style={{
          color: secondary,
          textAlign: "start",
          marginTop: 0,
          padding:20,
        }}
      >
        Jupyter-Swap
      </h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: 30,
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
