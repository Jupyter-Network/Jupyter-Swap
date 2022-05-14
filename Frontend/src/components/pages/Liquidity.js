import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { ethers, utils } from "ethers";
import { useEffect, useState } from "react";
import { token0, router, token1, wbnb } from "../../contracts/addresses";
import erc20 from "../..//contracts/build/IERC20.json";
import routerMeta from "../../contracts/build/JupyterRouterV1.json";
import BN from "bignumber.js";
import { numericFormat, validate } from "../../utils/inputValidations";
import { Container, ContainerTitle, GradientDiv } from "../../theme";
import {
  LargeButton,
  MediumButton,
  MediumButtonInverted,
} from "../../theme/buttons";
import { Input } from "../../theme/inputs";
import { Label, P } from "../../theme/outputs";
const routerAbi = routerMeta.abi;
const erc20Abi = erc20.abi;
//Add this to a Math file later
function _scaleDown(value) {
  return BN(value.toString()).div(BN(10).pow(18)).toString();
}

export default function Liquidity({ block }) {
  const connectedWallets = useWallets();
  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
    disconnect, // function to call to with wallet<DisconnectOptions> to disconnect wallet
  ] = useConnectWallet();
  const [state, setState] = useState({
    token0Amount: "0",
    token1Amount: new BN(0),
    token1AmountMin: new BN(0),
    allowanceCheck: new BN(0),
    lpAmount: new BN(0),
  });

  const [createWidgetState, setCreateWidgetState] = useState({
    bnbAmount: new BN(0),
    tokenAmount: new BN(0),
  });
  const [createWidgetPrice, setCreateWidgetPrice] = useState(0);

  useEffect(() => {
    console.log(
      "Set widget price",
      BN(createWidgetState.tokenAmount).toFixed(18),
      BN(createWidgetState.bnbAmount).toFixed(18)
    );

    setCreateWidgetPrice(
      BN(createWidgetState.bnbAmount)
        .dividedBy(BN(createWidgetState.tokenAmount))
        .toString()
    );
  }, [createWidgetState]);

  const [maxSlippage, setMaxSlippage] = useState(new BN(0.5));

  const [blockData, setBlockData] = useState();
  let ethersProvider;
  let routerContract;

  function handleToken0AmountChange(value) {
    console.log("Token 0 Amount change Handler", value);
    value = validate(value);
    let t1Amount = new BN(0);
    if (blockData) {
      t1Amount = BN(value).dividedBy(BN(blockData.rate));
    }
    setState({
      token0Amount: value,
      token1Amount: t1Amount.toString(),
      token1AmountMin: subtractSlippage(t1Amount.multipliedBy(BN(10).pow(18))),
    });
  }

  function handleToken1AmountChange(value) {
    console.log("Token 1 Amount change Handler:", "value:", value);
    value = validate(value);
    let t0Amount = BN(value).multipliedBy(BN(blockData.rate));

    setState({
      token0Amount: t0Amount,
      token1Amount: value.toString(),
      token1AmountMin: subtractSlippage(new BN(value)).multipliedBy(
        new BN(10).pow(18)
      ),
    });
  }

  function subtractSlippage(amountBeforeSlippage) {
    return amountBeforeSlippage.multipliedBy(
      new BN(1).minus(maxSlippage / 100)
    );
  }

  //New Block
  useEffect(() => {
    async function asyncRun() {
      console.log("Block changed in swap");
      await getBlockData();
      handleToken0AmountChange(state.token0Amount.toString());
    }
    asyncRun();
  }, [block]);

  //Init contracts
  if (wallet) {
    ethersProvider = new ethers.providers.Web3Provider(wallet.provider);

    routerContract = new ethers.Contract(
      router,
      routerAbi,
      ethersProvider.getSigner()
    );
  }
  const [tokens, setTokens] = useState({
    token0: {
      symbol: "BNB",
      contract: new ethers.Contract(wbnb, erc20Abi, ethersProvider),
      icon: "bnb-bnb-logo.svg",
    },
    token1: {
      symbol: "MRC",
      contract: new ethers.Contract(token0, erc20Abi, ethersProvider),
      icon: "placeholder.svg",
    },
  });

  //Router
  async function addLiquidity() {
    console.log(state.token0Amount, state.token1Amount);
    await routerContract.addLiquidity(
      tokens["token1"].contract.address,
      BN(state.token1Amount).multipliedBy(BN(10).pow(18)).toFixed(0).toString(),
      {
        value: BN(state.token0Amount)
          .multipliedBy(BN(10).pow(18))
          .toFixed(0)
          .toString(),
      }
    );
  }

  async function removeLiquidity() {
    console.log(BN(state.lpAmount).multipliedBy(BN(10).pow(36)).toFixed(0));
    await routerContract.removeLiquidity(
      tokens["token1"].contract.address,
      BN(state.lpAmount).multipliedBy(BN(10).pow(36)).toFixed(0)
    );
  }
  async function getToken1AmountFromToken0Amount(amount) {
    return await routerContract.getToken1AmountFromToken0Amount(
      tokens["token0"].contract.address,
      tokens["token1"].contract.address,
      amount
    );
  }

  //BEP-20
  async function approveToken(contract, amount) {
    await contract.approve(router, amount);
  }

  async function getBlockData() {
    const t0Balance = wallet
      ? await ethersProvider.getBalance(wallet.accounts[0].address)
      : 0;
    const t1Balance = wallet
      ? await tokens["token1"].contract.balanceOf(wallet.accounts[0].address)
      : 0;
    const userBalance = wallet
      ? await routerContract.getBalance(tokens["token1"].contract.address)
      : 0;
    const rate = wallet
      ? await routerContract.getRate(tokens["token1"].contract.address)
      : 0;

    const poolBalances = wallet
      ? await routerContract.getPoolBalances(tokens["token1"].contract.address)
      : [0, 0];

    const lpTotalSupply = wallet
      ? await routerContract.getLPTotalSupply(tokens["token1"].contract.address)
      : 0;
    setBlockData({
      token0Balance: _scaleDown(t0Balance),
      token1Balance: _scaleDown(t1Balance),
      rate: _scaleDown(rate),
      userBalance: userBalance,
      poolBalances: poolBalances,
      lpTotalSupply: lpTotalSupply,
    });
  }
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: 1200,
      }}
    >
      <Container>
        <ContainerTitle>Add Liquidity</ContainerTitle>
        <span>
          {tokens["token0"].symbol} / {tokens["token1"].symbol}
        </span>
        <br />
        <Input
          onChange={(e) => handleToken0AmountChange(e.target.value)}
          value={state.token0Amount.toString()}
        ></Input>
        <Label>
          <b>{tokens["token0"].symbol}</b>
        </Label>

        <br />
        <Input
          onChange={(e) => handleToken1AmountChange(e.target.value)}
          value={state.token1Amount.toString()}
        ></Input>
        <Label>
          <b>{tokens["token1"].symbol}</b>
        </Label>
        <br />
        <br />
        <LargeButton
          onClick={() => {
            console.log(
              BN(state.token0Amount)
                .multipliedBy(BN(10).pow(18))
                .toFixed(0)
                .toString(),
              BN(state.token1Amount)
                .multipliedBy(BN(10).pow(18))
                .toFixed(0)
                .toString()
            );
            addLiquidity();
          }}
        >
          Add Liquidity
        </LargeButton>

        <GradientDiv style={{ height: 90 }}>
          <br />

          <div style={{ display: "flex", justifyContent: "center" }}>
            {tokens["token0"].contract.address === wbnb ? (
              <span></span>
            ) : (
              <MediumButtonInverted
                onClick={() => {
                  if (!wallet) {
                    connect();
                    return;
                  }
                  approveToken(
                    tokens["token0"].contract,
                    "100000000000000000000000"
                  );
                }}
              >
                Approve {tokens["token0"].symbol}{" "}
                <img
                  style={{ height: 20, position: "relative", top: 2 }}
                  src={`/tokenlogos/${tokens["token0"].icon}`}
                ></img>
              </MediumButtonInverted>
            )}
            {tokens["token1"].contract.address === wbnb ? (
              <span></span>
            ) : (
              <MediumButtonInverted
                onClick={() => {
                  approveToken(
                    tokens["token1"].contract,
                    "100000000000000000000000"
                  );
                }}
              >
                Approve {tokens["token1"].symbol}{" "}
                <img
                  style={{ height: 20, position: "relative", top: 2 }}
                  src={`/tokenlogos/${tokens["token1"].icon}`}
                ></img>
              </MediumButtonInverted>
            )}
          </div>
        </GradientDiv>
      </Container>
      <Container>
        <ContainerTitle>Remove Liquidity</ContainerTitle>
        <br />
        <Input
          onChange={(e) => {
            let v = BN(validate(e.target.value));
            setState({ ...state, lpAmount: e.target.value });
          }}
          value={state.lpAmount}
        ></Input>
        <Label>
          <b>LP</b>
        </Label>
        <br />
        <br />
        <LargeButton onClick={() => removeLiquidity()}>
          RemoveLiquidity
        </LargeButton>
        <br />
      </Container>
      <Container>
        <ContainerTitle>Your Balances</ContainerTitle>
        {blockData ? (
          <div style={{ textAlign: "left", paddingLeft: 5 }}>
            <p>
              <P>
                {" "}
                {numericFormat(
                  BN(blockData.userBalance.toString())
                    .dividedBy(BN(10).pow(36))
                    .toString()
                )}
              </P>{" "}
              LP
            </p>

            <p>
              <P>{numericFormat(blockData.token0Balance.toString())}</P>
              {tokens["token0"].symbol}
            </p>
            <p>
              <P>{numericFormat(blockData.token1Balance.toString())}</P>
              {tokens["token1"].symbol}
            </p>
          </div>
        ) : (
          <p></p>
        )}
      </Container>
      <Container>
        <ContainerTitle>Pool Balances</ContainerTitle>
        {blockData ? (
          <div style={{ textAlign: "left", paddingLeft: 5 }}>
            <p>
              <P>
                {numericFormat(
                  BN(blockData.lpTotalSupply.toString())
                    .dividedBy(BN(10).pow(36))

                    .toString()
                )}
              </P>
              LP
            </p>
            <p>
              <P>
                {" "}
                {numericFormat(
                  BN(blockData.poolBalances[0].toString())
                    .dividedBy(BN(10).pow(18))
                    .toString()
                )}
              </P>{" "}
              BNB
            </p>

            <p>
              <P>
                {numericFormat(
                  BN(blockData.poolBalances[1].toString())
                    .dividedBy(BN(10).pow(18))
                    .toString()
                )}
              </P>
              {tokens["token1"].symbol}
            </p>
          </div>
        ) : (
          <p></p>
        )}
      </Container>
      <Container>
        <ContainerTitle>Create New Liquidity Pool</ContainerTitle>
        <Input placeholder="Address"></Input>
        <Label>Token</Label>
        <br />
        <br />
        <Input
          value={createWidgetState.bnbAmount}
          onChange={(e) =>
            setCreateWidgetState({
              ...createWidgetState,
              bnbAmount: BN(e.target.value),
            })
          }
          style={{ width: 200 }}
          placeholder="BNB Amount"
        ></Input>
        <Label>BNB</Label>
        <Input
          value={createWidgetState.tokenAmount}
          onChange={(e) =>
            setCreateWidgetState({
              ...createWidgetState,
              tokenAmount: BN(e.target.value),
            })
          }
          style={{ width: 200 }}
          placeholder="Token Amount"
        ></Input>{" "}
        <Label>Token</Label>
        <p>
          Initial Price: <P>{numericFormat(BN(createWidgetPrice).toFixed(18))}</P>
        </p>
        <br />
        <br />
        <LargeButton>Create Pool</LargeButton>
      </Container>
    </div>
  );
}
