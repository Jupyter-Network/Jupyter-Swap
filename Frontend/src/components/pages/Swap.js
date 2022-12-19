import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import CONST from "../../CONST.json"
import erc20 from "../..//contracts/build/IERC20.json";
import BN from "bignumber.js";
import CurrencySelector from "../swap/CurrencySelector";
import * as quotes from "../../utils/quotes.js";
import {
  currency,
  currencyFormat,
  dynamicPrecisionDecimal,
  numericFormat,
  validate,
} from "../../utils/inputValidations";
import {
  Container,
  ContainerInverted,
  ContainerTitle,
  GradientDiv,
} from "../../theme";
import { Input } from "../../theme/inputs";
import {
  LargeButton,
  MediumButtonInverted,
  SmallButton,
} from "../../theme/buttons";
import { P } from "../../theme/outputs";
import { error, transaction, transactionChain } from "../../utils/alerts";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import {
  background,
  highlight,
  highlightGradient,
  primary,
  secondary,
  tintedBackground,
} from "../../theme/theme";
import { getHistory, getTransanctionHistory } from "../../utils/requests";
import TransactionList from "../swap/TransactionList";
import MaxSlippageSelector from "../swap/MaxSlippageSelector";
import TransactionTimeoutSelector from "../swap/TransactionTimeoutSelector";
import LabeledInput from "../LabeledInput";
import TokenInfo from "../swap/TokenInfo";
import { initTokens } from "../../initialValues";
import LoadingSpinner from "../LoadingSpinner";
import { checkAndSetAllowance, _scaleDown } from "../../utils/mathHelper";
import { fetchBlockData, fetchBlockDataNew } from "../swap/blockData";
import Chart from "../swap/Chart";
import LightChart from "../swap/LightChart";

const erc20Abi = erc20.abi;
BN.config({ DECIMAL_PLACES: 18 });

