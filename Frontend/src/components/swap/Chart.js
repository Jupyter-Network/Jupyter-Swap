import { Line } from "react-chartjs-2";
import { Container, ContainerTitle } from "../../theme";
import { background, primary, secondary } from "../../theme/theme";

import BN from "bignumber.js";
export default function Chart({ blockData, tokens }) {
  return (
    <>
      <Container style={{ width: "100vw", maxWidth: "775px" }}>
        <ContainerTitle>Chart</ContainerTitle>
        {blockData.priceHistory ? (
          <div>
            <Line
              height={220}
              options={{
                tension: 0.3,
                scales: {
                  x: {
                    ticks: {
                      color: primary,
                    },
                  },
                  y: {
                    ticks: {
                      color: primary,
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
              data={{
                labels: blockData.priceHistory.map((item) => {
                  const date = new Date(item.bucket);
                  return `${date.getHours()}:${date.getMinutes()}`;
                }),
                datasets: [
                  {
                    fill: false,
                    pointBorderColor: secondary,
                    label:
                      tokens["token0"].symbol + " / " + tokens["token1"].symbol,
                    backgroundColor: background,
                    borderColor: primary,
                    data: blockData.priceHistory.map((item) =>
                      BN(item.close).dividedBy(BN(10).pow(18)).toString()
                    ),
                  },
                ],
              }}
            ></Line>
          </div>
        ) : (
          <p></p>
        )}
      </Container>
    </>
  );
}
