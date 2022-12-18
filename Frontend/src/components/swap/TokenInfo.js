import { Container, ContainerTitle, GradientDiv } from "../../theme";
import {
  MediumButton,
  MediumButtonInverted,
  SmallButton,
} from "../../theme/buttons";
import { background, highlight, primary } from "../../theme/theme";
import { addressFormat } from "../../utils/inputValidations";

export default function TokenInfo({ tokens }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        maxWidth: 1180,
        margin: "0 auto",
        justifyContent: "center",
      }}
    >
      <Container
        style={{ minWidth: 300, width: "45%", maxWidth: "97%", flexGrow: 2 }}
      >
        <br />
        <div style={{ textAlign: "left", paddingLeft: 15 }}>
          <img
            src={"/tokenlogos/" + tokens.token0.icon}
            style={{
              width: 50,
              borderRadius: 10,
              boxShadow: "0px 0px 7px -2px black",
              padding: 3,
            }}
          ></img>
          <h4 style={{ color:"white" }}>{tokens.token0.symbol} : {tokens.token0.name}</h4>

          <p>{tokens.token0.description}</p>
          <p>No description for this token</p>
          <a
            title={"View token on bscscan"}
            style={{ color: highlight }}
            href={`https://bscscan.com/token/${tokens.token0.address}`}
          >
            <b>
              View on Bscscan &nbsp;
              {addressFormat(tokens.token0.address)}
            </b>
          </a>
        </div>

        <br />
      </Container>
      <Container
        style={{ minWidth: 300, width: "45%", maxWidth: "97%", flexGrow: 2 }}
      >
        <div style={{ textAlign: "left", paddingLeft: 15 }}>
          <br />
          <img
            src={"/tokenlogos/" + tokens.token1.icon}
            style={{
              width: 50,
              borderRadius: 10,
              boxShadow: "0px 0px 7px -2px black",
              padding: 3,
            }}
          ></img>
          <h4 style={{ color:"white" }}>{tokens.token1.symbol} : {tokens.token1.name}</h4>

          <p>{tokens.token1.description}</p>
          <p>No description for this token</p>
          <a
            title={"View token on bscscan"}
            style={{ color: highlight }}
            href={`https://bscscan.com/token/${tokens.token1.address}`}
          >
            <b>
              View on Bscscan &nbsp;
              {addressFormat(tokens.token1.address)}
            </b>
          </a>
        </div>
        <br />
      </Container>
    </div>
  );
}
