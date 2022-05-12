import { useEffect, useState } from "react";
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
        display: "flex",
        justifyContent: "center",
        backgroundColor: "lightgray",
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
  );
}

function Item({ name, active, onclick }) {
  return (
    <div
      onClick={() => {
        onclick(name);
      }}
      className={active ? styles.menuButtonActive : styles.menuButton}
    >
      <p>{name}</p>
    </div>
  );
}
