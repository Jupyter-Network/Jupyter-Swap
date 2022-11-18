import Position from "./Position";

export default function LiquidityPositions(data) {
    if (data) {
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
            overflowY:"scroll",
            maxHeight:"90%"
          }}
        >
          {data.map((e) => {
            return <Position data={e}></Position>
          })}
        </div>
      );
    }
  
   
  }
  