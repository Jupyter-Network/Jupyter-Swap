import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { token0, token1, wbnb } from "../../contracts/addresses";
import erc20 from "../../contracts/build/IERC20.json";
import {
  MediumButton,
  MediumButtonInverted,
  SmallButton,
} from "../../theme/buttons";
import { Input, ListOption } from "../../theme/inputs";
import { background } from "../../theme/theme";
import { getPools } from "../../utils/requests";
const erc20Abi = erc20.abi;

export default function PoolSelector({ onChange, provider,initialTokens }) {
  const [currencies, setCurrencies] = useState([]);
  const [tokens, setTokens] = useState(initialTokens);

  const [activeSelector, setActiveSelector] = useState();

  useEffect(() => {
    onChange(tokens);
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

  function checkValidityAndSetTokens(newAddress, newName, icon) {
    setTokens({
      ...tokens,
      ["token1"]: {
        symbol: newName,
        contract: new ethers.Contract(
          newAddress,
          erc20Abi,
          provider.getSigner()
        ),
        icon: icon,
      },
    });
  }

  async function queryTokens(value) {
    if (value) {
      let res = (await getPools(value.toUpperCase())).data;
      setCurrencies(
        res.map((item) => {
          return {
            name: item.token_symbol,
            address: item.token_address,
            icon: item.token_icon,
          };
        })
      );
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <MediumButtonInverted
          onClick={() =>
            activeSelector === 1
              ? setActiveSelector(null)
              : setActiveSelector(1)
          }
          style={{
            border: "solid",
            borderWidth:1,
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
            backgroundColor: background,
            width: 300,
            margin: "0 auto",
            boxShadow: "0px 2px 5px -3px black",
            height: "fit-content",
            border: "solid",
            borderWidth: 1,
            borderRadius: 5,
            zIndex: 10,
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
            }}
            placeholder={tokens["token1"].symbol}
            style={{ width: "50px", textAlign: "center" }}
          ></Input>
          {currencies.map((item) =>
            item.address === wbnb ? null : (
              <ListOption
                key={item.address}
                tabIndex={0}
                onClick={() => {
                  checkValidityAndSetTokens(item.address, item.name, item.icon);
                  setActiveSelector(null);
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-evenly" }}
                >
                  <img
                    style={{ width: 15 }}
                    src={`/tokenlogos/${item.icon}`}
                  ></img>
                  <div style={{ minWidth: 10 }}>
                    <p> </p>
                  </div>{" "}
                  {item.name}
                </div>
              </ListOption>
            )
          )}
          <br style={{ lineHeight: 0.2 }} />
        </div>
      ) : (
        <span></span>
      )}
    </div>
  );
}
