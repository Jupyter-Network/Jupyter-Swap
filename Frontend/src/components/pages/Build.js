import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { ethers, utils } from "ethers";
import { useEffect, useState } from "react";
import { token0, router, token1, wbnb } from "../../contracts/addresses";
import erc20 from "../../contracts/build/DynamicToken.json";
import BN from "bignumber.js";
import { numericFormat, validate } from "../../utils/inputValidations";
import { Container, ContainerTitle, GradientDiv } from "../../theme";
import { MediumButtonInverted } from "../../theme/buttons";
import { Input } from "../../theme/inputs";
import { Label, P } from "../../theme/outputs";
import { transaction } from "../../utils/alerts";
import LabeledInput from "../LabeledInput";

//Add this to a Math file later
function _scaleDown(value) {
  return BN(value.toString()).div(BN(10).pow(18)).toString();
}

export default function Build({ block, ethersProvider, routerContract }) {
  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
    disconnect, // function to call to with wallet<DisconnectOptions> to disconnect wallet
  ] = useConnectWallet();

  const [state, setState] = useState({ name: "", symbol: "", supply: "" });

  async function approveToken(contract, amount) {
    console.log(ethersProvider.getSigner());
    await transaction(`Approve `, contract.approve, [router, amount]);
  }

  //New Block
  useEffect(() => {
    async function asyncRun() {
      console.log("Block changed in swap");
    }
    asyncRun();
  }, [block]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <Container>
        <ContainerTitle>Create BEP-20 Token</ContainerTitle>
        <br />
        <div style={{ width: "80%", margin: "0 auto" }}>
          <LabeledInput
            name={"Token Name"}
            onChange={(e) => setState({ ...state, name: e.target.value })}
          ></LabeledInput>

          <LabeledInput
            name={"Token Symbol"}
            onChange={(e) => setState({ ...state, symbol: e.target.value })}
          ></LabeledInput>
          <LabeledInput
            name={"Total Supply"}
            onChange={(e) => setState({ ...state, supply: e.target.value })}
          ></LabeledInput>
        </div>

        <GradientDiv style={{ height: 90 }}>
          <br />

          <div style={{ display: "flex", justifyContent: "center" }}>
            <MediumButtonInverted
              onClick={async () => {
                console.log(erc20.bytecode);
                let factory = new ethers.ContractFactory(
                  erc20.abi,
                  erc20.bytecode,
                  ethersProvider.getSigner()
                );
                let token = await factory.deploy(
                  state.name,
                  state.symbol,
                  state.supply                );
                console.log("Token created: ", token.address);
                console.log(await token.totalSupply());
              }}
            >
              Create Token
            </MediumButtonInverted>
          </div>
        </GradientDiv>
      </Container>
    </div>
  );
}
