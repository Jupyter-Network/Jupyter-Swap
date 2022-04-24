import { useState } from "react";

export default function SimpleInput({ price }) {
  const [token0Amount, setToken0Amount] = useState(0);
  const [token1Amount, setToken1Amount] = useState(0);

  function handleToken1AmountChange(token1Amount) {
    setToken0Amount(token1Amount * price);
    setToken1Amount(token1Amount);
  }
  function handleToken0AmountChange(token0Amount) {
    setToken0Amount(token0Amount);
    setToken1Amount(token0Amount / price);
  }

  return (
    <div>
      <p>Hello</p>
      <input
        value={token0Amount}
        onChange={(e) => handleToken0AmountChange(e.target.value)}
      ></input>
      <input
        value={token1Amount}
        onChange={(e) => handleToken1AmountChange(e.target.value)}
      ></input>
      <p>{token0Amount + " -- " + token1Amount}</p>
    </div>
  );
}
