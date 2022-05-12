import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { ethers, utils } from "ethers";
import { useEffect, useState } from "react";
import { token0, router, token1, wbnb } from "../../contracts/addresses";
import erc20Abi from "../../contracts/build/ERC20.json";
import routerAbi from "../../contracts/build/JupyterRouterV1.json";
import BN from "bignumber.js";
import { validate } from "../../utils/inputValidations";

//Add this to a Math file later
function _scaleDown(value) {
  return BN(value.toString()).div(BN(10).pow(18)).toString();
}

export default function Liquidity({ block }) {
  const connectedWallets = useWallets();
  const [tokens, setTokens] = useState([token0, token1]);
  const [state, setState] = useState({
    token0Amount: "0",
    token1Amount: new BN(0),
    token1AmountMin: new BN(0),
    allowanceCheck: new BN(0),
    lpAmount: new BN(0),
  });
  const [maxSlippage, setMaxSlippage] = useState(new BN(0.5));

  const [blockData, setBlockData] = useState();
  let ethersProvider;
  let token0Contract;
  let token1Contract;
  let routerContract;

  function handleToken0AmountChange(value) {
    console.log("Token 0 Amount change Handler", value);
    value = validate(value);
    let t1Amount = new BN(0);
    if(blockData){
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
  if (!token0Contract && !token1Contract && connectedWallets.length > 0) {
    ethersProvider = new ethers.providers.Web3Provider(
      connectedWallets[0].provider
    );

    token0Contract = new ethers.Contract(
      token0,
      erc20Abi,
      ethersProvider.getSigner()
    );
    token1Contract = new ethers.Contract(
      token1,
      erc20Abi,
      ethersProvider.getSigner()
    );
    routerContract = new ethers.Contract(
      router,
      routerAbi,
      ethersProvider.getSigner()
    );
  }

  //Router
  async function addLiquidity() {
    console.log(state.token0Amount, state.token1Amount);
    await routerContract.addLiquidity(
      await token1Contract.address,
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
      await token1Contract.address,
      BN(state.lpAmount).multipliedBy(BN(10).pow(36)).toFixed(0)
    );
  }
  async function getToken1AmountFromToken0Amount(amount) {
    return await routerContract.getToken1AmountFromToken0Amount(
      await token0Contract.address,
      await token1Contract.address,
      amount
    );
  }

  //BEP-20
  async function approveToken(contract, amount) {
    await contract.approve(router, amount);
  }

  async function getBlockData() {
    const t0Balance = await token0Contract.balanceOf(
      connectedWallets[0].accounts[0].address
    );
    const t1Balance = await token1Contract.balanceOf(
      connectedWallets[0].accounts[0].address
    );
    const userBalance = await routerContract.getBalance(token1);
    const rate = await routerContract.getRate(token1Contract.address);
    setBlockData({
      token0Balance: _scaleDown(t0Balance),
      token1Balance: _scaleDown(t1Balance),
      rate: _scaleDown(rate),
      userBalance: userBalance,
    });
  }
  return (
    <div style={{ backgroundColor: "red" }}>
      <span>Token1 / Token2</span>
      <br />
      <input
        onChange={(e) => handleToken0AmountChange(e.target.value)}
        value={state.token0Amount.toString()}
      ></input>
      <label>token0Amount</label>
      <br />
      <input
        onChange={(e) => handleToken1AmountChange(e.target.value)}
        value={state.token1Amount.toString()}
      ></input>
      <label>token1Amount</label>
      <br />
      <button
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
      </button>
      <br />
      <input
        onChange={(e) => {
          let v = BN(validate(e.target.value))
          setState({ ...state, lpAmount:e.target.value })
        }}
        value={state.lpAmount}
      ></input>
      <label>LP-Amount</label>
      <br />
      <button onClick={() => removeLiquidity()}>RemoveLiquidity</button>
      <br />
      TokenActions_
      <button
        onClick={() => {
          approveToken(token0Contract, "100000000000000000000000");
        }}
      >
        Approve Token 0
      </button>
      <button
        onClick={() => {
          approveToken(token1Contract, "100000000000000000000000");
        }}
      >
        Approve Token 1
      </button>
      {blockData ? (
        <div>
          <p>
            LP Balance:{" "}
            {BN(blockData.userBalance.toString())
              .dividedBy(BN(10).pow(36))
              .toString()}
          </p>
          <p>Token 0 Balance = {blockData.token0Balance}</p>
          <p>Token 1 Balance = {blockData.token1Balance}</p>
        </div>
      ) : (
        <p></p>
      )}
    </div>
  );
}
