import { Container } from "../../theme";
import { highlight, primary } from "../../theme/theme";

export default function Home() {
 
  return (
      <>
        <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
   <h2 style={{color:highlight}}>Welcome to Jupyter - Swap</h2>   
    </div>
   <br/>
   <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center"}}>
      <Container>
      <h3 style={{color:primary}}>Swap Tokens</h3>

      </Container>
      <Container>
          <h3 style={{color:primary}}>Manage Liquidity</h3>
      </Container>
   </div>
      </>
  
  );
}
