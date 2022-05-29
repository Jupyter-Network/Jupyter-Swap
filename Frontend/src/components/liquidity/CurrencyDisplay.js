import { ColorFrame } from "../../theme/outputs";

export default function CurrencyDisplay({
  amount = 0,
  symbol = "",
  icon = "",
}) {
  return (
    <ColorFrame>
      <div style={{ lineHeight: 2}}>
          <img
            style={{ height:25 ,position:"relative",top:6,right:5}}
            src={"/tokenlogos/" + icon}
          ></img>
               <span>{amount}</span> {symbol}

      </div>
    </ColorFrame>
  );
}
