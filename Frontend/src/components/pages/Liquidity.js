import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { router, wbnb } from "../../contracts/addresses";
import erc20 from "../../contracts/build/ERC20.json";
import BN from "bignumber.js";
import { numericFormat, validate } from "../../utils/inputValidations";
import { Container, ContainerTitle, GradientDiv } from "../../theme";
import { LargeButton, MediumButtonInverted } from "../../theme/buttons";
import { P } from "../../theme/outputs";
import { transaction } from "../../utils/alerts";
import "react-toastify/dist/ReactToastify.css";
import PoolSelector from "../liquidity/PoolSelector";
import { primary } from "../../theme/theme";

import Balances from "../liquidity/Balances";
import Chart from "../liquidity/Chart";
import LabeledInput from "../LabeledInput";
import { getAPY } from "../../utils/requests";
import { initTokens } from "../../initialValues";
import LoadingSpinner from "../LoadingSpinner";
import {
  priceFromSqrtPrice,
  sqrtPriceFromPrice,
  sqrtPriceFromTick,
  tickAtSqrtPrice,
  _scaleDown,
} from "../../utils/mathHelper";
import { fetchBlockData, fetchBlockDataNew } from "../liquidity/blockData";
const erc20Abi = erc20.abi;

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
    lowerBoundary: 0,
    upperBoundary: 0,
    liquidity: 0,
  });

  const [lpQuote, setLpQuote] = useState({
    amount0: 0,
    amount1: 0,
  });
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);

  const [createWidgetState, setCreateWidgetState] = useState({
    token0Address: "0x00",
    token1Address: "0x00",
    liquidity: 0,
    startPrice: 0,
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
  function handleBoundaryChange(value, lower) {
    if (lower) {
      setState({
        ...state,
        lowerBoundary: value,
      });
    } else {
      setState({
        ...state,
        upperBoundary: value,
      });
    }
  }
  function handleLiquidityChange(value) {
    setState({
      ...state,
      liquidity: validate(value),
    });
  }

  async function loadLpQuote() {
    let quote = await routerContract.addPositionView(
      tokens["token0"].contract.address,
      tokens["token1"].contract.address,
      tickAtSqrtPrice(sqrtPriceFromPrice(state.lowerBoundary)),
      tickAtSqrtPrice(sqrtPriceFromPrice(state.upperBoundary)),
      new BN(state.liquidity)
        .multipliedBy(new BN(10).pow(new BN(18)))
        .toFixed(0)
    );
    console.log("Get Quote: ", quote);

    setLpQuote({ amount0: quote[0], amount1: quote[1] });
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
            ...storage.token0,
            contract: new ethers.Contract(
              storage.token0.address,
              erc20Abi,
              ethersProvider.getSigner()
            ),
          },
          token1: {
            ...storage.token1,
            contract: new ethers.Contract(
              storage.token1.address,
              erc20Abi,
              ethersProvider.getSigner()
            ),
          },
        }
      : initTokens(ethers, ethersProvider, erc20Abi)
  );

  //New Block
  useEffect(() => {
    async function asyncRun() {
      console.log("Block changed in swap");
      await getBlockData();
      handleToken0AmountChange(state.token0Amount.toString());
    }
    if (!loading || firstLoad) {
      asyncRun();
    }
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
    console.log(
      createWidgetState.token0Address,
      createWidgetState.token1Address
    );
    let [token0Address, token1Address] =
      BigInt(createWidgetState.token0Address) <
      BigInt(createWidgetState.token1Address)
        ? [createWidgetState.token0Address, createWidgetState.token1Address]
        : [createWidgetState.token1Address, createWidgetState.token0Address];

    let token0 = await new ethers.Contract(
      token0Address,
      erc20Abi,
      ethersProvider.getSigner()
    );
    let token1 = await new ethers.Contract(
      token1Address,
      erc20Abi,
      ethersProvider.getSigner()
    );

    let token0Symbol = await token0.symbol();
    let token1Symbol = await token1.symbol();

    let startTick = tickAtSqrtPrice(
      sqrtPriceFromPrice(createWidgetState.startPrice)
    );
    startTick = Math.round(startTick.toString() / 64) * 64;
    const startPrice = priceFromSqrtPrice(sqrtPriceFromTick(startTick));
    await transaction(
      `Start Price: 1 ${token0Symbol} = ${numericFormat(
        startPrice
      )} ${token1Symbol}`,
      routerContract.createPool,
      [
        createWidgetState.token0Address,
        createWidgetState.token1Address,
        startTick,
      ],
      getBlockData
    );

    //await routerContract.createLiquidityPool(
    //  createWidgetState.address,
    //  BN(createWidgetState.tokenAmount)
    //    .multipliedBy(BN(10).pow(18))
    //    .toFixed(0)
    //    .toString(),
    //  deadline(),
    //  {
    //    value: BN(createWidgetState.bnbAmount)
    //      .multipliedBy(BN(10).pow(18))
    //      .toFixed(0)
    //      .toString(),
    //  }
    //);
  }

  async function addLiquidity() {
    console.log(
      tokens["token0"].contract.address,
      tokens["token1"].contract.address,
      Math.round(
        tickAtSqrtPrice(sqrtPriceFromPrice(state.lowerBoundary)).toString() / 64
      ) * 64,
      Math.round(
        tickAtSqrtPrice(sqrtPriceFromPrice(state.upperBoundary)).toString() / 64
      ) * 64,
      BN(state.liquidity.toString())
        .multipliedBy(BN(10).pow(BN(18)))
        .toString()
    );
    await transaction(
      `Add Liquidity ${numericFormat(_scaleDown(lpQuote.amount0).toString())}${
        tokens.token0.symbol
      } ${numericFormat(_scaleDown(lpQuote.amount1).toString())}${
        tokens["token1"].symbol
      }`,
      routerContract.addPosition,
      [
        tokens["token0"].contract.address,
        tokens["token1"].contract.address,
        Math.round(
          tickAtSqrtPrice(sqrtPriceFromPrice(state.lowerBoundary)).toString() /
            64
        ) * 64,
        Math.round(
          tickAtSqrtPrice(sqrtPriceFromPrice(state.upperBoundary)).toString() /
            64
        ) * 64,
        BN(state.liquidity.toString())
          .multipliedBy(BN(10).pow(BN(18)))
          .toString(),

        //deadline(),
        //{
        //  value: BN(state.token0Amount)
        //    .multipliedBy(BN(10).pow(18))
        //    .toFixed(0)
        //    .toString(),
        //},
      ],
      getBlockData
    );
  }

  async function removeLiquidity() {
    await transaction(
      `Remove Liquidity ${numericFormat(state.lpAmount)} LP`,
      routerContract.removeLiquidity,
      [
        tokens["token1"].contract.address,
        BN(state.lpAmount).multipliedBy(BN(10).pow(36)).toFixed(0),
        deadline(),
      ],
      getBlockData
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
    await transaction(
      `Approve ${BN(amount).dividedBy(BN(10).pow(18))}`,
      contract.approve,
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
    setFirstLoad(false);
    setLoading(true);
    setBlockData(
      await fetchBlockDataNew({
        wallet,
        tokens,
        ethersProvider,
        routerContract,
      })
    );
    setLoading(false);
  }
  return (
    <>
      {loading || firstLoad ? <LoadingSpinner></LoadingSpinner> : <></>}
      <div
        style={{
          margin: "0 auto",
          display: !loading ? "flex" : "none",
          visibility: loading ? "hidden" : "visible",
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
              <MediumButtonInverted
                onClick={() => {
                  if (!wallet) {
                    connect();
                    return;
                  }
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
        <Container>
          <ContainerTitle>Add Liquidity Position</ContainerTitle>
          <p>
            {tokens["token0"].symbol} / {tokens["token1"].symbol}
          </p>
          <div style={{ width: "80%", margin: "0 auto" }}>
            <LabeledInput
              name={"Lower Boundary"}
              onChange={(e) => handleBoundaryChange(e.target.value, true)}
              value={state.lowerBoundary.toString()}
              onFocus={(e) => setState({ ...state, lowerBoundary: "" })}
              onBlur={async () => {
                await loadLpQuote();
              }}
            ></LabeledInput>
            <LabeledInput
              name={"Upper Boundary"}
              onChange={(e) => handleBoundaryChange(e.target.value, false)}
              value={state.upperBoundary.toString()}
              onFocus={(e) => setState({ ...state, upperBoundary: "" })}
              onBlur={async () => {
                await loadLpQuote();
              }}
            ></LabeledInput>
            <LabeledInput
              name={"Liquidity"}
              onChange={(e) => handleLiquidityChange(e.target.value, false)}
              value={Math.floor(state.liquidity.toString())}
              onFocus={async (e) => {
                setState({ ...state, liquidity: "" });
              }}
              onBlur={async () => {
                await loadLpQuote();
              }}
            ></LabeledInput>
            <p>
              Amount {tokens.token0.symbol}:{" "}
              <b>{numericFormat(_scaleDown(lpQuote.amount0))}</b>
            </p>
            <p>
              Amount {tokens.token1.symbol}:{" "}
              <b>{numericFormat(_scaleDown(lpQuote.amount1))}</b>
            </p>
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
            Remove Liquidity
          </LargeButton>
        </Container>
        <div style={{ width: "100%" }}>
          <h3 style={{ color: primary, textAlign: "center" }}>
            Open a new liquidty pool:
          </h3>
        </div>
        <Container style={{ maxHeight: 440 }}>
          <ContainerTitle>
            Create New Liquidity Pool Concentrated
          </ContainerTitle>
          <div style={{ width: "80%", margin: "0 auto" }}>
            <LabeledInput
              name={"Token 0 Address"}
              value={createWidgetState.token0Address}
              onChange={(e) =>
                setCreateWidgetState({
                  ...createWidgetState,
                  token0Address: e.target.value,
                })
              }
              onFocus={(e) =>
                setCreateWidgetState({
                  ...createWidgetState,
                  token0Address: "",
                })
              }
            ></LabeledInput>
            <br></br>
            <LabeledInput
              name={"Token 1 Address"}
              value={createWidgetState.token1Address}
              onChange={(e) =>
                setCreateWidgetState({
                  ...createWidgetState,
                  token1Address: e.target.value,
                })
              }
              onFocus={(e) =>
                setCreateWidgetState({
                  ...createWidgetState,
                  token1Address: "",
                })
              }
            ></LabeledInput>

            <br></br>
            <LabeledInput
              name={"Start Price"}
              value={createWidgetState.startPrice.toString()}
              onChange={(e) => {
                setCreateWidgetState({
                  ...createWidgetState,
                  startPrice: e.target.value,
                });
              }}
              onFocus={(e) =>
                setCreateWidgetState({
                  ...createWidgetState,
                  startPrice: "",
                })
              }
            ></LabeledInput>
          </div>

          <LargeButton onClick={() => createLiquidityPool()}>
            Create Pool
          </LargeButton>
        </Container>
      </div>
    </>
  );
}
