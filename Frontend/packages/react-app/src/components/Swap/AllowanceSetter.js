import { useState } from "react";
import { Button } from "../elements";
import BN from "bignumber.js"
export default function AllowanceSetter({setMaxSlippage,allowance,tokenName}) {
  const [selections, setSelections] = useState(["Increase", "Decrease"]);
  const [selection, setSelection] = useState(1);
  const [open, setOpen] = useState(false);
  return (
    <div style={{marginTop:-15}}>
      <Button style={{padding:6}} onClick={() => setOpen(open ? false : true)}>Set</Button>
      &nbsp;
      <span style={{ color: "dodgerblue", fontSize: "medium",lineHeight:0.5 }}>
              {tokenName} Allowance &nbsp;
              <span style={{textDecoration:"underline"}}>
              {new BN(allowance)
                .toString()}
              </span>
            </span>
      &nbsp;
      {open ? (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {selections.map((item,index) => (
            <Button onClick={()=>{
                setMaxSlippage(item.split(" ")[1].slice(0,-1))
                setSelection(index)
            }} style={{padding:8,marginRight:2}}>{item}</Button>
          ))}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}