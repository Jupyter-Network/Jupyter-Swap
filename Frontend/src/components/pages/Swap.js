import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { ethers, utils } from "ethers";
import { useEffect, useState } from "react";
import { token0, router, token1, wbnb } from "../../contracts/addresses";
import erc20 from "../..//contracts/build/IERC20.json";
import BN from "bignumber.js";
import CurrencySelector from "../swap/CurrencySelector";
import * as quotes from "../../utils/quotes.js";
import { numericFormat, validate } from "../../utils/inputValidations";
import {
  Container,
  ContainerInverted,
  ContainerTitle,
  GradientDiv,
} from "../../theme";
import { Input } from "../../theme/inputs";
import {
  LargeButton,
  MediumButton,
  MediumButtonInverted,
  SmallButton,
} from "../../theme/buttons";
import { Label, P } from "../../theme/outputs";
import { transaction } from "../../utils/alerts";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import {
  background,
  backgroundGradient,
  highlight,
  primary,
  secondary,
} from "../../theme/theme";
import { getHistory, getTransanctionHistory } from "../../utils/requests";
import TransactionList from "../swap/TransactionList";
const erc20Abi = erc20.abi;
BN.config({ DECIMAL_PLACES: 18 });
//Add this to a Math file later
function _scaleDown(value) {
  return BN(value.toString()).div(BN(10).pow(18)).toString();
}

