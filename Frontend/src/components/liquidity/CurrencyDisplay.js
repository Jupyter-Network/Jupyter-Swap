import { ColorFrame } from "../../theme/outputs";

export default function CurrencyDisplay({
  amount = 0,
  symbol = "",
  icon = "",
}) {
  return (
    <ColorFrame>
      <div style={{ lineHeight: 2}}>
    
          <span>{amount}</span> {symbol}
          <img
            style={{ width: 20, position: "relative", top: 5 , left: 5 }}
            src={"/tokenlogos/" + icon}
          ></img>
     
      </div>
    </ColorFrame>
  );
}
