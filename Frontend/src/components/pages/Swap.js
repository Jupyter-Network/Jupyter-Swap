import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { ethers, utils } from "ethers";
import { useEffect, useState } from "react";
import { token0, router, token1, wbnb } from "../../contracts/addresses";
import erc20Abi from "../..//contracts/build/IERC20Metadata.json";
import routerAbi from "../../contracts/build/JupyterRouterV1.json";
import BN from "bignumber.js";
import CurrencySelector from "../swap/CurrencySelector";
import * as quotes from "../../quotes.js";
import { numericFormat, validate } from "../../utils/inputValidations";
import { Container, ContainerTitle } from "../../theme";
import { Input } from "../../theme/inputs";
import { LargeButton, MediumButton, SmallButton } from "../../theme/buttons";
import { Label, P } from "../../theme/outputs";
import { transaction } from "../../utils/alerts";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { background, highlight, primary, secondary } from "../../theme/theme";
import { getHistory, getTransanctionHistory } from "../../utils/requests";
import TransactionList from "../swap/TransactionList";
BN.config({ DECIMAL_PLACES: 18 });
//Add this to a Math file later
function _scaleDown(value) {
  return BN(value.toString()).div(BN(10).pow(18)).toString();
}

export default function Swap({ block }) {
  const connectedWallets = useWallets();
  const [state, setState] = useState({
    token0Amount: new BN(0),
    token1Amount: new BN(0),
    token1AmountMin: new BN(0),
    impact: new BN(0),
    allowanceCheck: new BN(0),
    poolHop: false,
  });

  const [maxSlippage, setMaxSlippage] = useState(new BN(0.5));

  const [blockData, setBlockData] = useState({
    poolBalances: [new BN(0), new BN(0)],
    pool1Balances: [new BN(0), new BN(0)],
  });
  let ethersProvider;
  let routerContract;
  //Init contracts
  if (connectedWallets.length > 0) {
    ethersProvider = new ethers.providers.Web3Provider(
      connectedWallets[0].provider
    );

    routerContract = new ethers.Contract(
      router,
      routerAbi,
      ethersProvider.getSigner()
    );
  }

  const [tokens, setTokens] = useState({
    token0: {
      symbol: "MRC",
      contract: new ethers.Contract(
        token0,
        erc20Abi,
        ethersProvider.getSigner()
      ),
    },
    token1: {
      symbol: "ARM",
      contract: new ethers.Contract(
        token1,
        erc20Abi,
        ethersProvider.getSigner()
      ),
    },
  });

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
    }
    asyncRun();
  }, [block, tokens]);

  //Router
  async function addLiquidity(token0Amount) {
    await routerContract.addLiquidity(
      tokens["token1"].contract.address,
      token0Amount,
      token0Amount
    );
  }
  async function removeLiquidity() {
    await routerContract.removeLiquidity(tokens["token1"].contract.address);
  }
  async function getToken1AmountFromToken0Amount(amount) {
    return await routerContract.getToken1AmountFromToken0Amount(
      tokens["token1"].contract.address,
      amount
    );
  }
  async function swapETHToToken() {
    const value = new BN(state.token0Amount)
      .multipliedBy(new BN(10).pow(18))
      .toFixed(0);
    await transaction(
      `Swap ${BN(value).dividedBy(BN(10).pow(18)).toFixed(6)} ${
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
    await transaction(
      `Approve ${BN(amount).dividedBy(BN(10).pow(18))} ${symbol}`,
      contract.approve,
      [router, amount]
    );
  }

  async function getBlockData() {
    let p0Rate = BN(10).pow(18);

    let t0Balance = 0;

    if (tokens["token0"].contract.address === wbnb) {
      t0Balance = await ethersProvider.getBalance(
        connectedWallets[0].accounts[0].address
      );
      p0Rate = p0Rate.dividedBy(
        BN(
          (
            await routerContract.getRate(tokens["token1"].contract.address)
          ).toString()
        )
      );
    } else {
      t0Balance = await tokens["token0"].contract.balanceOf(
        connectedWallets[0].accounts[0].address
      );
      p0Rate = BN(
        (
          await routerContract.getRate(tokens["token0"].contract.address)
        ).toString()
      ).dividedBy(BN(10).pow(18));
    }

    let t1Balance = 0;
    let p1Rate = BN(BN(10).pow(18));

    if (tokens["token1"].contract.address === wbnb) {
      t1Balance = await ethersProvider.getBalance(
        connectedWallets[0].accounts[0].address
      );
    } else {
      t1Balance = await tokens["token1"].contract.balanceOf(
        connectedWallets[0].accounts[0].address
      );
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
      poolBalances = [0, 0];
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
      pool1Balances = [0, 0];
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

    const token0Allowance = await tokens["token0"].contract.allowance(
      connectedWallets[0].accounts[0].address,
      router
    );

    const token1Allowance = await tokens["token1"].contract.allowance(
      connectedWallets[0].accounts[0].address,
      router
    );
    console.log(transactions);
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
  }

  let d = [];
  let labels = [];
  let data = [];
  if (blockData.priceHistory) {
    d = blockData.priceHistory;
    console.log(blockData.priceHistory);
    labels = blockData.priceHistory.map((item) => {
      const date = new Date(item.bucket);
      return `${date.getHours()}`;
    });
    data = d.map((item) => BN(item.rate).dividedBy(BN(10).pow(18)).toString());
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
                //Boolean - Whether the line is curved between points
                tension: 0.3,
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
          Balance : {BN(blockData.token0Balance).toFixed(3)}{" "}
          {tokens["token0"].symbol}
        </p>
        <Input
          onChange={(e) => handleToken0AmountChange(e.target.value)}
          value={state.token0Amount.toString()}
        ></Input>
        <Label>
          <b>{tokens["token0"].symbol}</b>
        </Label>

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
          Balance : {BN(blockData.token1Balance).toFixed(3)}{" "}
          {tokens["token1"].symbol}
        </p>
        <Input
          onChange={(e) => handleToken1AmountChange(e.target.value)}
          value={numericFormat(BN(state.token1Amount.toFixed(18)).toFixed(18))}
        ></Input>
        <Label>
          <b>{tokens["token1"].symbol}</b>
        </Label>
        <CurrencySelector
          provider={ethersProvider}
          onChange={(tokens, poolHop) => {
            setState({ ...state, poolHop: poolHop });
            setTokens(tokens);

            //handleCurrencyChange(e);
            //getBlockData();
          }}
        ></CurrencySelector>
        <br />
        <p>
          Price: &nbsp;
          {state.poolHop ? (
            <P>
              {numericFormat(
                BN(blockData.p0Rate.toString())
                  .dividedBy(BN(blockData.p1Rate.toString()))
                  .toFixed(18)
              )}
            </P>
          ) : (
            <P>{numericFormat(BN(blockData.p0Rate).toFixed(18))}</P>
          )}
        </p>
        <p style={{ marginLeft: 70, textAlign: "start", fontSize: "small" }}>
          You will receive min.{" "}
          {numericFormat(
            state.token1AmountMin.dividedBy(BN(10).pow(18)).toFixed(18)
          )}{" "}
          {tokens["token1"].symbol}
        </p>
        <p style={{ marginLeft: 70, textAlign: "start" }}>
          Price Impact: {state.impact.toString()}
        </p>
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <div style={{ width: "30%", height: "100%" }}>
            {tokens["token0"].contract.address === wbnb ? (
              <span></span>
            ) : (
              <MediumButton
                onClick={() => {
                  approveToken(
                    tokens["token0"].contract,
                    "100000000000000000000000"
                  );
                }}
              >
                Approve {tokens["token0"].symbol}
              </MediumButton>
            )}
            {tokens["token1"].contract.address === wbnb ? (
              <span></span>
            ) : (
              <MediumButton
                onClick={() => {
                  approveToken(
                    tokens["token1"].contract,
                    "100000000000000000000000"
                  );
                }}
              >
                Approve {tokens["token1"].symbol}
              </MediumButton>
            )}
          </div>
          <LargeButton
            style={{ height: 106 }}
            onClick={async () => {
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
        </div>
        <p>{state.poolHop ? "true" : "false"}</p>
      </Container>
      <div style={{width:"100vw"}}>
      <Container style={{height:500,maxWidth:"100%",width:"98%",margin:"0 auto" }}>
        <ContainerTitle>Recent Transactions</ContainerTitle>
            <div style={{height:500,position:"relative",top:-18,overflowY:"scroll","&::-webkit-scrollbar": { width: 100, } }}>
            <TransactionList 
          transactions={blockData.transactionHistory}
        ></TransactionList>
            </div>

      </Container>
      </div>
    </div>
  );
}
