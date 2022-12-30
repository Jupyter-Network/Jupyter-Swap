import { useEffect, useState } from "react";
import { Container, ContainerTitle } from "../../theme";
import { LargeButton } from "../../theme/buttons";
import { numericFormat,currencyFormat, currency } from "../../utils/inputValidations";
import {
  calcNewPosition,
  priceFromSqrtPrice,
  priceFromTick,
  sqrtPriceFromPrice,
  sqrtPriceFromTick,
  tickAtSqrtPrice,
  _scaleDown,
} from "../../utils/mathHelper";
import LabeledInput from "../LabeledInput";
import { Slider } from "./Slider";

export function AddLpPositionComponent({ blockData, tokens, onAddLiquidity,routerContract }) {
  const [lowerBoundary, setLowerBoundary] = useState(10);
  const [upperBoundary, setUpperBoundary] = useState(10);
  const [liquidity, setLiquidity] = useState(100);
  const [lpQuote, setLpQuote] = useState({ amount0: 0, amount1: 0 });
  const [wait,setWait] = useState(Date.now());

  useEffect(() => {
    getQuote();
  }, [lowerBoundary, upperBoundary, liquidity]);

  async function getQuote() {
    
   let quote = calcNewPosition(
     Math.round(tickAtSqrtPrice(sqrtPriceFromPrice(lowerBoundary)).toString()/64)*64,
     Math.round(tickAtSqrtPrice(sqrtPriceFromPrice(upperBoundary)).toString()/64)*64,
     blockData.currentTick,
     BigInt(liquidity*10**18),
     BigInt(blockData.currentSqrtPrice)
   );
   //console.log(
   //  quote
   //);
  //if(Date.now() < wait){
  //  return
  //}
  //  quote = await routerContract.addPositionView(
  //       tokens.token0.address,
  //       tokens.token1.address,
  //       Math.round(tickAtSqrtPrice(sqrtPriceFromPrice(lowerBoundary)).toString()/64)*64,
  //       Math.round(tickAtSqrtPrice(sqrtPriceFromPrice(upperBoundary)).toString()/64)*64,
  //       BigInt(liquidity * 10**18)
  //     );
//
    setLpQuote({ amount0: quote[0], amount1: quote[1] });
    setWait(Date.now() + 500);

  }

  function formattedData() {
    if (blockData.liquidityPositions.data) {
      return blockData.liquidityPositions.data.map((e) => {
        return {
          ut: priceFromTick(e.uppertick),
          lt: priceFromTick(e.lowertick),
          lp: _scaleDown(e.liquidity),
        };
      });
    }
    return [];
  }

  return (
    <Container style={{height:"fit-content"}}>
      <ContainerTitle>Add Liquidity Position</ContainerTitle>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Slider
          width={300}
          height={40}
          currentPrice={priceFromSqrtPrice(
            BigInt(blockData.currentSqrtPrice.toString())
          )}
          positions={formattedData()}
          onMoveRight={(e) => {
            setUpperBoundary(e ? e : 0);
          }}
          onMoveLeft={(e) => {
            setLowerBoundary(e ? e : 0);
          }}
        />
      </div>
      <div style={{ width: "80%", margin: "0 auto" }}>
        <LabeledInput
          name={"Lower Boundary"}
          onChange={(e) => setLowerBoundary(e.target.value)}
          value={lowerBoundary.toString()}
          onFocus={(e) => setLowerBoundary(0)}
        ></LabeledInput>
        <LabeledInput
          name={"Upper Boundary"}
          onChange={(e) => setUpperBoundary(e.target.value)}
          value={upperBoundary.toString()}
          onFocus={(e) => setUpperBoundary(0)}
          onBlur={() => {}}
        ></LabeledInput>
        <LabeledInput
          name={"Liquidity"}
          onChange={(e) => setLiquidity(e.target.value)}
          value={liquidity.toString()}
          onFocus={async (e) => {
            setLiquidity(0);
          }}
        ></LabeledInput>

        <br />
        <div style={{ textAlign: "start" }}>
          {tokens.token0.symbol} :{" "}
          <b>{numericFormat(BigInt(lpQuote.amount0))}</b>
          &nbsp;{" "}
          <img
            src={"/tokenlogos/" + tokens.token0.icon}
            style={{ width: 20, marginBottom: -5 }}
          ></img>
        </div>
        <br />
        <div style={{ textAlign: "start" }}>
          {tokens.token1.symbol} :{" "}
          <b>{currency(_scaleDown(lpQuote.amount1))}</b>
          &nbsp;{" "}
          <img
            src={"/tokenlogos/" + tokens.token1.icon}
            style={{ width: 20, marginBottom: -5 }}
          ></img>
        </div>
      </div>
      <p>
        Current Price:{" "}
        <b>{currency(priceFromSqrtPrice(BigInt(blockData.currentSqrtPrice.toString())))}</b>
      </p>

      <br />
      <LargeButton
        onClick={() => {
          onAddLiquidity(lpQuote, lowerBoundary, upperBoundary, liquidity);
        }}
      >
        Add Liquidity
      </LargeButton>
    </Container>
  );
}
