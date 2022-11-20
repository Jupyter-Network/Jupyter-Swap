import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { router, wbnb } from "../../contracts/addresses";
import erc20 from "../../contracts/build/ERC20.json";
import BN from "bignumber.js";
import { Slider } from "../liquidity/Slider";
import {
  addressFormat,
  numericFormat,
  txHashFormat,
  validate,
} from "../../utils/inputValidations";
import {
  Container,
  ContainerInverted,
  ContainerTitle,
  GradientDiv,
} from "../../theme";
import {
  LargeButton,
  MediumButtonInverted,
  SmallButton,
} from "../../theme/buttons";
import { P } from "../../theme/outputs";
import { transaction } from "../../utils/alerts";
import "react-toastify/dist/ReactToastify.css";
import PoolSelector from "../liquidity/PoolSelector";
import { primary, tintedBackground } from "../../theme/theme";

import Balances from "../liquidity/Balances";
import Chart from "../liquidity/Chart";
import LabeledInput from "../LabeledInput";
import { initTokens } from "../../initialValues";
import LoadingSpinner from "../LoadingSpinner";
import {
  calcNewPosition,
  priceFromSqrtPrice,
  sqrtPriceFromPrice,
  sqrtPriceFromTick,
  tickAtSqrtPrice,
  _scaleDown,
} from "../../utils/mathHelper";
import { fetchBlockData, fetchBlockDataNew } from "../liquidity/blockData";
import { AddLpPositionComponent } from "../liquidity/AddLpPositionComponent";
import LiquidityPositions from "../liquidity/LiquidityPositions";
const erc20Abi = erc20.abi;
const formatter = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 5,
});

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
    lowerBoundary: 0,
    upperBoundary: 0,
    liquidity: 100,
    lpId: 0,
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

  function handleBoundaryChange(value, lower) {
    if (lower) {
      console.log("Set Lower", value);

      setState({
        ...state,
        lowerBoundary: value,
      });
    } else {
      console.log("Set Upper", value);
      setState({
        ...state,
        upperBoundary: value,
      });
    }
  }
  async function handleLiquidityChange(value) {
    setState({
      ...state,
      liquidity: validate(value),
    });
    await loadLpQuote({ ...state, liquidity: validate(value) });
  }

  async function loadLpQuote(currentState) {
    if (blockData) {
      let quote = calcNewPosition(
        tickAtSqrtPrice(sqrtPriceFromPrice(currentState.lowerBoundary)),
        tickAtSqrtPrice(sqrtPriceFromPrice(currentState.upperBoundary)),
        blockData.currentTick,
        new BN(currentState.liquidity)
          .multipliedBy(new BN(10).pow(new BN(18)))
          .toFixed(0),
        BigInt(blockData.currentSqrtPrice)
      );

      setLpQuote({ amount0: quote[0], amount1: quote[1] });
    }
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

  useEffect(() => {
    console.log(ethersProvider.getCode());
  }, [wallet]);

  useEffect(() => {
    console.log("Tokens changed");
    getBlockData();
  }, [tokens]);
  useEffect(() => {
    setLoading(false);
  }, [blockData]);

  //Router

  async function createLiquidityPool() {
    if (!wallet) {
      connect();
      return;
    }
    let [token0Address, token1Address] =
      BigInt(createWidgetState.token0Address) <
      BigInt(createWidgetState.token1Address)
        ? [createWidgetState.token0Address, createWidgetState.token1Address]
        : [createWidgetState.token1Address, createWidgetState.token0Address];

    console.log(token0Address, token1Address);
    let token0 = new ethers.Contract(
      token0Address,
      erc20Abi,
      ethersProvider.getSigner()
    );
    let token1 = new ethers.Contract(
      token1Address,
      erc20Abi,
      ethersProvider.getSigner()
    );
    console.log(await token0.symbol());
    let token0Symbol = await token0.symbol();
    let token1Symbol = await token1.symbol();

    let startTick = tickAtSqrtPrice(
      sqrtPriceFromPrice(createWidgetState.startPrice)
    );
    startTick = Math.round(startTick.toString() / 64) * 64;
    const startPrice = priceFromSqrtPrice(sqrtPriceFromTick(startTick));
    await transaction(
      `Start Price: 1 ${token0Symbol} = ${startPrice} ${token1Symbol}`,
      routerContract.createPool,
      [
        createWidgetState.token0Address,
        createWidgetState.token1Address,
        startTick,
      ],
      getBlockData
    );
  }

  async function addLiquidity(
    lpQuote,
    lowerBoundary,
    upperBoundary,
    liquidity
  ) {
    if (!wallet) {
      connect();
      return;
    }
    await transaction(
      `Add Liquidity ${numericFormat(lpQuote.amount0.toString())}${
        tokens.token0.symbol
      } ${numericFormat(lpQuote.amount1.toString())}${tokens["token1"].symbol}`,
      routerContract.addPosition,
      [
        tokens["token0"].contract.address,
        tokens["token1"].contract.address,
        Math.round(
          tickAtSqrtPrice(sqrtPriceFromPrice(lowerBoundary)).toString() / 64
        ) * 64,
        Math.round(
          tickAtSqrtPrice(sqrtPriceFromPrice(upperBoundary)).toString() / 64
        ) * 64,
        BN(liquidity)
          .multipliedBy(BN(10).pow(BN(18)))
          .toFixed(0),

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

  async function collectFees(_positionId) {
    if (!wallet) {
      connect();
      return;
    }
    await transaction(
      `Collect fees for Position n. ${_positionId} ?
     `,
      routerContract.collectFees,
      [
        tokens["token0"].contract.address,
        tokens["token1"].contract.address,
        _positionId,

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
    if (!wallet) {
      connect();
      return;
    }
    await transaction(
      `Remove Liquidity Position number ${state.lpId}`,
      routerContract.removePosition,
      [
        tokens["token0"].contract.address,
        tokens["token1"].contract.address,
        BigInt(state.lpId),
        //deadline(),
      ],
      getBlockData
    );
  }

  async function removeLiquidityById(id) {
    if (!wallet) {
      connect();
      return;
    }
    await transaction(
      `Remove Liquidity Position number ${id}`,
      routerContract.removePosition,
      [
        tokens["token0"].contract.address,
        tokens["token1"].contract.address,
        BigInt(id),
        //deadline(),
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
    if (!wallet) {
      connect();
      return;
    }
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
    setLoading(true);
    setBlockData(
      await fetchBlockDataNew({
        wallet,
        tokens,
        ethersProvider,
        routerContract,
      })
    );
    //setLoading(false);
  }

  return (
    <>
      {loading || !blockData ? (
        <LoadingSpinner></LoadingSpinner>
      ) : (
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
          <div style={{ width: "100%" }}>
            <Container style={{ maxHeight: 260, margin: "0 auto" }}>
              <ContainerTitle>Select Pool</ContainerTitle>
              <PoolSelector
                provider={ethersProvider}
                onChange={(tokens) => {
                  console.log("PoolSelectro loaded");
                  setTokens(tokens);
                }}
                initialTokens={tokens}
              ></PoolSelector>
              <br />
              <GradientDiv style={{ height: 90 }}>
                <br />

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <MediumButtonInverted
                    onClick={() => {
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
          </div>

          <AddLpPositionComponent
            onAddLiquidity={(
              lpQuote,
              lowerBoundary,
              upperBoundary,
              liquidity
            ) => addLiquidity(lpQuote, lowerBoundary, upperBoundary, liquidity)}
            blockData={blockData}
            tokens={tokens}
          ></AddLpPositionComponent>
          <div>
            <Container style={{ maxWidth: "96vw", width: 400 }}>
              <ContainerTitle>Your Positions</ContainerTitle>
              <LiquidityPositions
                blockData={blockData}
                positionInfo={routerContract.positionInfo}
                tokens={tokens}
                onRemove={(e) => {
                  removeLiquidityById(e);
                }}
                onCollectFees={(e) => {
                  collectFees(e);
                }}
              ></LiquidityPositions>
            </Container>
          </div>

          <div style={{ width: "100%" }}>
            <h3 style={{ color: primary, textAlign: "center" }}>
              Open a new liquidty pool:
            </h3>
          </div>
          <Container style={{ maxHeight: 290 }}>
            <ContainerTitle>Create New Pool</ContainerTitle>
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
      )}
    </>
  );
}
