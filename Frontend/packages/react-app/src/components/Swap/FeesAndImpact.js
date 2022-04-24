import BN from "bignumber.js";
import ToolTip from "../ToolTip.js"
export default function FeesAndImpact({ expectedImpact }) {
  const maxImpact = 1
  const highSlippage = expectedImpact - 0.3 > maxImpact;
  return (
    <div>
      <p style={{ textDecoration: "underline", fontSize: "medium" }}>
        Fees & Price Impact
      </p>
      <p style={{ fontSize: "medium" }}>
       Pool Fee: 0.3%   <ToolTip toolTip={<span>0.27% LP, 0.03% Treasury</span>} link={"http://google.ch"}></ToolTip> <br />
        <span style={{ color: highSlippage ? "red" : "dodgerblue" }}>
          Price Impact: &nbsp;
            {new BN(expectedImpact - 0.3).toFixed(3)}
        % <ToolTip toolTip={<span>Red if Price Impact gte. 1%</span>} link={"http://google.ch"}></ToolTip>
        </span>
        <b>
            <br/>
            <br/>
          <span
            style={{
              fontSize: "medium",
              textDecoration: "underline",
              textDecorationStyle: "double",
              color: highSlippage ? "red" : "dodgerblue",
            }}
          >
            = {expectedImpact.toString()}% Total
          </span>
        </b>
      </p>
    </div>
  );
}
