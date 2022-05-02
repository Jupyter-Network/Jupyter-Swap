import { useEffect, useState } from "react";

import { EasyContainer, Title } from ".";
import { Button, Input, InteractionContainer } from "./elements";
import NumericInput from "./NumericInput";
import BN from "bignumber.js";
import {
  useCalls,
  useContractFunction,
  useEthers,
  useSendTransaction,
} from "@usedapp/core";

import { Contract } from "@ethersproject/contracts";
import { abis, addresses } from "@my-app/contracts";
import PoolBalance from "./Pool/PoolBalance";
import MaxSlippageSelector from "./Swap/MaxSlippageSelector";
import AllowanceSetter from "./Swap/AllowanceSetter";
import FeesAndImpact from "./Swap/FeesAndImpact";
const tokenAddresses =
  addresses.token0Address < addresses.token1Address
    ? [addresses.token0Address, addresses.token1Address]
    : [addresses.token1Address, addresses.token0Address];

BN.config({ DECIMAL_PLACES: 18 });

export default function Swap({account}) {

  const [openWindow, setOpenWindow] = useState("Swap");

  const [tradeType, setTradeType] = useState("buy");

  const [maxSlippage, setMaxSlippage] = useState(new BN(0.5));

  const [state, setState] = useState({
    token0Amount: new BN(0),
    token1Amount: new BN(0),
    token1AmountMin: new BN(0),
    impact: new BN(0),
    allowanceCheck: new BN(0),
  });


  let router = new Contract(addresses.routerAddress, abis.router);
  let token = new Contract(tokenAddresses[1], abis.erc20);
  let token0 = new Contract(tokenAddresses[0], abis.erc20);

  let increaseTokenAllowance = useContractFunction(token, "approve", {
    transactionName: "approve",
  });

  let increaseToken0Allowance = useContractFunction(token0, "approve", {
    transactionName: "approve0",
  });

  let addLiquidity = useContractFunction(router, "addLiquidity", {
    transactionName: "addLiquidity",
  });

  //Buy
  const swap0To1 = useContractFunction(router, "swapToken0ToToken1", {
    transactionName: "swapToken0ToToken1",
  });
  //Sell
  const swap1To0 = useContractFunction(router, "swapToken1ToToken0", {
    transactionName: "swapToken1ToToken0",
  });

  const results = useCalls([
    {
      contract: router,
      method: "getRate",
      args: tokenAddresses,
    },
    {
      contract: router,
      method: "getPoolBalances",
      args: tokenAddresses,
    },
    {
      contract: token,
      method: "allowance",
      args: [account, addresses.routerAddress],
    },
    {
      contract: token,
      method: "name",
      args: [],
    },
    {
      contract: token0,
      method: "name",
      args: [],
    },
    {
      contract: token,
      method: "symbol",
      args: [],
    },
    {
      contract: token0,
      method: "symbol",
      args: [],
    },
    {
      contract: token0,
      method: "allowance",
      args: [account, addresses.routerAddress],
    },
    {
      contract: router,
      method: "getBalance",
      args: [addresses.token0Address, addresses.token1Address],
    },
  ]);

  useEffect(() => {
    console.log("Results changed");
    handleToken0AmountChange(state.token0Amount);
  }, [results]);

  useEffect(() => {
    handleToken1AmountChange(state.token1Amount);
  }, [maxSlippage]);

  function handleAllowanceClick(increase = true) {
    console.log("increase allowance");
    if (tradeType === "buy") {
      increaseTokenAllowance.send(
        addresses.routerAddress,
        increase
          ? new BN(state.token0Amount)
              .multipliedBy(new BN(10).pow(18))
              .toFixed(0)
              .toString()
          : 0
          )
    } else {
      increaseToken0Allowance.send(
        addresses.routerAddress,
        increase
          ? new BN(state.token0Amount)
              .multipliedBy(new BN(10).pow(18))
              .toFixed(0)
              .toString()
          : 0
      );
      
    }
    
  }

  function subtractSlippage(amountBeforeSlippage) {
    return amountBeforeSlippage.multipliedBy(
      new BN(1).minus(maxSlippage / 100)
    );
  }

  function handleClick() {
    if (state.allowanceCheck) {
      console.log(
        "Allowance good",
        new BN(state.token0Amount)
          .multipliedBy(new BN(10).pow(18))
          .toFixed(0)
          .toString(),
        new BN(state.token1AmountMin).toFixed(0).toString()
      );
      if (tradeType === "buy") {
        swap1To0.send(
          tokenAddresses[0],
          tokenAddresses[1],
          new BN(state.token0Amount)
            .multipliedBy(new BN(10).pow(18))
            .toFixed(0)
            .toString(),
          new BN(state.token1AmountMin).toFixed(0).toString()
        );
      } else {
        swap0To1.send(
          tokenAddresses[0],
          tokenAddresses[1],
          new BN(state.token0Amount)
            .multipliedBy(new BN(10).pow(18))
            .toFixed(0)
            .toString(),
          new BN(state.token1AmountMin).toFixed(0).toString()
        );
      }
    } else {
      console.log("Allowance too low");
    }
  }

  function handleToken0AmountChange(value) {
    console.log("Token 0 Amount change Handler");
    let amount = new BN(value).multipliedBy(new BN(10).pow(18));
    let rate = new BN(0);
    let rateWithoutSlippage = new BN(0);
    if (results[1]) {
      rate = new BN(results[1].value.toString().split(",")[0]);
      rateWithoutSlippage = rate.div(
        new BN(results[1].value.toString().split(",")[1])
      );

      if (tradeType === "buy") {
        rateWithoutSlippage = amount
          .multipliedBy(rateWithoutSlippage)
          .dividedBy(new BN(10).pow(18));

        rate = new BN(results[1].value.toString().split(",")[1]).div(
          rate.minus(amount)
        );

        rate = amount
          .multipliedBy(0.997)
          .dividedBy(rate)
          .dividedBy(new BN(10).pow(18));
      } else {
        rateWithoutSlippage = amount
          .dividedBy(rateWithoutSlippage)
          .dividedBy(new BN(10).pow(18));

        rate = new BN(results[1].value.toString().split(",")[1])
          .minus(amount)
          .div(rate);

        rate = amount
          .multipliedBy(0.997)
          .multipliedBy(rate)
          .dividedBy(new BN(10).pow(18));
      }
      setState({
        token0Amount: value,
        token1Amount: rate,
        token1AmountMin: subtractSlippage(rate).multipliedBy(
          new BN(10).pow(18)
        ),
        impact: rateWithoutSlippage
          .minus(rate)
          .dividedBy(rateWithoutSlippage)
          .multipliedBy(100)
          .toFixed(3),
        allowanceCheck: new BN(
          tradeType === "buy" ? results[2].value : results[7].value
        ).gte(new BN(value).multipliedBy(new BN(10).pow(18))),
      });
    }
  }

  function handleToken1AmountChange(value) {
    console.log("Token 1 Amount change Handler");
    let amount = new BN(value).multipliedBy(new BN(10).pow(18));
    let rate = new BN(0);
    let rateWithoutSlippage = new BN(0);
    if (results[1]) {
      rate = new BN(results[1].value.toString().split(",")[1]);

      rateWithoutSlippage =
        tradeType === "buy"
          ? rate.div(new BN(results[1].value.toString().split(",")[0]))
          : new BN(results[1].value.toString().split(",")[0]).div(rate);

      rateWithoutSlippage = amount
        .multipliedBy(rateWithoutSlippage)
        .dividedBy(new BN(10).pow(18));

      rate = new BN(results[1].value.toString().split(",")[0]).div(rate);

      let balance0 = new BN(results[1].value.toString().split(",")[0]);
      let balance1 = new BN(results[1].value.toString().split(",")[1]);

      let b0 = tradeType === "buy" ? balance0 : balance1;
      let b1 = tradeType === "buy" ? balance1 : balance0;

      rate = new BN(0)
        .minus(
          new BN(
            new BN(
              new BN(0).minus(b0).plus(
                b0
                  .pow(2)
                  .minus(
                    new BN(4)
                      .multipliedBy(
                        new BN(value)
                          .dividedBy(997)
                          .multipliedBy(1000)
                          .multipliedBy(new BN(10).pow(18))
                      )
                      .multipliedBy(b1)
                  )
                  .sqrt()
              )
            ).dividedBy(2)
          )
        )
        .dividedBy(new BN(10).pow(18));

      setState({
        token0Amount: rate,
        token1Amount: value,
        token1AmountMin: subtractSlippage(new BN(value)).multipliedBy(
          new BN(10).pow(18)
        ),
        impact: rate
          .minus(rateWithoutSlippage)
          .dividedBy(rate)
          .multipliedBy(100)
          .toFixed(3),
        allowanceCheck: new BN(
          tradeType === "buy" ? results[2].value : results[7].value
        ).gte(new BN(rate).multipliedBy(new BN(10).pow(18))),
      });
    }
  }

  console.log(swap1To0.state);
  console.log(swap0To1.state);
  console.log(increaseTokenAllowance.state)
  console.log(increaseToken0Allowance.state)
  console.log(increaseTokenAllowance.state);
  console.log(addLiquidity.state);
  let inactive = {
    color: "dodgerblue",
    marginBottom: -1,
    border: "solid",
    padding: 7,
    borderWidth: 2,
  };
  let active = {
    backgroundColor: "dodgerblue",
    padding: 9,
    minWidth: "120px",
  };
  return (
    <EasyContainer style={{ backgroundColor: "white" }}>
      <span
        style={{
          display: "flex",
          width: "fit-content",
          margin: "0 auto",
          padding: 0,
          justifyContent: "center",
          color: "white",
          marginBottom: -2,
        }}
      >
        <span
          style={openWindow === "Swap" ? active : inactive}
          onClick={() => {
            setOpenWindow("Swap");
          }}
        >
          Swap
        </span>
        <span
          onClick={() => {
            setOpenWindow("Liquidity");
          }}
          style={openWindow === "Liquidity" ? active : inactive}
        >
          Liquidity
        </span>
      </span>
      {openWindow === "Liquidity" ? (
        <InteractionContainer
          style={{ margin: "0 auto", maxWidth: "90%", display: "block" }}
        >
          <h2>Todo: Add liquidity interface</h2>
          {results[8].value ? (
            <p>Current liquidity tokens {results[8].value.toString()}</p>
          ) : (
            <p></p>
          )}
          <Button
            onClick={() => {
              new BN(results[0].value)
                .dividedBy(new BN(10).pow(18))
                .multipliedBy(10000000);
              console.log(
                new BN(1000000000).toString(),

                results[0].value
              );
              addLiquidity.send(
                token0.address,
                token.address,
                new BN(1000000000),

                new BN(1000000000).dividedBy(
                  new BN(results[0].value).dividedBy(new BN(10).pow(18))
                )
              );
            }}
          >
            Add Liquidity
          </Button>
        </InteractionContainer>
      ) : (
        <InteractionContainer style={{ margin: "0 auto", maxWidth: "90%" }}>
          {results[3] ? (
            <div>
              <h3 style={{ textDecoration: "underline", marginTop: 0 }}>
                {tradeType === "buy" ? "Buy" : "Sell"}{" "}
                {results[4].value.toString()}
              </h3>

              <p style={{ fontSize: "medium" }}>
                Price:{" "}
                {new BN(1)
                  .dividedBy(
                    new BN(results[0].value).dividedBy(new BN(10).pow(18))
                  )
                  .toFixed(8)
                  .toString()}
              </p>
              <div style={{ display: "flex", borderBottom: "solid" }}>
                <span>
                  {tradeType === "buy"
                    ? results[5].value.toString()
                    : results[6].value.toString()}
                </span>
                <Input
                  onChange={(e) => handleToken0AmountChange(e.target.value)}
                  value={state.token0Amount.toString()}
                ></Input>
              </div>

              <Button style={{ padding: 5, backgroundColor: "white" }}>
                <img
                  style={{
                    backgroundColor: "white",
                    padding: 5,
                    borderRadius: "50%",
                  }}
                  width={30}
                  onClick={() => {
                    setTradeType(tradeType === "sell" ? "buy" : "sell");
                    handleToken0AmountChange(state.token0Amount);
                  }}
                  src="/switch.svg"
                ></img>
              </Button>
              <br />
              <p style={{ fontSize: "medium", margin: 0 }}>
                You will get approx.
              </p>
              <div style={{ display: "flex", borderBottom: "solid" }}>
                <span>
                  {tradeType === "buy"
                    ? results[6].value.toString()
                    : results[5].value.toString()}
                </span>

                <Input
                  value={state.token1Amount.toString()}
                  onChange={(e) => handleToken1AmountChange(e.target.value)}
                ></Input>
              </div>
              {state.allowanceCheck ? (
                <Button onClick={handleClick}>
                  {tradeType === "buy" ? "Buy" : "Sell"}{" "}
                  {results[4].value.toString()}
                </Button>
              ) : (
                <Button onClick={handleAllowanceClick}>
                  Increase{" "}
                  {tradeType === "buy"
                    ? results[3].value.toString()
                    : results[4].value.toString()}{" "}
                  Allowance
                </Button>
              )}

              <p style={{ fontSize: "medium" }}>
                You will get min.{" "}
                {state.token1AmountMin.dividedBy(new BN(10).pow(18)).toString()}{" "}
                {tradeType === "buy"
                  ? results[4].value.toString()
                  : results[3].value.toString()}
              </p>

              <div style={{ width: "100%", color: "dodgerblue" }}>
                <FeesAndImpact expectedImpact={state.impact}></FeesAndImpact>

                <div style={{ paddingTop: 10 }}>
                  {tradeType === "buy" ? (
                    <AllowanceSetter
                      allowance={new BN(results[2].value).dividedBy(
                        new BN(10).pow(18)
                      )}
                      tokenName={results[3].value}
                      setMaxSlippage={(increase) =>
                        handleAllowanceClick(increase)
                      }
                    ></AllowanceSetter>
                  ) : (
                    <AllowanceSetter
                      allowance={new BN(results[7].value).dividedBy(
                        new BN(10).pow(18)
                      )}
                      setMaxSlippage={(increase) =>
                        handleAllowanceClick(increase)
                      }
                      tokenName={results[4].value}
                    ></AllowanceSetter>
                  )}

                  <MaxSlippageSelector
                    setMaxSlippage={setMaxSlippage}
                  ></MaxSlippageSelector>
                </div>
              </div>
            </div>
          ) : (
            <p>Loading ...</p>
          )}
        </InteractionContainer>
      )}
    </EasyContainer>
  );
}

//               {tradeType === "buy" ? Buy(setTradeType) : Buy(setTradeType)}
