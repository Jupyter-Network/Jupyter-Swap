import { useEffect, useState } from "react"
import { Container, ContainerTitle } from "../../theme"
import { LargeButton } from "../../theme/buttons"
import { numericFormat } from "../../utils/inputValidations"
import { calcNewPosition, priceFromSqrtPrice, sqrtPriceFromPrice, tickAtSqrtPrice } from "../../utils/mathHelper"
import LabeledInput from "../LabeledInput"
import { Slider } from "./Slider"

export function AddLpPositionComponent({blockData,tokens,onAddLiquidity}){
const [lowerBoundary,setLowerBoundary] = useState(0)
const [upperBoundary,setUpperBoundary] = useState(0)
const [liquidity,setLiquidity] = useState(100)
const [lpQuote,setLpQuote] = useState({amount0:0,amount1:0});

useEffect(()=>{
    getQuote()
},[lowerBoundary,upperBoundary])


function getQuote(){

    let quote = calcNewPosition(
        tickAtSqrtPrice(sqrtPriceFromPrice(lowerBoundary)),
        tickAtSqrtPrice(sqrtPriceFromPrice(upperBoundary)),
        blockData.currentTick,
        BigInt(liquidity)*10n**18n,
        BigInt(blockData.currentSqrtPrice)
      );
    
      setLpQuote({ amount0: quote[0], amount1: quote[1] });
}

    return (
        <Container>
        <ContainerTitle>Add Liquidity Position</ContainerTitle>
        <p>
          {tokens["token0"].symbol} / {tokens["token1"].symbol}
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Slider
            width={300}
            height={40}
            currentPrice={priceFromSqrtPrice(
              BigInt(blockData.currentSqrtPrice.toString())
            )}
            positions={[]}
            onMoveRight={(e) => {
              setUpperBoundary(e)
            }}
            onMoveLeft={(e) => {
              setLowerBoundary(e)
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
          ></LabeledInput>
          <LabeledInput
            name={"Liquidity"}
            onChange={(e) => setLiquidity(e.target.value)}
            value={liquidity.toString()}
            onFocus={async (e) => {
              setLiquidity(0)
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
            <b>{numericFormat(BigInt(lpQuote.amount1))}</b>
            &nbsp;{" "}
            <img
              src={"/tokenlogos/" + tokens.token1.icon}
              style={{ width: 20, marginBottom: -5 }}
            ></img>
          </div>
        </div>
        <p>
            
          {
            priceFromSqrtPrice(
                BigInt(blockData.currentSqrtPrice.toString())
              )
            }
        </p>

        <br />
        <LargeButton
          onClick={() => {
            onAddLiquidity(lpQuote,lowerBoundary,upperBoundary,liquidity);
          }}
        >
          Add Liquidity
        </LargeButton>
      </Container>
    )
}