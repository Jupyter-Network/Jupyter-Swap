import { Container, GradientDiv } from "../../theme";
import {
  background,
  backgroundGradient,
  highlight,
  highlightGradient,
  primary,
  secondary,
  tintedBackground,
} from "../../theme/theme";
import {
  calcNewPosition,
  priceFromTick,
  _scaleDown,
} from "../../utils/mathHelper";
import { MediumButton, MediumButtonInverted } from "../../theme/buttons";
import {
  currency,
  currencyFormat,
  numericFormat,
  txHashFormat,
} from "../../utils/inputValidations";
import { useState } from "react";
const formatter = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 5,
});

export default function Position({
  data,
  blockData,
  positionInfo,
  tokens,
  onRemove,
  onCollectFees,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [positionData, setPositionData] = useState(false);

  //const [lpQuote, setLpQuote] = useState(loadLpQuote());
  const card = {
    borderRadius: 5,
    padding: 5,
    backgroundColor: tintedBackground,
    flexGrow: 2,
    margin: 1,
  };
  function loadLpQuote() {
    if (blockData) {
      let quote = calcNewPosition(
        data.lowertick,
        data.uppertick,
        blockData.currentTick,
        BigInt(data.liquidity) * 10n ** 18n,
        BigInt(blockData.currentSqrtPrice)
      );
      return { amount0: quote[0], amount1: quote[1] };
    }
  }
  let lpQuote = loadLpQuote();
  return (
    <Container
      style={{
        height: "fit-content",
        maxHeight: open ? 325 : 37,
        transition: "max-height 0.3s ease",
      }}
    >
      <div
        style={{
          textAlign: "start",
          padding: 5,
          display: "flex",
          flexWrap: "wrap",
          gap: "1px",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            borderRadius: 5,
            padding: 5,
            backgroundColor: open ? background : tintedBackground,
            color: open ? secondary : primary,
            width: "100%",
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={async () => {
            if (!open) {
              setLoading(true);
              let res = await positionInfo(
                tokens.token0.contract.address,
                tokens.token1.contract.address,
                data.lp_id
              );
              console.log("Open:", data.lowertick, data.uppertick);

              setPositionData({
                token0Amount: res[0],
                token1Amount: res[1],
                fee0: res[2],
                fee1: res[3],
              });
              setLoading(false);
              //setPositionData({
              //   token0Amount: 10000 ,
              //   token1Amount: 100,
              //   fee0: 20,
              //   fee1: 40,
              // });
            }
            setOpen(!open);
          }}
        >
          {loading ? <img style={{height:15}} src="small_loader.svg"></img> : <b>{data.lp_id.toLocaleString()}</b>}

         
          &nbsp;{" "}
          {lpQuote.amount1 == 0
            ? 0
            : numericFormat(lpQuote.amount1 / 10n ** 18n)}{" "}
          : &nbsp;
          {lpQuote.amount0 == 0
            ? 0
            : numericFormat(lpQuote.amount0 / 10n ** 18n)}
          <img
            src={`/tokenlogos/${tokens["token0"].icon}`}
            style={{ margin: "auto", width: 17, float: "right" }}
          ></img>
                    <img
            src={`/tokenlogos/${tokens["token1"].icon}`}
            style={{ margin: "auto", width: 17, float: "right" }}
          ></img>
        </div>
        {open ? (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={card}>
                From:{" "}
                <p
                  style={{
                    padding: 0,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {formatter.format(priceFromTick(data.lowertick))}
                </p>
              </div>
              <div style={card}>
                To:
                <p
                  style={{
                    padding: 0,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {formatter.format(priceFromTick(data.uppertick))}
                </p>
              </div>

              <div style={card}>
                Liquidity:{" "}
                <p
                  style={{
                    padding: 0,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {(BigInt(data.liquidity) / 10n ** 9n).toString() / 10 ** 9}
                </p>
              </div>
              <div style={card}>
                <span>Tx: </span>
                <p
                  style={{
                    padding: 0,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {txHashFormat(data.tx_id)}
                </p>
              </div>
              <div style={card}>
                <span>Collected Fees 0: </span>
                <p
                  style={{
                    padding: 0,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {numericFormat(positionData.fee0.toString())}
                </p>
              </div>
              <div style={card}>
                <span>Collected Fees 1: </span>
                <p
                  style={{
                    padding: 0,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {numericFormat(positionData.fee1.toString())}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div></div>
        )}
      </div>

      <MediumButton
        onClick={() => onRemove(data.lp_id)}
        style={{ padding: 10, margin: 10 }}
      >
        Remove Position
      </MediumButton>
      <MediumButton
        onClick={() => onCollectFees(data.lp_id)}
        style={{ padding: 10, margin: 10 }}
      >
        Collect Position Needs Fix
      </MediumButton>
    </Container>
  );
}
