import Position from "./Position";

export default function LiquidityPositions({
  blockData,
  positionInfo,
  tokens,
  onRemove,
  onCollectFees,
}) {
  if (blockData.liquidityPositions.data) {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-evenly",
          overflowY: "scroll",
          maxHeight:500,
          marginTop: -15
        }}
      >
        {blockData.liquidityPositions.data.length == 0 ? <p>You have no Liquidity Positions yet.</p>:blockData.liquidityPositions.data.map((e) => {
          return (
            <Position
              data={e}
              blockData={blockData}
              positionInfo={positionInfo}
              tokens={tokens}
              onRemove={onRemove}
              onCollectFees={onCollectFees}
            ></Position>
          );
        })}
        {}
    
      </div>
    );
  }
}
