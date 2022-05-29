import { numericFormat } from "../../utils/inputValidations";
import CurrencyDisplay from "./CurrencyDisplay";
import BN from "bignumber.js";
import { secondary } from "../../theme/theme";


export default function Balances({blockData,tokens}){
    return(

        <div
        style={{
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1200,
        }}
      >
        <div style={{ padding: 8, textAlign: "start", color: secondary }}>
          <p style={{ marginBottom: 5 }}>Pool Balance:</p>
          {blockData ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "start",
              }}
            >
              <CurrencyDisplay
                amount={numericFormat(
                  BN(blockData.lpTotalSupply.toString())
                    .dividedBy(BN(10).pow(36))
                    .toString(),
                  3
                )}
                symbol="LP"
                icon="/bnb-bnb-logo.svg"
              ></CurrencyDisplay>
  
              <CurrencyDisplay
                amount={numericFormat(
                  BN(blockData.poolBalances[0].toString())
                    .dividedBy(BN(10).pow(18))
                    .toString(),
                  3
                )}
                symbol={tokens["token0"].symbol}
                icon={tokens["token0"].icon}
              ></CurrencyDisplay>
              <CurrencyDisplay
                amount={numericFormat(
                  BN(blockData.poolBalances[1].toString())
                    .dividedBy(BN(10).pow(18))
                    .toString(),
                  3
                )}
                symbol={tokens["token1"].symbol}
                icon={tokens["token1"].icon}
              ></CurrencyDisplay>
            </div>
          ) : (
            <p></p>
          )}
        </div>
        <div style={{ padding: 8, textAlign: "start", color: secondary }}>
          <p style={{ marginBottom: 5 }}>Your Balance:</p>
          {blockData ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "start",
              }}
            >
              <CurrencyDisplay
                amount={numericFormat(
                  BN(blockData.userBalance.toString())
                    .dividedBy(BN(10).pow(36))
                    .toString()
                )}
                symbol="LP"
                icon="/bnb-bnb-logo.svg"
              ></CurrencyDisplay>
              <CurrencyDisplay
                amount={numericFormat(blockData.token0Balance.toString(), 3)}
                symbol={tokens["token0"].symbol}
                icon={tokens["token0"].icon}
              ></CurrencyDisplay>
              <CurrencyDisplay
                amount={numericFormat(blockData.token1Balance.toString(), 3)}
                symbol={tokens["token1"].symbol}
                icon={tokens["token1"].icon}
              ></CurrencyDisplay>
            </div>
          ) : (
            <p></p>
          )}
        </div>
        </div>
    )

}