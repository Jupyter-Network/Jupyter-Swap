import { Container, GradientDiv } from "../../theme";
import { tintedBackground } from "../../theme/theme";
import { priceFromTick } from "../../utils/mathHelper";
import { MediumButton, MediumButtonInverted } from "../../theme/buttons";
import { txHashFormat } from "../../utils/inputValidations";
import { useState } from "react";
const formatter = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 5,
});

export default function Position({ data }) {
  const [open, setOpen] = useState(false);
  const card = {
    borderRadius: 5,
    padding: 5,
    backgroundColor: tintedBackground,
    width: "fit-content",
    flexGrow: 2,
    margin: 1,
  };
  return (
    <Container
      style={{
        width: 180,
        height: open ? 245 : 37,
        transition: "height 0.5s ease",
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
            backgroundColor: tintedBackground,
            width: "100%",
            overflow: "hidden",
            cursor:"pointer"
          }}
          onClick={() => {
            setOpen(!open);
          }}
        >
          ID: <b>{data.lp_id.toLocaleString()}</b>
          <img
            src="/tokenlogos/placeholder.svg"
            style={{ margin: "auto", width: 17, float: "right" }}
          ></img>
        </div>
        {open ? (
          <>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
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
                  {(BigInt(data.liquidity) / 10n ** 18n).toLocaleString()}
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
            </div>
  
              <MediumButton style={{ margin: 5 }}>
                Remove
              </MediumButton>
          
          </>
        ) : (
          <div></div>
        )}
      </div>
    </Container>
  );
}
