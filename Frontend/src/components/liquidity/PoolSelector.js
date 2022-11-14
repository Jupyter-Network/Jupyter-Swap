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

export default function PoolSelector({ onChange, provider, initialTokens }) {
  const [currencies, setCurrencies] = useState([]);
  const [tokens, setTokens] = useState(initialTokens);

  const [activeSelector, setActiveSelector] = useState();

  //useEffect(() => {
  //  onChange(tokens);
  //}, [tokens]);
//
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
  function checkValidityAndSetTokens(item) {
    setTokens({
      token0: {
        symbol: item.token0.name,
        contract: new ethers.Contract(
          item.token0.address,
          erc20Abi,
          provider.getSigner()
        ),
        icon: item.token0.icon,
        address: item.token0.address,
      },
      token1: {
        symbol: item.token1.name,
        contract: new ethers.Contract(
          item.token1.address,
          erc20Abi,
          provider.getSigner()
        ),
        icon: item.token1.icon,
        address: item.token1.address,
      },
    });
        onChange({
          token0: {
            symbol: item.token0.name,
            contract: new ethers.Contract(
              item.token0.address,
              erc20Abi,
              provider.getSigner()
            ),
            icon: item.token0.icon,
            address: item.token0.address,
          },
          token1: {
            symbol: item.token1.name,
            contract: new ethers.Contract(
              item.token1.address,
              erc20Abi,
              provider.getSigner()
            ),
            icon: item.token1.icon,
            address: item.token1.address,
          },
        });

  }

  async function queryTokens(value) {
    if (value) {
      let res = (await getPools(value.toUpperCase())).data;
      setCurrencies(
        res.map((item) => {
          return {
            token0:{
              name: item.token0_symbol,
              address: item.token0_address,
              icon: item.token0_icon,
            },
            token1:{
              name: item.token1_symbol,
              address: item.token1_address,
              icon: item.token1_icon,
            }
   
          };
        })
      );
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <MediumButtonInverted
        title={"Select pool"}
          onClick={() =>
            activeSelector === 1
              ? setActiveSelector(null)
              : setActiveSelector(1)
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
            src={"/tokenlogos/" + tokens.token1.icon}
          ></img>
          <p style={{ lineHeight: 0.2 }}>{tokens.token0.symbol} / {tokens.token1.symbol}</p>{" "}
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
              <ListOption
                key={item.token0.address + item.token1.address}
                tabIndex={0}
                onClick={() => {
                  checkValidityAndSetTokens(item)// item.address, item.name, item.icon);
                  setActiveSelector(null);
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-evenly" }}
                >
                  <img
                    style={{ width: 15 }}
                    src={`/tokenlogos/${item.token0.icon}`}
                  ></img>
                    <img
                    style={{ width: 15 }}
                    src={`/tokenlogos/${item.token1.icon}`}
                  ></img>
          
                  {item.token0.name} / {item.token1.name}
                </div>
              </ListOption>
            
          )}
          <br style={{ lineHeight: 0.2 }} />
        </div>
      ) : (
        <span></span>
      )}
    </div>
  );
}