export default function Swap({ block, ethersProvider, routerContract }) {
  const [state, setState] = useState({
    token0Amount: new BN(0),
    token1Amount: new BN(0),
    token0Loading:false,
    token1Loading:false,
    token1AmountMin: new BN(0),
    impact: new BN(0),
    allowanceCheck: new BN(0),
    poolHop: false,
  });

  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
    disconnect, // function to call to with wallet<DisconnectOptions> to disconnect wallet
  ] = useConnectWallet();

  const [maxSlippage, setMaxSlippage] = useState(new BN(0.5));
  const [timeout, setTimeoutTime] = useState(900000);

  const [timeBucket, setTimeBucket] = useState(15);

  const [blockData, setBlockData] = useState({
    poolBalances: [new BN(0), new BN(0)],
    pool1Balances: [new BN(0), new BN(0)],
    token0Balance: BN(0),
  });
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

  function deadline() {
    return Date.now() + timeout / 1000;
  }
  //TODO: Change this two methods, instead of calculating quotes in js get quote from contract
  async function handleToken0AmountChange(value) {
    setState({...state,token1Loading:true,token0Amount :value})
    let token0 = BigInt(tokens["token0"].contract.address);
    let token1 = BigInt(tokens["token1"].contract.address);
    let quote;
    console.log(      tokens["token0"].contract.address,
    tokens["token1"].contract.address,
    BigInt(value * 10 ** 18),
    -640000,
    true);
    try{
      if (token0 > token1) {
        quote = await routerContract.swapQuote(
          tokens["token0"].contract.address,
          tokens["token1"].contract.address,
          BigInt(value * 10 ** 18),
          887272,
          true
        );
      } else {
        quote = await routerContract.swapQuote(
          tokens["token0"].contract.address,
          tokens["token1"].contract.address,
          BigInt(value * 10 ** 18),
          -887272,
          true
        );
      }
    }catch {
      error("Swap will fail probably of too low liquidity")
    }

    console.log("Quote:", quote.amountIn, value * 10 ** 18);
    //if (quote.amountIn != value * 10 ** 18) {
    //  error("Liquidity is too low for this trade");
    //  return;
    //}
    setState({ ...state, token1Amount: quote.amountOut / 10 ** 18 ,token1Loading:false});
  }
  async function handleToken1AmountChange(value) {
    setState({...state,token0Loading:true,token1Amount :value})

    let token0 = BigInt(tokens["token0"].contract.address);
    let token1 = BigInt(tokens["token1"].contract.address);
    let quote;
    console.log(token0 < token1);
    if (token0 > token1) {
      console.log("T0 < T1");
      quote = await routerContract.swapQuote(
        tokens["token0"].contract.address,
        tokens["token1"].contract.address,
        BigInt(value * 10 ** 18),
        887272,
        false
      );
    } else {
      console.log("T0 >= T1");
      quote = await routerContract.swapQuote(
        tokens["token0"].contract.address,
        tokens["token1"].contract.address,
        BigInt(value * 10 ** 18),
        -887272,
        false
      );
    }
    console.log(
      quote.amountOut.toString(),
      value * 10 ** 18,
      quote.amountIn.toString()
    );

    //if(quote.amountOut != value*10**18){
    //  error("Liquidity is too low for this trade");
    //  return;
    //}
    setState({ ...state, token0Amount: quote.amountIn / 10 ** 18,token0Loading:false });
  }

  //New Block
  useEffect(() => {
    async function asyncRun() {
      console.log("Block changed in swap");
      await getBlockData();
      //If pools changed -> recalculate
      handleToken0AmountChange(state.token0Amount.toString());
      if (
        storage.token0 &&
        storage.token0.address !== CONST.WBNB_ADDRESS &&
        storage.token1.address !== CONST.WBNB_ADDRESS
      ) {
        setState({ ...state, poolHop: true });
      }
    }
    if (!loading || firstLoad) {
      asyncRun();
    }
  }, [block, tokens, maxSlippage, timeBucket]);

  //newBlockData
  useEffect(() => {
    handleToken0AmountChange(state.token0Amount);
  }, [blockData]);

  useEffect(() => {
    setTokens(
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
        : {
            token0: {
              symbol: "ARM",
              contract: new ethers.Contract(
                CONST.TOKEN0_ADDRESS,
                erc20Abi,
                ethersProvider.getSigner()
              ),
              icon: "/placeholder.svg",
              address: CONST.TOKEN0_ADDRESS,
            },
            token1: {
              symbol: "BNB",
              contract: new ethers.Contract(
                CONST.TOKEN1_ADDRESS,
                erc20Abi,
                ethersProvider.getSigner()
              ),
              icon: "/placeholder.svg",
              address: CONST.TOKEN1_ADDRESS
            },
          }
    );
  }, [wallet]);

  //Router
  async function swapETHToToken() {
    const value = new BN(state.token0Amount)
      .multipliedBy(new BN(10).pow(18))
      .toFixed(0);
    await transaction(
      `Swap ${BN(value).dividedBy(BN(10).pow(18))} ${
        tokens["token0"].symbol
      } to ${state.token1Amount.toFixed(6)} ${tokens["token1"].symbol}`,
      routerContract.swapETHToToken,
      [
        tokens["token1"].contract.address,
        state.token1AmountMin.toFixed(0),
        deadline(),
        { value: value },
      ],
      getBlockData
    );
    setState({
      ...state,
      token0Amount: BN(0),
      token1Amount: BN(0),
      token1AmountMin: BN(0),
    });
  }
  async function swapTokenToETH() {
    await transaction(
      `Swap ${new BN(state.token0Amount).toFixed(6)} ${
        tokens["token0"].symbol
      } to ${state.token1Amount.toFixed(6)} ${tokens["token1"].symbol}`,
      await routerContract.swapTokenToETH,
      [
        tokens["token0"].contract.address,
        new BN(state.token0Amount).multipliedBy(new BN(10).pow(18)).toFixed(0),
        state.token1AmountMin.toFixed(0),
        deadline(),
      ],
      getBlockData
    );

    setState({
      ...state,
      token0Amount: BN(0),
      token1Amount: BN(0),
      token1AmountMin: BN(0),
    });
  }
  async function swapTokens() {
    //console.log(       "sWAP: ", tokens["token0"].contract.address,
    //tokens["token1"].contract.address,
    //BigInt(Math.round(state.token0Amount * 10 ** 18)).toString(),
    //BigInt(tokens["token0"].contract.address) > BigInt(tokens["token1"].contract.address)
    //  ? 887272
    //  : -887272,
    //  BigInt(Math.round(state.token1Amount* (1-maxSlippage/100).toString() * 10 ** 18)).toString(),
    //  (1-maxSlippage/100).toString()
    //  );

    let transactions = [
      {
        transaction: checkAndSetAllowance,
        options: [
          tokens["token0"].contract,
          wallet.accounts[0].address,
          routerContract.address,
          BigInt(state.token0Amount*10**18),
        ],
      },
      {
        transaction: routerContract.swap,
        options: [
          tokens["token0"].contract.address,
          tokens["token1"].contract.address,
          BigInt(Math.round(state.token0Amount * 10 ** 18)).toString(),
          BigInt(tokens["token0"].contract.address) >
          BigInt(tokens["token1"].contract.address)
            ? 887272
            : -887272,
          BigInt(
            Math.round(state.token1Amount * (1 - maxSlippage / 100) * 10 ** 18)
          ).toString(),
        ],
      },
    ];
    let message = `<h3>Swap:</h3> 
    <div style="background-color:rgba(255,255,255,0.3);border-radius:5px;text-align:end;padding:7px;">
     ${new BN(state.token0Amount).toFixed(6)} ${
      tokens["token0"].symbol
    } <br/> to ${BN(state.token1Amount).toFixed(6)} ${tokens["token1"].symbol} </div>`;


    await transactionChain(
     message,
      transactions,
      getBlockData
    );
    /*
    await transaction(
      `Swap ${new BN(state.token0Amount).toFixed(6)} ${
        tokens["token0"].symbol
      } to ${BN(state.token1Amount).toFixed(6)} ${tokens["token1"].symbol}`,
      routerContract.swap,
      [
        tokens["token0"].contract.address,
        tokens["token1"].contract.address,
        BigInt(Math.round(state.token0Amount * 10 ** 18)).toString(),
        BigInt(tokens["token0"].contract.address) >
        BigInt(tokens["token1"].contract.address)
          ? 887272
          : -887272,
        BigInt(
          Math.round(state.token1Amount * (1 - maxSlippage / 100) * 10 ** 18)
        ).toString(),
      ],
      getBlockData
    );
*/
    setState({
      ...state,
      token0Amount: BN(0),
      token1Amount: BN(0),
      token1AmountMin: BN(0),
    });
  }

  //ERC20
  async function approveToken(contract, amount) {
    const symbol =
      contract.address === tokens["token0"].contract.address
        ? tokens["token0"].symbol
        : tokens["token1"].symbol;
    const tokenContract =
      contract.address === tokens["token0"].contract.address
        ? tokens["token0"].contract
        : tokens["token1"].contract;
    console.log(ethersProvider);
    await transaction(`Approve ${symbol}`, tokenContract.approve, [
      CONST.SWAP_ROUTER_ADDRESS,
      amount,
    ]);
  }

  async function getBlockData(loaderVisible = true) {
    console.log(tokens);
    setFirstLoad(false);
    if (loaderVisible) {
      setLoading(true);
    }
    setBlockData(
      await fetchBlockDataNew({
        tokens,
        wallet,
        ethersProvider,
        routerContract,
        timeBucket,
      })
    );
    //handleToken0AmountChange(state.token0Amount);
    setLoading(false);
  }

  let d = [];
  if (blockData.priceHistory) {
    d = blockData.priceHistory;
  }

  return (
    <>
      {loading || firstLoad ? <LoadingSpinner></LoadingSpinner> : <></>}
      <div
        style={{
          visibility: loading ? "hidden" : "visible",
          display: loading ? "none" : "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <LightChart
          blockData={blockData}
          onBucketChange={(bucket) => {
            setTimeBucket(bucket);
          }}
        ></LightChart>

        <Container>
          <div style={{ borderRadius: 7, overflow: "hidden",height:"fit-content" }}>
            <ContainerTitle>
              {tokens["token0"].symbol} / {tokens["token1"].symbol}
            </ContainerTitle>
            <table style={{ width: "90%", margin: "0 auto" }}>
              <tbody>
                <tr>
                  <td colspan={1}>
                    <SmallButton
                      style={{
                        marginLeft: 10,
                        marginRight: -10,
                        marginTop: 32,
                      }}
                      onClick={() => {
                        console.log(blockData.token0Balance);
                        handleToken0AmountChange(
                          blockData.token0Balance
                        );
                      }}
                    >
                      Max
                    </SmallButton>
                  </td>
                  <td colspan={4}>
                    <LabeledInput
                      title={`Sell Amount`}
                      name={tokens["token0"].symbol}
                      onChange={(e) =>
                        setState({ ...state, token0Amount: e.target.value })
                      }
                      //onFocus={() => handleToken0AmountChange("")}
                      onBlur={(e) => handleToken0AmountChange(e.target.value)}
                      value={
                        state.token0Amount.toFixed
                          ? dynamicPrecisionDecimal(state.token0Amount)
                          : state.token0Amount
                      }
                      icon={tokens["token0"].icon}
                      info={`Bal: ${currency(blockData.token0Balance)}`}
                      loading={state.token0Loading}

                    ></LabeledInput>
                  </td>
                </tr>
                <tr>
                  <td colSpan={1}></td>
                  <td colSpan={5}>
                    <LabeledInput
                      title={`Buy Amount`}
                      name={tokens["token1"].symbol}
                      onChange={(e) =>
                        setState({ ...state, token1Amount: e.target.value })
                      }
                      //onFocus={() => handleToken1AmountChange("")}
                      onBlur={(e) => handleToken1AmountChange(e.target.value)}
                      value={
                        state.token1Amount.toFixed
                          ? dynamicPrecisionDecimal(state.token1Amount)
                          : state.token1Amount
                      }
                      icon={tokens["token1"].icon}
                      info={`Bal: ${currency(blockData.token1Balance)}`}
                      loading={state.token1Loading}
                    ></LabeledInput>
                  </td>
                </tr>
              </tbody>
            </table>

            <p></p>

            <p
              style={{
                backgroundColor: tintedBackground,
                width: "50%",
                margin: "5px auto",
                padding: 10,
                borderRadius: 10,
              }}
            >
              Price: &nbsp;
              {blockData.price ? (
                <P>{currency(blockData.price.toString())}</P>
              ) : (
                <P>{0}</P>
              )}
            </p>
            <br/>
            <CurrencySelector
              provider={ethersProvider}
              initialToken={tokens}
              onChange={async (tokens, poolHop) => {
                setState({ ...state, poolHop: poolHop });
                setTokens(tokens);
              }}
            ></CurrencySelector>
            <LargeButton
              style={{ width: "70%" }}
              onClick={async () => {
                if (!wallet) {
                  await connect();
                  return;
                }
                if (state.poolHop) {
                  swapTokens();
                  return;
                }
                if (tokens["token0"].contract.address === CONST.WBNB_ADDRESS) {
                  swapETHToToken();
                } else {
                  swapTokenToETH();
                }
              }}
            >
              Swap <br />
              {tokens["token0"].symbol} to {tokens["token1"].symbol}
            </LargeButton>
            <ContainerInverted
              style={{
                backgroundColor: tintedBackground,
                margin: "5px auto",
                padding: "3px 10px",
                borderRadius: 10,
                marginBottom: 2,
              }}
            >
              <p style={{ fontSize: "small" }}>
                You will receive min.{" "}
                <span style={{ color: primary }}>
                  {" "}
                  {dynamicPrecisionDecimal(
                    state.token1Amount * (1 - maxSlippage / 100)
                  )}{" "}
                  {tokens["token1"].symbol}
                </span>
              </p>
              <p style={{ fontSize: "small" }}>
                Price Impact:{" "}
                <span style={{ color: primary }}>
                  {BigInt(tokens.token0.contract.address) >
                  BigInt(tokens.token1.contract.address)
                    ? dynamicPrecisionDecimal((
                        1 -
                          state.token1Amount /
                            ((state.token0Amount * 0.998) / blockData.price)
                      ) * 100)
                    : dynamicPrecisionDecimal(
                        100 -
                          (state.token1Amount /
                            (state.token0Amount * 0.998 * blockData.price)) *
                            100
                      )}
                  %
                </span>
              </p>
            </ContainerInverted>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 10,
                marginBottom: 12,
              }}
            >
              <MaxSlippageSelector
                maxSlippage={0.5}
                setMaxSlippage={setMaxSlippage}
              ></MaxSlippageSelector>
              <TransactionTimeoutSelector
                initTimeout={timeout}
                setTime={setTimeoutTime}
              ></TransactionTimeoutSelector>
            </div>
   
          </div>
        </Container>
        <div style={{ width: "100vw" }}>
          <TokenInfo tokens={tokens}></TokenInfo>
          <Container style={{ maxWidth: 1180, width: "98%", margin: "0 auto" }}>
            <ContainerTitle>Recent Transactions</ContainerTitle>
            <div
              style={{ maxHeight: 500, marginTop: -18, overflowY: "scroll" }}
            >
              <TransactionList
                transactions={blockData.transactionHistory}
                tokens={tokens}
              ></TransactionList>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}
