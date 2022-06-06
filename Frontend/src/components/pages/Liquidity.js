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
import { ColorFrame, Label, P } from "../../theme/outputs";
import { error, success, transaction } from "../../utils/alerts";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PoolSelector from "../liquidity/PoolSelector";
import { background, primary, secondary } from "../../theme/theme";

import CurrencyDisplay from "../liquidity/CurrencyDisplay";
import Balances from "../liquidity/Balances";
import Chart from "../liquidity/Chart";
import LabeledInput from "../LabeledInput";
import { getAPY } from "../../utils/requests";

const routerAbi = routerMeta.abi;
const erc20Abi = erc20.abi;
//Add this to a Math file later
function _scaleDown(value) {
  return BN(value.toString()).div(BN(10).pow(18)).toString();
}

export default function Liquidity({ block, ethersProvider, routerContract }) {
  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
    disconnect, // function to call to with wallet<DisconnectOptions> to disconnect wallet
  ] = useConnectWallet();
  const [state, setState] = useState({
    token0Amount: "0.0",
    token1Amount: "0.0",
    token1AmountMin: new BN(0),
    allowanceCheck: new BN(0),
    lpAmount: "0.0",
  });
  const [loading, setLoading] = useState(false);

  const [createWidgetState, setCreateWidgetState] = useState({
    bnbAmount: new BN(0),
    tokenAmount: new BN(0),
    address: "0x00",
  });
  const [createWidgetPrice, setCreateWidgetPrice] = useState(0);

  useEffect(() => {
    setCreateWidgetPrice(
      BN(createWidgetState.bnbAmount)
        .dividedBy(BN(createWidgetState.tokenAmount))
        .toString()
    );
  }, [createWidgetState]);

  const [maxSlippage, setMaxSlippage] = useState(new BN(0.5));

  const [blockData, setBlockData] = useState();

  function deadline() {
    return Date.now() + 900;
  }

  function handleToken0AmountChange(value) {
    console.log("Token 0 Amount change Handler", value);
    value = value;
    let t1Amount = new BN(0);
    if (blockData) {
      t1Amount = BN(value).dividedBy(BN(blockData.rate));
    }
    setState({
      ...state,
      token0Amount: validate(value),
      token1Amount: validate(t1Amount),
      token1AmountMin: subtractSlippage(t1Amount.multipliedBy(BN(10).pow(18))),
    });
  }

  function handleToken1AmountChange(value) {
    console.log("Token 1 Amount change Handler:", "value:", value);
    value = value;
    let t0Amount = BN(value).multipliedBy(BN(blockData.rate));

    setState({
      ...state,
      token0Amount: validate(t0Amount),
      token1Amount: validate(value),
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

  let storage = JSON.parse(localStorage.getItem("tokens"));
  const [tokens, setTokens] = useState(
    storage
      ? {
          token0: {
            symbol: "BNB",
            contract: new ethers.Contract(
              wbnb,
              erc20Abi,
              ethersProvider.getSigner()
            ),
            icon: "/placeholder.svg",
          },
          token1:
            storage.token0.address === wbnb
              ? {
                  ...storage.token0,
                  contract: new ethers.Contract(
                    storage.token1.address,
                    erc20Abi,
                    ethersProvider.getSigner()
                  ),
                }
              : {
                  ...storage.token0,
                  contract: new ethers.Contract(
                    storage.token0.address,
                    erc20Abi,
                    ethersProvider.getSigner()
                  ),
                },
        }
      : {
          token0: {
            symbol: "ARM",
            contract: new ethers.Contract(
              token1,
              erc20Abi,
              ethersProvider.getSigner()
            ),
            icon: "/placeholder.svg",
          },
          token1: {
            symbol: "BNB",
            contract: new ethers.Contract(
              wbnb,
              erc20Abi,
              ethersProvider.getSigner()
            ),
            icon: "/placeholder.svg",
          },
        }
  );

  //New Block
  useEffect(() => {
    async function asyncRun() {
      console.log("Block changed in swap");
      await getBlockData();
      handleToken0AmountChange(state.token0Amount.toString());
    }
    asyncRun();
  }, [block, tokens]);

  useEffect(() => {
    setTokens({
      token0: {
        symbol: "BNB",
        contract: new ethers.Contract(
          wbnb,
          erc20Abi,
          ethersProvider.getSigner()
        ),
        icon: "bnb-bnb-logo.svg",
      },
      token1: {
        ...tokens.token1,
        contract: new ethers.Contract(
          tokens.token1.contract.address,
          erc20Abi,
          ethersProvider.getSigner()
        ),
      },
    });

    //getBlockData();
  }, [wallet]);

  useEffect(() => {
    //getBlockData();
  }, [tokens]);

  //Router

  async function createLiquidityPool() {
    await transaction(
      `Start price will be: ${createWidgetPrice}`,
      routerContract.removeLiquidity,
      [
        tokens["token1"].contract.address,
        BN(state.lpAmount).multipliedBy(BN(10).pow(36)).toFixed(0),
      ]
    );
    getBlockData();
    await routerContract.createLiquidityPool(
      createWidgetState.address,
      BN(createWidgetState.tokenAmount)
        .multipliedBy(BN(10).pow(18))
        .toFixed(0)
        .toString(),
      deadline(),
      {
        value: BN(createWidgetState.bnbAmount)
          .multipliedBy(BN(10).pow(18))
          .toFixed(0)
          .toString(),
      }
    );
  }

  async function addLiquidity() {
    await transaction(
      `Add Liquidity ${numericFormat(state.token0Amount)}BNB ${numericFormat(
        state.token1Amount
      )}${tokens["token1"].symbol}`,
      routerContract.addLiquidity,
      [
        tokens["token1"].contract.address,
        BN(state.token1Amount)
          .multipliedBy(BN(10).pow(18))
          .toFixed(0)
          .toString(),
        deadline(),
        {
          value: BN(state.token0Amount)
            .multipliedBy(BN(10).pow(18))
            .toFixed(0)
            .toString(),
        },
      ]
    );
    getBlockData();
  }

  async function removeLiquidity() {
    await transaction(
      `Remove Liquidity ${numericFormat(state.lpAmount)} LP`,
      routerContract.removeLiquidity,
      [
        tokens["token1"].contract.address,
        BN(state.lpAmount).multipliedBy(BN(10).pow(36)).toFixed(0),
        deadline(),
      ]
    );
    getBlockData();
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
    const symbol = tokens["token1"].symbol;
    const tokenContract = tokens["token1"].contract;
    await transaction(
      `Approve ${BN(amount).dividedBy(BN(10).pow(18))} ${symbol}`,
      tokenContract.approve,
      [router, amount.toString()]
    );
  }

  //BEP-20
  async function approveAnonymousToken(contract, amount) {
    await transaction(
      `Approve ${BN(amount).dividedBy(BN(10).pow(18))}`,
      contract.approve,
      [router, amount.toString()]
    );
  }

  async function getBlockData() {
    console.log("Fetch Block Data");
    if (loading) {
      console.log("Loading in progress");
      return true;
    }
    setLoading(true);
    const t0Balance = wallet
      ? await ethersProvider.getBalance(wallet.accounts[0].address)
      : 0;
    const t1Balance = wallet
      ? await tokens["token1"].contract.balanceOf(wallet.accounts[0].address)
      : 0;
    const userBalance = wallet
      ? await routerContract.getBalance(tokens["token1"].contract.address)
      : 0;
    const rate = await routerContract.getRate(
      tokens["token1"].contract.address
    );

    const poolBalances = await routerContract.getPoolBalances(
      tokens["token1"].contract.address
    );

    const lpTotalSupply = await routerContract.getLPTotalSupply(
      tokens["token1"].contract.address
    );

    const apy = await getAPY(tokens.token1.contract.address);
    console.log(
      BN(apy)
        .dividedBy(BN(poolBalances[1].toString()).dividedBy(BN(10).pow(18)))
        .toString()
    );
    setBlockData({
      token0Balance: _scaleDown(t0Balance),
      token1Balance: _scaleDown(t1Balance),
      rate: _scaleDown(rate),
      userBalance: userBalance,
      poolBalances: poolBalances,
      lpTotalSupply: lpTotalSupply,
      apy: BN(apy)
        .dividedBy(
          BN(poolBalances[1].toString())
            .multipliedBy(2)
            .dividedBy(BN(10).pow(18))
        )
        .multipliedBy(100)
        .toString(),
    });
    setLoading(false);
  }
  return (
    <div
      style={{
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: 1200,
      }}
    >
      <Balances blockData={blockData} tokens={tokens}></Balances>
      <div style={{ width: "100vw" }}></div>
      <Container style={{ maxHeight: 260 }}>
        <ContainerTitle>Select Pool</ContainerTitle>
        <PoolSelector
          provider={ethersProvider}
          onChange={(tokens) => {
            setTokens(tokens);
          }}
          initialTokens={tokens}
        ></PoolSelector>
        {blockData ? (
          <p>
            APY: <b>{numericFormat(blockData.apy)} % </b>
          </p>
        ) : (
          <p></p>
        )}
        <GradientDiv style={{ height: 90 }}>
          <br />

          <div style={{ display: "flex", justifyContent: "center" }}>
            {tokens["token1"].contract.address === wbnb ? (
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
      <Chart blockData={blockData}></Chart>
      <Container>
        <ContainerTitle>Add Liquidity</ContainerTitle>
        <p>
          {tokens["token0"].symbol} / {tokens["token1"].symbol}
        </p>
        <div style={{ width: "80%", margin: "0 auto" }}>
          <LabeledInput
            name={tokens["token0"].symbol}
            onChange={(e) => handleToken0AmountChange(e.target.value)}
            value={state.token0Amount.toString()}
            icon={tokens["token0"].icon}
            onFocus={(e) => setState({ ...state, token0Amount: "" })}
          ></LabeledInput>

          <LabeledInput
            name={tokens["token1"].symbol}
            onChange={(e) => handleToken1AmountChange(e.target.value)}
            value={state.token1Amount.toString()}
            icon={tokens["token1"].icon}
            onFocus={(e) => setState({ ...state, token1Amount: "" })}
          ></LabeledInput>
        </div>

        <br />
        <LargeButton
          onClick={() => {
            addLiquidity();
          }}
        >
          Add Liquidity
        </LargeButton>
      </Container>
      <Container style={{ maxHeight: 192 }}>
        <ContainerTitle>Remove Liquidity</ContainerTitle>
        <span>
          {tokens["token0"].symbol} / {tokens["token1"].symbol}
        </span>
        <br />
        <div style={{ width: "80%", margin: "0 auto" }}>
          <LabeledInput
            name={"LP"}
            onChange={(e) => {
              let v = BN(validate(e.target.value));
              setState({ ...state, lpAmount: validate(e.target.value) });
            }}
            value={state.lpAmount}
            icon={""}
            onFocus={(e) => setState({ ...state, lpAmount: "" })}
          ></LabeledInput>
        </div>

        <br />
        <LargeButton onClick={() => removeLiquidity()}>
          RemoveLiquidity
        </LargeButton>
      </Container>
      <div style={{ width: "100%" }}>
        <h3 style={{ color: primary, textAlign: "center" }}>
          Open a new liquidty pool:
        </h3>
      </div>
      <Container style={{ maxHeight: 440 }}>
        <ContainerTitle>Create New Liquidity Pool</ContainerTitle>
        <div style={{ width: "80%", margin: "0 auto" }}>
          <LabeledInput
            name={"Token Address"}
            value={createWidgetState.address}
            onChange={(e) =>
              setCreateWidgetState({
                ...createWidgetState,
                address: e.target.value,
              })
            }
            onFocus={(e) =>
              setCreateWidgetState({
                ...createWidgetState,
                address: "",
              })
            }
          ></LabeledInput>
          <br></br>

          <LabeledInput
            name={"BNB Amount"}
            value={validate(createWidgetState.bnbAmount)}
            onChange={(e) =>
              setCreateWidgetState({
                ...createWidgetState,
                bnbAmount: BN(e.target.value),
              })
            }
            onFocus={(e) =>
              setCreateWidgetState({
                ...createWidgetState,
                bnbAmount: "",
              })
            }
            icon={"/bnb-bnb-logo.svg"}
          ></LabeledInput>
          <br></br>
          <LabeledInput
            name={"Token Amount"}
            value={validate(createWidgetState.tokenAmount)}
            onChange={(e) =>
              setCreateWidgetState({
                ...createWidgetState,
                tokenAmount: BN(e.target.value),
              })
            }
            onFocus={(e) =>
              setCreateWidgetState({
                ...createWidgetState,
                tokenAmount: "",
              })
            }
          ></LabeledInput>
        </div>

        <p>
          Initial Price:{" "}
          <P>{numericFormat(BN(createWidgetPrice).toFixed(18))}</P>
        </p>
        <LargeButton onClick={() => createLiquidityPool()}>
          Create Pool
        </LargeButton>
        <br />
        <br />
        <GradientDiv style={{ height: 90 }}>
          <br />

          <MediumButtonInverted
            onClick={() => {
              approveAnonymousToken(
                new ethers.Contract(
                  createWidgetState.address,
                  erc20Abi,
                  ethersProvider.getSigner()
                ),
                createWidgetState.tokenAmount
                  .multipliedBy(BN(10).pow(18))
                  .toFixed(0)
              );
            }}
          >
            Approve Token
          </MediumButtonInverted>
        </GradientDiv>
      </Container>
    </div>
  );
}
