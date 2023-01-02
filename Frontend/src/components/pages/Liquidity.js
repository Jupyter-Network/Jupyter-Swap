import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import CONST from "../../CONST.json";
import erc20 from "../../contracts/build/ERC20.json";
import BN from "bignumber.js";
import { Slider } from "../liquidity/Slider";
import {
  addressFormat,
  currency,
  dynamicPrecisionDecimal,
  isAddress,
  numericFormat,
  safeBigInt,
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
import { error, transaction, transactionChain } from "../../utils/alerts";
import "react-toastify/dist/ReactToastify.css";
import PoolSelector from "../liquidity/PoolSelector";
import { background, highlight, primary, secondary, tintedBackground } from "../../theme/theme";

import Balances from "../liquidity/Balances";
import Chart from "../liquidity/Chart";
import LabeledInput from "../LabeledInput";
import { initTokens } from "../../initialValues";
import LoadingSpinner from "../LoadingSpinner";
import {
  calcNewPosition,
  checkAndSetAllowance,
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
    initialAmount: 1000,
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

      quote = await routerContract.addPositionView(
        currentState.token0.address,
        currentState.token1.address,
        tickAtSqrtPrice(sqrtPriceFromPrice(currentState.lowerBoundary)),
        tickAtSqrtPrice(sqrtPriceFromPrice(currentState.upperBoundary)),
        currentState.liquidity
          .multipliedBy(new BN(10).pow(new BN(18)))
          .toFixed(0)
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

  //useEffect(() => {
  //  console.log(ethersProvider.getCode());
  //}, [wallet]);

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
    if(!isAddress(createWidgetState.token0Address) && !isAddress(createWidgetState.token1Address)){
      error("Token 0 Address and Token 1 Address must be an ETH Address")
    }
    let [token0Address, token1Address] =
      safeBigInt(createWidgetState.token0Address) <
      safeBigInt(createWidgetState.token1Address)
        ? [createWidgetState.token0Address, createWidgetState.token1Address]
        : [createWidgetState.token1Address, createWidgetState.token0Address];

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
    let token0Symbol =
      token0Address == CONST.WBNB_ADDRESS ? "BNB" : await token0.symbol();
    let token1Symbol =
      token1Address == CONST.WBNB_ADDRESS ? "BNB" : await token1.symbol();

    let startTick = tickAtSqrtPrice(
      sqrtPriceFromPrice(createWidgetState.startPrice)
    );
    startTick = Math.round(startTick.toString() / 64) * 64;
    const startPrice = priceFromSqrtPrice(sqrtPriceFromTick(startTick));

    let newPosition = calcNewPosition(
      -887208,
      887208,
      tickAtSqrtPrice(sqrtPriceFromPrice(createWidgetState.startPrice)),
      BigInt(createWidgetState.initialAmount),
      sqrtPriceFromPrice(createWidgetState.startPrice)
    );
    let transactions = [];
    if (token0Address != CONST.WBNB_ADDRESS) {
      transactions.push({
        transaction: token0.approve,
        options: [routerContract.address, 10n ** 18n],
      });
    }
    if (token1Address != CONST.WBNB_ADDRESS) {
      transactions.push({
        transaction: token1.approve,
        options: [routerContract.address, 10n ** 18n],
      });
    }
    console.log(newPosition);
    let value = token0Address == CONST.WBNB_ADDRESS ? newPosition[0] : 0;
    value = token1Address == CONST.WBNB_ADDRESS ? newPosition[1] : value;

    transactions.push({
      transaction: routerContract.createPool,
      options: [token0Address, token1Address, startTick, { value: value*2n }],
    });

    let message = `<h3>Create New Pair:</h3> 
    <div style="background-color:white;border-radius:5px;text-align:end;padding:5px;">
    1 ${token0Symbol}  <br/> = ${startPrice} ${token1Symbol}
     </div>
     <p>Confirm transactions in your wallet</p>
     
     `;

    await transactionChain(message, transactions, getBlockData);
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

    let _tokens =
      safeBigInt(tokens["token0"].contract.address) <
      safeBigInt(tokens["token1"].contract.address)
        ? [tokens["token0"], tokens["token1"]]
        : [tokens["token1"], tokens["token0"]];

    let quote = await routerContract.addPositionView(
      _tokens[0].contract.address,
      _tokens[1].contract.address,
      Math.round(
        tickAtSqrtPrice(sqrtPriceFromPrice(lowerBoundary)).toString() / 64
      ) * 64,
      Math.round(
        tickAtSqrtPrice(sqrtPriceFromPrice(upperBoundary)).toString() / 64
      ) * 64,
      BN(liquidity)
        .multipliedBy(BN(10).pow(BN(18)))
        .toFixed(0)
    );

    console.log(quote.map((e) => e.toString()));
    let transactions = [];
    let value;
    //If token is not wbnb set allowance
    if (_tokens[1].contract.address != CONST.WBNB_ADDRESS) {
      transactions.push({
        transaction: checkAndSetAllowance,
        options: [
          _tokens[1].contract,
          wallet.accounts[0].address,
          routerContract.address,
          quote[0],
        ],
      });
    } else {
      value = quote[0];
    }
    if (_tokens[0].contract.address != CONST.WBNB_ADDRESS) {
      transactions.push({
        transaction: checkAndSetAllowance,
        options: [
          _tokens[0].contract,
          wallet.accounts[0].address,
          routerContract.address,
          quote[1],
        ],
      });
    } else {
      value = quote[1];
    }


    transactions.push({
      transaction: routerContract.addPosition,
      options: [
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
        { value: value },
      ],
    });
    let message = `<h3>Add Liquidity:</h3>
    <div style="background-color:white;border-radius:5px;text-align:end;padding:5px;">
      ${dynamicPrecisionDecimal(quote.token1Amount / 10 ** 18)} &nbsp; ${
      _tokens[0].symbol
    } <br/> ${dynamicPrecisionDecimal(quote.token0Amount / 10 ** 18)} &nbsp; ${
      _tokens[1].symbol
    } 
    <br/>
    Position active between:
    ${dynamicPrecisionDecimal( lowerBoundary)}
    ${dynamicPrecisionDecimal( upperBoundary)}

    </div>

    <p>Confirm transactions in your wallet</p>

    `;

    await transactionChain(message, transactions, getBlockData);
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
      [CONST.SWAP_ROUTER_ADDRESS, amount.toString()]
    );
  }

  //BEP-20
  async function approveAnonymousToken(contract, amount) {
    await transaction(
      `Approve ${BN(amount).dividedBy(BN(10).pow(18))}`,
      contract.approve,
      [CONST.SWAP_ROUTER_ADDRESS, amount.toString()]
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
          <div
            style={{
              width: "98%",
              maxWidth: 900,
              display: "flex",
              justifyContent: "end",
            }}
          >
          
  
          <br/>


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
            routerContract={routerContract}
          ></AddLpPositionComponent>
<div>
<Container
              style={{
                height: "fit-content",
              }}
            >
              <ContainerTitle>Pool</ContainerTitle>
              <PoolSelector
                provider={ethersProvider}
                onChange={(tokens) => {
                  console.log("PoolSelectro loaded");
                  setTokens(tokens);
                }}
                initialTokens={tokens}
              ></PoolSelector>
                        <Balances blockData={blockData} tokens={tokens}></Balances>

            </Container>
            <Container style={{ maxWidth: "96vw", width: 400,height:"fit-content" }}>
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
          <Container style={{ maxHeight: 500 }}>
            <ContainerTitle>Create New Pool</ContainerTitle>
            <div style={{ width: "80%", margin: "0 auto" }}>
              <LabeledInput
                name={"Token 0 Address"}
                value={createWidgetState.token0Address}
                onChange={(e) => {
                  let reg = /[^\w*]/g;
                  setCreateWidgetState({
                    ...createWidgetState,
                    token0Address: e.target.value.replaceAll(reg, ""),
                  });
                }}
              ></LabeledInput>
              <br></br>
              <LabeledInput
                name={"Token 1 Address"}
                value={createWidgetState.token1Address}
                onChange={(e) => {
                  let reg = /[^\w*]/g;
                  setCreateWidgetState({
                    ...createWidgetState,
                    token1Address: e.target.value.replaceAll(reg, ""),
                  });

                  console.log(e.target.value.replaceAll(reg, ""));
                }}
              ></LabeledInput>
            </div>
            <div
              style={{
                width: "80%",
                margin: "0 auto",
                display:
                  isAddress(createWidgetState.token0Address) &&
                  isAddress(createWidgetState.token1Address)
                    ? "block"
                    : "none",
              }}
            >
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
              <p>
                <b>
                  {currency(
                    _scaleDown(
                      calcNewPosition(
                        -887208,
                        887208,
                        tickAtSqrtPrice(
                          sqrtPriceFromPrice(createWidgetState.startPrice)
                        ),
                        BigInt(createWidgetState.initialAmount),
                        sqrtPriceFromPrice(createWidgetState.startPrice)
                      )[
                        safeBigInt(createWidgetState.token0Address) <
                        safeBigInt(createWidgetState.token1Address)
                          ? 0
                          : 1
                      ].toString()
                    )
                  )}
                </b>{" "}
                {safeBigInt(createWidgetState.token0Address) <
                safeBigInt(createWidgetState.token1Address)
                  ? addressFormat(createWidgetState.token0Address)
                  : addressFormat(createWidgetState.token1Address)}
              </p>
              <p>
                <b>
                  {currency(
                    _scaleDown(
                      calcNewPosition(
                        -887208,
                        887208,
                        tickAtSqrtPrice(
                          sqrtPriceFromPrice(createWidgetState.startPrice)
                        ),
                        BigInt(createWidgetState.initialAmount),
                        sqrtPriceFromPrice(createWidgetState.startPrice)
                      )[
                        safeBigInt(createWidgetState.token0Address) <
                        safeBigInt(createWidgetState.token1Address)
                          ? 1
                          : 0
                      ].toString()
                    )
                  )}
                </b>{" "}
                {safeBigInt(createWidgetState.token0Address) <
                safeBigInt(createWidgetState.token1Address)
                  ? addressFormat(createWidgetState.token1Address)
                  : addressFormat(createWidgetState.token0Address)}
              </p>
            </div>

            <LargeButton
            style={{padding:2}}
              onClick={async () => {
                createLiquidityPool();
              }}
            >
              <div style={{backgroundColor:tintedBackground,padding:10,borderRadius:4,color:"darkgray"}}>
              Open new Pool
              </div>
            </LargeButton>
          </Container>
        </div>
      )}
    </>
  );
}
