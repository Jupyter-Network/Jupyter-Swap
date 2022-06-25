import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { token0, token1, wbnb } from "../../contracts/addresses";
import erc20 from "../..//contracts/build/IERC20.json";
import {
  MediumButton,
  MediumButtonInverted,
  SmallButton,
} from "../../theme/buttons";
import { Input, ListOption } from "../../theme/inputs";
import { background } from "../../theme/theme";
import { getPools } from "../../utils/requests";
const erc20Abi = erc20.abi;

export default function CurrencySelector({ onChange, provider, initialToken }) {
  const [currencies, setCurrencies] = useState([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [poolHop, setPoolHop] = useState(false);

  const [tokens, setTokens] = useState(initialToken);

  const [activeSelector, setActiveSelector] = useState();

  useEffect(() => {
    localStorage.setItem(
      "tokens",
      JSON.stringify({
        token0: {
          address: tokens.token0.contract.address,
          symbol: tokens.token0.symbol,
          icon: tokens.token0.icon,
          description: tokens.token0.description,
          name: tokens.token0.name,
        },
        token1: {
          address: tokens.token1.contract.address,
          symbol: tokens.token1.symbol,
          icon: tokens.token1.icon,
          description: tokens.token1.description,
          name: tokens.token1.name,
        },
      })
    );
    onChange(tokens, poolHop);
  }, [tokens]);

  useEffect(() => {
    setTokens({
      token0: {
        ...tokens["token0"],
        contract: new ethers.Contract(
          tokens["token0"].contract.address,
          erc20Abi,
          provider.getSigner()
        ),
      },
      token1: {
        ...tokens["token1"],
        contract: new ethers.Contract(
          tokens["token1"].contract.address,
          erc20Abi,
          provider.getSigner()
        ),
      },
    });
  }, [provider]);

  function checkValidityAndSetTokens(
    newAddress,
    newName,
    icon,
    name,
    description,
    position
  ) {
    let other = position === 0 ? 1 : 0;

    if (
      newAddress === wbnb ||
      tokens["token" + other].contract.address === wbnb
    ) {
      setPoolHop(false);
    } else {
      setPoolHop(true);
    }

    if (tokens["token" + other].contract.address === newAddress) {
      if (
        tokens["token0"].contract.address === wbnb ||
        tokens["token1"].contract.address === wbnb
      ) {
        setPoolHop(false);
      } else {
        setPoolHop(true);
      }
      setTokens({ token0: tokens["token1"], token1: tokens["token0"] });
    } else {
      setTokens({
        ...tokens,
        ["token" + position]: {
          symbol: newName,
          contract: new ethers.Contract(
            newAddress,
            erc20Abi,
            provider.getSigner()
          ),
          icon: icon,
          name: name,
          description: description,
          address: newAddress,
        },
      });
    }
  }

  function switchTokens() {
    setTokens({ token0: tokens["token1"], token1: tokens["token0"] });
  }

  async function queryTokens(value) {
    if (value) {
      let res = (await getPools(value.toUpperCase())).data;
      setCurrencies(
        res.map((item) => {
          return {
            symbol: item.token_symbol,
            address: item.token_address,
            icon: item.token_icon,
            name: item.token_name,
            description: item.token_description,
          };
        })
      );
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <MediumButtonInverted
          title="Token to sell"
          onClick={() => {
            setTimeout(() => {
              activeSelector === 0
                ? setActiveSelector(null)
                : setActiveSelector(0);
            }, 100);
          }}
          style={{
            border: "solid",
            borderWidth: 1,
            borderRadius: 5,
            width: 120,
            height: 70,
            zIndex: 1,
          }}
        >
          <img
            style={{ width: 22 }}
            src={"/tokenlogos/" + tokens["token0"].icon}
          ></img>
          &nbsp;
          <p style={{ lineHeight: 0.2 }}>{tokens["token0"].symbol}</p>
        </MediumButtonInverted>
        <MediumButtonInverted
          title="Switch trade direction"
          style={{ height: 70 }}
          onClick={() => switchTokens()}
        >
          <img src={"/chevron.svg"} style={{ width: 25, padding: 10 }}></img>
        </MediumButtonInverted>

        <MediumButtonInverted
          title="Token to buy"
          onClick={() =>
            setTimeout(() => {
              activeSelector === 1
                ? setActiveSelector(null)
                : setActiveSelector(1);
            }, 100)
          }
          style={{
            border: "solid",
            borderWidth: 1,
            borderRadius: 5,
            width: 120,
            height: 70,
          }}
        >
          <img
            style={{ width: 22 }}
            src={"/tokenlogos/" + tokens["token1"].icon}
          ></img>
          <p style={{ lineHeight: 0.2 }}>{tokens["token1"].symbol}</p>{" "}
        </MediumButtonInverted>
      </div>

      {activeSelector === 1 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            background: background,
            width: 300,
            margin: "0 auto",
            boxShadow: "0px 2px 5px -3px black",
            height: "fit-content",
            border: "solid",
            borderWidth: 1,
            borderRadius: 5,
            zIndex: 1000,
          }}
        >
          <h4>Search Token :</h4>
          <Input
            autoFocus={true}
            onBlur={(e) => {
              if (
                e.relatedTarget !== null &&
                e.relatedTarget.nodeName === "P"
              ) {
                e.stopPropagation();
              } else {
                setActiveSelector(null);
              }
            }}
            onChange={async (e) => {
              await queryTokens(e.target.value);
              setFilteredCurrencies(
                currencies.filter((item) => {
                  return (
                    item.symbol.slice(0, e.target.value.length) ===
                    e.target.value.toUpperCase()
                  );
                })
              );
            }}
            placeholder={tokens["token1"].symbol}
            style={{ width: "50px", textAlign: "center" }}
          ></Input>
          {currencies.map((item) => (
            <ListOption
              key={item.address}
              tabIndex={0}
              onClick={() => {
                checkValidityAndSetTokens(
                  item.address,
                  item.symbol,
                  item.icon,
                  item.name,
                  item.description,
                  1
                );
                setActiveSelector(null);
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                <img
                  style={{ width: 15 }}
                  src={`/tokenlogos/${item.icon}`}
                ></img>
                <div style={{ minWidth: 10 }}>
                  <p> </p>
                </div>{" "}
                {item.symbol}
              </div>
            </ListOption>
          ))}
          <br style={{ lineHeight: 0.2 }} />
        </div>
      ) : (
        <span></span>
      )}

      {activeSelector === 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            backgroundColor: background,
            width: 300,
            margin: "0 auto",
            boxShadow: "0px 2px 5px -3px black",
            height: "fit-content",
            border: "solid",
            borderWidth: 1,
            borderRadius: 5,
            zIndex: 1000,
          }}
        >
          <h4>Search Token :</h4>
          <Input
            autoFocus={true}
            onBlur={(e) => {
              if (
                e.relatedTarget !== null &&
                e.relatedTarget.nodeName === "P"
              ) {
                e.stopPropagation();
              } else {
                setActiveSelector(null);
              }
            }}
            onChange={async (e) => {
              await queryTokens(e.target.value);
              setFilteredCurrencies(
                currencies.filter((item) => {
                  return (
                    item.symbol.slice(0, e.target.value.length) ===
                    e.target.value.toUpperCase()
                  );
                })
              );
            }}
            placeholder={tokens["token1"].symbol}
            style={{ width: "50px", textAlign: "center" }}
          ></Input>
          {currencies.map((item) => (
            <ListOption
              tabIndex={0}
              onClick={() => {
                checkValidityAndSetTokens(
                  item.address,
                  item.symbol,
                  item.icon,
                  item.name,
                  item.description,
                  0
                );
                setActiveSelector(null);
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                <img
                  style={{ width: 15 }}
                  src={`/tokenlogos/${item.icon}`}
                ></img>
                <div style={{ minWidth: 10 }}>
                  <p> </p>
                </div>{" "}
                {item.symbol}
              </div>
            </ListOption>
          ))}
          <br style={{ lineHeight: 0.2 }} />
        </div>
      ) : (
        <span></span>
      )}
    </div>
  );
}

/*
    <div>
        {currencies.map((item) => (
          <button
            key={item.address}
            style={{
              backgroundColor:
                item.address === tokens["token0"].contract.address
                  ? "green"
                  : "",
            }}
            onClick={() => {
              checkValidityAndSetTokens(item.address, item.symbol, 0);
            }}
          >
            {item.symbol}
          </button>
        ))}
      </div>
      <div>
        {currencies.map((item) => (
          <button
            key={item.address}
            style={{
              backgroundColor:
                item.address === tokens["token1"].contract.address
                  ? "green"
                  : "",
            }}
            onClick={() => {
              checkValidityAndSetTokens(item.address, item.symbol, 1);
            }}
          >
            {item.symbol}
          </button>
        ))}
        <p style={{ color: "white" }}>{tokens["token0"].address}</p>
        <p style={{ color: "white" }}>{tokens["token1"].address}</p>
        <p style={{ color: "white" }}>{poolHop ? "true" : "false"}</p>
      </div>


*/
