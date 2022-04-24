import { useState } from "react";
import { Button } from "../elements";

export default function MaxSlippageSelector({setMaxSlippage}) {
  const [selections, setSelections] = useState(["Low 0.2%", "Medium 0.5%", "High 0.8%"]);
  const [selection, setSelection] = useState(1);
  const [open, setOpen] = useState(false);
  return (
    <div style={{marginTop:-10}}>
      <Button style={{padding:6}} onClick={() => setOpen(open ? false : true)}>Set</Button>
      &nbsp;
      <span style={{fontSize:"medium"}}>Max. Slippage: <span style={{textDecoration:"underline"}}>{selections[selection]}</span></span>
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
