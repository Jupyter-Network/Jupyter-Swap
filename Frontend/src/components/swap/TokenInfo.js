import { Container, ContainerTitle } from "../../theme";
import { highlight } from "../../theme/theme";

export default function TokenInfo({ tokens }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        maxWidth: 1180,
        margin: "0 auto",
        justifyContent:"center"
    }}
    >
      <Container style={{minWidth:300,width:"45%",maxWidth:"97%",flexGrow:2}}>
        <ContainerTitle>{tokens.token0.name}</ContainerTitle>
        <div style={{ textAlign: "left", paddingLeft: 15 }}>
          <img
            src={"/tokenlogos/" + tokens.token0.icon}
            style={{ width: 32 }}
          ></img>
          <br />
          <h4>
            {tokens.token0.name} : {tokens.token0.symbol}
          </h4>
          <a style={{color:highlight}}  href={`https://bscscan.com/token/${tokens.token0.address}`}>
            {tokens.token0.address.slice(0, 5) +
              "..." +
              tokens.token0.address.slice(38)}
          </a>
          <p>{tokens.token0.description}</p>
        </div>
      </Container>
      <Container style={{minWidth:300,width:"45%",maxWidth:"97%",flexGrow:2}}>
        <ContainerTitle>{tokens.token1.name}</ContainerTitle>
        <div style={{ textAlign: "left", paddingLeft: 15 }}>
          <img
            src={"/tokenlogos/" + tokens.token1.icon}
            style={{ width: 32 }}
          ></img>
          <br />
          <h4>
            {tokens.token1.name} : {tokens.token1.symbol}
          </h4>
          <a style={{color:highlight}}  href={`https://bscscan.com/token/${tokens.token1.address}`}>
            {tokens.token1.address.slice(0, 5) +
              "..." +
              tokens.token1.address.slice(38)}
          </a>
          <p>{tokens.token1.description}</p>
        </div>
      </Container>
    </div>
  );
}
