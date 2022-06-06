import { Pie } from "react-chartjs-2";
import { Container, ContainerTitle } from "../../theme";
import BN from "bignumber.js";
import {
  background,
  backgroundGradient,
  highlight,
  primary,
  secondary,
} from "../../theme/theme";
export default function Chart({ blockData, tokens }) {
  return (
    <Container style={{height:230}}>
      <ContainerTitle>Pool</ContainerTitle>
      <div style={{ width: 170, margin: "0 auto" }}>
        {blockData ? (
          <Pie
            options={{
              plugins: {
                legend: {
                  display: true,
                  labels: {
                    color: primary,
                  
                  },
                  textAlign:"left"
                },
              },
            }}
            data={{
              labels: ["Pool", "Your share"],
              datasets: [
                {
                  label: "",
                  backgroundColor: background,
                  borderColor: primary,
                  hoverBorderWidth: 3,
                  data: [
                    BN(blockData.lpTotalSupply.toString())
                      .minus(BN(blockData.userBalance.toString()))
                      .dividedBy(BN(10).pow(36))
                      .toFixed(3),
                    BN(blockData.userBalance.toString())
                      .dividedBy(BN(10).pow(36))
                      .toFixed(3),
                  ],
                },
              ],
            }}
          ></Pie>
        ) : (
          <p></p>
        )}
      </div>
    </Container>
  );
}
