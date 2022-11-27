import { currency, numericFormat } from "../../utils/inputValidations";
import CurrencyDisplay from "./CurrencyDisplay";
import BN from "bignumber.js";
import { secondary } from "../../theme/theme";
import { _scaleDown } from "../../utils/mathHelper";


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
                amount={currency(_scaleDown(blockData.token0Balance.toString()))}
                symbol={tokens["token0"].symbol}
                icon={tokens["token0"].icon}
              ></CurrencyDisplay>
              <CurrencyDisplay
                amount={currency(_scaleDown(blockData.token1Balance.toString()))}
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