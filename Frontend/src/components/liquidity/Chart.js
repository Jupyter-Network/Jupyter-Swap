import { Pie } from "react-chartjs-2";
import { Container, ContainerTitle } from "../../theme";
import BN from "bignumber.js";
import { background, primary, secondary } from "../../theme/theme";
export default function Chart({ blockData, tokens }) {
  console.log(blockData);
  return (
    <Container>
      <ContainerTitle>Your amount</ContainerTitle>
      <div style={{width:170,margin:"0 auto"}}>
        {blockData ? (
          <Pie
            options={{
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
            data={{
              labels: ["Pool", "Your piece"],
              datasets: [
                {
                  fill: false,
                  pointBorderColor: secondary,
                  label: "BRRRR",
                  backgroundColor: background,
                  borderColor: primary,
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