export default function Swap({ block, ethersProvider, routerContract }) {
  const [state, setState] = useState({
    token0Amount: new BN(0),
    token1Amount: new BN(0),
    token1AmountMin: new BN(0),
    impact: new BN(0),
    allowanceCheck: new BN(0),
    poolHop: false,
  });

  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
    disconnect, // function to call to with wallet<DisconnectOptions> to disconnect wallet
  ] = useConnectWallet();

  const [maxSlippage, setMaxSlippage] = useState(new BN(0.5));

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
            symbol: storage.token0.symbol,
            contract: new ethers.Contract(
              storage.token0.address,
              erc20Abi,
              ethersProvider.getSigner()
            ),
            icon: storage.token0.icon,
          },
          token1: {
            symbol: storage.token1.symbol,
            contract: new ethers.Contract(
              storage.token1.address,
              erc20Abi,
              ethersProvider.getSigner()
            ),
            icon: storage.token1.icon,
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

  function handleToken0AmountChange(value) {
    console.log("Token 0 Amount change Handler", "value:", value);
    value = validate(value);
    if (blockData.poolBalances[1].toString()) {
      if (state.poolHop) {
        setState(quotes.token0ToToken1(blockData, maxSlippage, value));
        return;
      }

      setState({
        ...quotes.ETHToToken(blockData, maxSlippage, value),
        poolHop: state.poolHop,
      });
    }
  }

  function handleToken1AmountChange(value) {
    console.log("Token 1 Amount change Handler:", "value:", value);
    value = validate(value);
    if (state.poolHop) {
      setState(quotes.token1ToToken0(blockData, maxSlippage, value));
      return;
    }
    setState(quotes.TokenToETH(blockData, maxSlippage, value));
  }

  //New Block
  useEffect(() => {
    async function asyncRun() {
      console.log("Block changed in swap");
      await getBlockData();
      //If pools changed -> recalculate
      handleToken0AmountChange(state.token0Amount.toString());
      if (storage.token0.address !== wbnb && storage.token1.address !== wbnb) {
        setState({ ...state, poolHop: true });
      }
    }
    asyncRun();
  }, [block, tokens]);

  //newBlockData
  useEffect(() => {
    handleToken0AmountChange(state.token0Amount);
  }, [blockData]);

  useEffect(() => {
    getBlockData();
    setTokens(
      storage
        ? {
            token0: {
              symbol: storage.token0.symbol,
              contract: new ethers.Contract(
                storage.token0.address,
                erc20Abi,
                ethersProvider.getSigner()
              ),
              icon: storage.token0.icon,
            },
            token1: {
              symbol: storage.token1.symbol,
              contract: new ethers.Contract(
                storage.token1.address,
                erc20Abi,
                ethersProvider.getSigner()
              ),
              icon: storage.token1.icon,
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
        { value: value },
      ]
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
      ]
    );

    setState({
      ...state,
      token0Amount: BN(0),
      token1Amount: BN(0),
      token1AmountMin: BN(0),
    });
  }
  async function swapTokens() {
    await transaction(
      `Swap ${new BN(state.token0Amount).toFixed(6)} ${
        tokens["token0"].symbol
      } to ${BN(state.token1Amount).toFixed(6)} ${tokens["token1"].symbol}`,
      routerContract.swapTokens,
      [
        tokens["token0"].contract.address,
        tokens["token1"].contract.address,
        new BN(state.token0Amount).multipliedBy(new BN(10).pow(18)).toFixed(0),
        state.token1AmountMin.toFixed(0),
      ]
    );

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
      router,
      amount,
    ]);
  }

  async function getBlockData() {
    let p0Rate = BN(10).pow(18);
    let t0Balance = 0;
    if (tokens["token0"].contract.address === wbnb) {
      t0Balance = wallet
        ? await ethersProvider.getBalance(wallet.accounts[0].address)
        : 0;
      p0Rate = p0Rate.dividedBy(
        BN(
          (
            await routerContract.getRate(tokens["token1"].contract.address)
          ).toString()
        )
      );
    } else {
      t0Balance = wallet
        ? await tokens["token0"].contract.balanceOf(wallet.accounts[0].address)
        : 0;
      p0Rate = BN(
        (
          await routerContract.getRate(tokens["token0"].contract.address)
        ).toString()
      ).dividedBy(BN(10).pow(18));
    }

    let t1Balance = 0;
    let p1Rate = BN(BN(10).pow(18));

    if (tokens["token1"].contract.address === wbnb) {
      t1Balance = wallet
        ? await ethersProvider.getBalance(wallet.accounts[0].address)
        : 0;
    } else {
      t1Balance = wallet
        ? await tokens["token1"].contract.balanceOf(wallet.accounts[0].address)
        : 0;
      p1Rate = BN(
        (
          await routerContract.getRate(tokens["token1"].contract.address)
        ).toString()
      ).dividedBy(BN(10).pow(18));
    }

    let priceHistory = [];
    let poolBalances = null;
    let transactions = [];
    if (tokens["token1"].contract.address !== wbnb) {
      poolBalances = await routerContract.getPoolBalances(
        tokens["token1"].contract.address
      );
      transactions = (
        await getTransanctionHistory(tokens["token1"].contract.address)
      ).data;
    } else {
      poolBalances = [BN(0), BN(0)];
      priceHistory = (
        await getHistory(tokens["token0"].contract.address)
      ).data.map((item, index) => {
        return {
          rate: BN(item.rate).toString(),
          time: item.bucket,
        };
      });
    }

    let pool1Balances = null;

    if (tokens["token0"].contract.address !== wbnb) {
      pool1Balances = await routerContract.getPoolBalances(
        tokens["token0"].contract.address
      );
      transactions = [
        ...transactions,
        ...(await getTransanctionHistory(tokens["token0"].contract.address))
          .data,
      ];
    } else {
      pool1Balances = [new BN(0), new BN(0)];
      priceHistory = (
        await getHistory(tokens["token1"].contract.address)
      ).data.map((item, index) => {
        return {
          rate: BN(10).pow(36).dividedBy(BN(item.rate)).toString(),
          time: item.bucket,
        };
      });
    }

    if (priceHistory.length === 0) {
      let p0 = await getHistory(tokens["token0"].contract.address);
      let p1 = await getHistory(tokens["token1"].contract.address);

      priceHistory = p0.data.map((item, index) => {
        return {
          rate: BN(item.rate)
            .dividedBy(BN(p1.data[index].rate).dividedBy(BN(10).pow(18)))

            .toString(),
          time: item.bucket,
        };
      });
    }

    const token0Allowance = wallet
      ? await tokens["token0"].contract.allowance(
          wallet.accounts[0].address,
          router
        )
      : 0;

    const token1Allowance = wallet
      ? await tokens["token1"].contract.allowance(
          wallet.accounts[0].address,
          router
        )
      : 0;
    setBlockData({
      token0Balance: _scaleDown(t0Balance),
      token1Balance: _scaleDown(t1Balance),
      poolBalances: await poolBalances,
      pool1Balances: await pool1Balances,
      token0Allowance: _scaleDown(token0Allowance),
      token1Allowance: _scaleDown(token1Allowance),
      p0Rate: p0Rate,
      p1Rate: p1Rate,
      priceHistory: priceHistory.reverse(),
      transactionHistory: transactions,
    });
    handleToken0AmountChange(state.token0Amount);
  }

  let d = [];
  if (blockData.priceHistory) {
    d = blockData.priceHistory;
  }

  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
    >
      <Container style={{ width: "100vw", maxWidth: "800px" }}>
        <ContainerTitle>Chart</ContainerTitle>
        {blockData.priceHistory ? (
          <div>
            <Line
              height={200}
              options={{
                tension: 0.3,
                scales: {
                  x: {
                    ticks: {
                      color: primary,
                    },
                  },
                  y: {
                    ticks: {
                      color: primary,
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
              data={{
                labels: blockData.priceHistory.map((item) => {
                  const date = new Date(item.time);
                  return `${date.getHours()}:${date.getMinutes()}`;
                }),
                datasets: [
                  {
                    fill: false,
                    pointBorderColor: secondary,
                    label:
                      tokens["token0"].symbol + " / " + tokens["token1"].symbol,
                    backgroundColor: background,
                    borderColor: primary,
                    data: blockData.priceHistory.map((item) =>
                      BN(item.rate).dividedBy(BN(10).pow(18)).toString()
                    ),
                  },
                ],
              }}
            ></Line>
          </div>
        ) : (
          <p></p>
        )}
      </Container>
      <Container>
        <div style={{ borderRadius: 7, overflow: "hidden" }}>
          <ContainerTitle>
            {tokens["token0"].symbol} / {tokens["token1"].symbol}
          </ContainerTitle>
          <p
            style={{
              margin: 25,
              textAlign: "end",
              fontSize: "small",
              marginBottom: -4,
            }}
          >
            Balance : {numericFormat(BN(blockData.token0Balance))}
          </p>
          <div style={{ display: "flex", flexWrap: "nowrap" }}>
            <SmallButton
              style={{ marginLeft: 10, marginRight: 2 }}
              onClick={() =>
                handleToken0AmountChange(blockData.token0Balance - 0.002)
              }
            >
              Max.
            </SmallButton>
            <Input
              pattern="\d*"
              onFocus={() => handleToken0AmountChange("")}
              onChange={(e) => handleToken0AmountChange(e.target.value)}
              value={state.token0Amount.toString()}
            ></Input>
            <Label>
              <b>{tokens["token0"].symbol}</b>
            </Label>
          </div>

          <br />
          <p
            style={{
              margin: 25,
              textAlign: "end",
              fontSize: "small",
              marginBottom: -4,
            }}
          >
            {" "}
            Balance : {numericFormat(BN(blockData.token1Balance))}
          </p>

          <Input
            pattern="\d*"
            onFocus={() => handleToken1AmountChange("")}
            onChange={(e) => handleToken1AmountChange(e.target.value)}
            value={state.token1Amount.toString()}
          ></Input>

          <Label>
            <b>{tokens["token1"].symbol}</b>
          </Label>

          <p></p>
          <CurrencySelector
            provider={ethersProvider}
            initialToken={tokens}
            onChange={(tokens, poolHop) => {
              setState({ ...state, poolHop: poolHop });
              setTokens(tokens);
            }}
          ></CurrencySelector>
          <br />
          <p>
            Price: &nbsp;
            {state.poolHop ? "true" : "false"}
            {state.poolHop ? (
              <P>
                {numericFormat(
                  BN(blockData.p0Rate.toString())
                    .dividedBy(BN(blockData.p1Rate.toString()))
                    .toString()
                )}
              </P>
            ) : (
              <P>{numericFormat(BN(blockData.p0Rate).toString())}</P>
            )}
          </p>

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
              if (tokens["token0"].contract.address === wbnb) {
                swapETHToToken();
              } else {
                swapTokenToETH();
              }
            }}
          >
            Swap <br />
            {tokens["token0"].symbol} to {tokens["token1"].symbol}
          </LargeButton>
          <ContainerInverted>
            <p style={{ fontSize: "small" }}>
              You will receive min.{" "}
              <span style={{ color: primary }}>
                {" "}
                {numericFormat(
                  state.token1AmountMin.dividedBy(BN(10).pow(18)).toFixed(18),
                  6
                )}{" "}
                {tokens["token1"].symbol}
              </span>
            </p>
            <p style={{ fontSize: "small" }}>
              Price Impact:{" "}
              <span style={{ color: primary }}>{state.impact.toString()}%</span>
            </p>
          </ContainerInverted>
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
                      ethers.constants.MaxUint256
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
                      ethers.constants.MaxUint256
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
        </div>
      </Container>
      <div style={{ width: "100vw" }}>
        <Container style={{ maxWidth: 1210, width: "98%", margin: "0 auto" }}>
          <ContainerTitle>Recent Transactions</ContainerTitle>
          <div style={{ maxHeight: 500, marginTop: -18, overflowY: "scroll" }}>
            <TransactionList
              transactions={blockData.transactionHistory}
            ></TransactionList>
          </div>
        </Container>
      </div>
    </div>
  );
}
