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
import { background } from "../../theme/theme";

import CurrencyDisplay from "../liquidity/CurrencyDisplay";
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

  const [createWidgetState, setCreateWidgetState] = useState({
    bnbAmount: new BN(0),
    tokenAmount: new BN(0),
    address: "0x00",
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

  //New Block
  useEffect(() => {
    async function asyncRun() {
      console.log("Block changed in swap");
      await getBlockData();
      handleToken0AmountChange(state.token0Amount.toString());
    }
    asyncRun();
  }, [block]);

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

    getBlockData();
  }, [wallet]);

  const [tokens, setTokens] = useState({
    token0: {
      symbol: "BNB",
      contract: new ethers.Contract(wbnb, erc20Abi, ethersProvider),
      icon: "bnb-bnb-logo.svg",
    },
    token1: {
      symbol: "ARM",
      contract: new ethers.Contract(token1, erc20Abi, ethersProvider),
      icon: "placeholder.svg",
    },
  });

  useEffect(() => {
    getBlockData();
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
    console.log(
      createWidgetState.address,
      BN(createWidgetState.tokenAmount)
        .multipliedBy(BN(10).pow(18))
        .toFixed(0)
        .toString(),
      {
        value: BN(createWidgetState.bnbAmount)
          .multipliedBy(BN(10).pow(18))
          .toFixed(0)
          .toString(),
      }
    );
    await routerContract.createLiquidityPool(
      createWidgetState.address,
      BN(createWidgetState.tokenAmount)
        .multipliedBy(BN(10).pow(18))
        .toFixed(0)
        .toString(),
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
    console.log(ethersProvider);
    await transaction(
      `Approve ${BN(amount).dividedBy(BN(10).pow(18))} ${symbol}`,
      tokenContract.approve,
      [router, amount.toString()]
    );
  }

  //BEP-20
  async function approveAnonymousToken(contract, amount) {
    console.log(ethersProvider);
    await transaction(
      `Approve ${BN(amount).dividedBy(BN(10).pow(18))}`,
      contract.approve,
      [router, amount.toString()]
    );
  }

  async function getBlockData() {
    console.log("Reload");
    console.log("Wallet: ", wallet);
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
    console.log("Pool Balances: ", poolBalances[0].toString());
    console.log("Pool Balances: ", poolBalances[1].toString());

    const lpTotalSupply = await routerContract.getLPTotalSupply(
      tokens["token1"].contract.address
    );
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
        margin:"0 auto",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: 1200,
      }}
    >
       <Container style={{ maxHeight: 230 }}>
        <ContainerTitle>Select Pool</ContainerTitle>
        <PoolSelector
          provider={ethersProvider}
          onChange={(tokens) => {
            setTokens(tokens);
          }}
        ></PoolSelector>

        <br />
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
      <Container>
        <ContainerTitle>Balance</ContainerTitle>
        <div>
          <p>Your Balance:</p>
          {blockData ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <CurrencyDisplay
                amount={numericFormat(
                  BN(blockData.userBalance.toString())
                    .dividedBy(BN(10).pow(36))
                    .toString()
                )}
                symbol="LP"
                icon="/bnb-bnb-logo.svg"
              ></CurrencyDisplay>

              <CurrencyDisplay
                amount={numericFormat(blockData.token0Balance.toString())}
                symbol={tokens["token0"].symbol}
                icon={tokens["token0"].icon}
              ></CurrencyDisplay>
              <CurrencyDisplay
                amount={numericFormat(blockData.token1Balance.toString())}
                symbol={tokens["token1"].symbol}
                icon={tokens["token1"].icon}
              ></CurrencyDisplay>
            </div>
          ) : (
            <p></p>
          )}
        </div>
        <div>
          <p>Pool Balance:</p>
          {blockData ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <CurrencyDisplay
                amount={numericFormat(
                  BN(blockData.lpTotalSupply.toString())
                    .dividedBy(BN(10).pow(36))
                    .toString()
                )}
                symbol="LP"
                icon="/bnb-bnb-logo.svg"
              ></CurrencyDisplay>

              <CurrencyDisplay
                amount={numericFormat(
                  BN(blockData.poolBalances[0].toString())
                    .dividedBy(BN(10).pow(18))
                    .toString()
                )}
                symbol={tokens["token0"].symbol}
                icon={tokens["token0"].icon}
              ></CurrencyDisplay>
              <CurrencyDisplay
                amount={numericFormat(
                  BN(blockData.poolBalances[1].toString())
                    .dividedBy(BN(10).pow(18))
                    .toString()
                )}
                symbol={tokens["token1"].symbol}
                icon={tokens["token1"].icon}
              ></CurrencyDisplay>
            </div>
          ) : (
            <p></p>
          )}
        </div>
        <br />
      </Container>

     
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
      </Container>
      <Container style={{maxHeight:180}}>
        <ContainerTitle>Remove Liquidity</ContainerTitle>
        <span>
          {tokens["token0"].symbol} / {tokens["token1"].symbol}
        </span>
        <br />
        <Input
          onChange={(e) => {
            let v = BN(validate(e.target.value));
            setState({ ...state, lpAmount: validate(e.target.value) });
          }}
          value={state.lpAmount}
        ></Input>
        <Label>
          <b>LP</b>
        </Label>
          <br/>
          <br/>
        <LargeButton onClick={() => removeLiquidity()}>
          RemoveLiquidity
        </LargeButton>
      </Container>
      <div style={{ width: "100%" }}></div>
      <Container style={{maxHeight:390}}>
        <ContainerTitle>Create New Liquidity Pool</ContainerTitle>
        <Input
          value={createWidgetState.address}
          onChange={(e) =>
            setCreateWidgetState({
              ...createWidgetState,
              address: e.target.value,
            })
          }
          placeholder="Address"
        ></Input>
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
                console.log(createWidgetState.address);
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
