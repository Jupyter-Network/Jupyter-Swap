import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { token0, token1, wbnb } from "../../contracts/addresses";
import erc20Abi from "../..//contracts/build/IERC20Metadata.json";
import { MediumButton, SmallButton } from "../../theme/buttons";
import { Input, ListOption } from "../../theme/inputs";
import { background } from "../../theme/theme";
import { getPools } from "../../utils/requests";

export default function CurrencySelector({ onChange, provider }) {
  const [currencies, setCurrencies] = useState([])
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [poolHop, setPoolHop] = useState(false);
  //const [selected, setSelected] = useState(currencies[0]);
  const [tokens, setTokens] = useState({
    token0: {
      symbol: "MRC",
      contract: new ethers.Contract(token0, erc20Abi, provider.getSigner()),
    },
    token1: {
      symbol: "ARM",
      contract: new ethers.Contract(token1, erc20Abi, provider.getSigner()),
    },
  });

  const [activeSelector, setActiveSelector] = useState();

  useEffect(() => {
    onChange(tokens, poolHop);
  }, [tokens]);

  function checkValidityAndSetTokens(newAddress, newName, position) {
    let other = position === 0 ? 1 : 0;
    if (
      newAddress === wbnb ||
      tokens["token" + other].contract.address === wbnb
    ) {
      console.log("Hop: False");
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
        },
      });
    }
  }

  async function queryTokens(value) {
    if(value){
      let res = (await getPools(value.toUpperCase())).data;
      setCurrencies(
        res.map((item) => {
          return { name: item.token_symbol, address: item.token_address,icon:item.token_icon };
        })
      );
    }

  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <MediumButton
          onClick={() =>
            activeSelector === 0
              ? setActiveSelector(null)
              : setActiveSelector(0)
          }
          style={{
            border: "solid",
            borderRadius: 5,
            width: 80,
            margin: "0 auto",
          }}
        >
          <p style={{ lineHeight: 0.2 }}>{tokens["token0"].symbol}</p>
        </MediumButton>
        <p style={{ lineHeight: 0.2 }}>/</p>
        <MediumButton
          onClick={() =>
            activeSelector === 1
              ? setActiveSelector(null)
              : setActiveSelector(1)
          }
          style={{
            border: "solid",
            borderRadius: 5,
            width: 80,
            margin: "0 auto",
          }}
        >
          <p style={{ lineHeight: 0.2 }}>{tokens["token1"].symbol}</p>
        </MediumButton>
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
          }}
        >
          <h4>Select Currency :</h4>
          <Input
            onChange={async (e) => {
              await queryTokens(e.target.value);
              setFilteredCurrencies(
                currencies.filter((item) => {
                  return (
                    item.name.slice(0, e.target.value.length) ===
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
              onClick={() => {
                checkValidityAndSetTokens(item.address, item.name, 1);
                setActiveSelector(null);
              }}
            >
             <div style={{display:"flex",justifyContent:"space-evenly"}}>
              <img style={{width:15}} src={`/tokenlogos/${item.icon}`}></img><div style={{minWidth:10}}><p> </p></div> {item.name}


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
            width: 300,
            backgroundColor: background,
            margin: "0 auto",
            boxShadow: "0px 2px 5px -3px black",
            height: "fit-content",
          }}
        >
          <h4>Select Currency :</h4>
          <Input
            onChange={async (e) => {
              await queryTokens(e.target.value);
              setFilteredCurrencies(
                currencies.filter((item) => {
                  return (
                    item.name.slice(0, e.target.value.length) ===
                    e.target.value.toUpperCase()
                  );
                })
              );
            }}
            placeholder={tokens["token0"].symbol}
            style={{ width: "50px", textAlign: "center" }}
          ></Input>
          {currencies.map((item) => (
            <ListOption
              onClick={() => {
                checkValidityAndSetTokens(item.address, item.name, 0);
                setActiveSelector(null);
              }}
            >
                <div style={{display:"flex",justifyContent:"space-evenly"}}>
              <img style={{width:15}} src={`/tokenlogos/${item.icon}`}></img><div style={{minWidth:10}}><p> </p></div> {item.name}

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
              checkValidityAndSetTokens(item.address, item.name, 0);
            }}
          >
            {item.name}
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
              checkValidityAndSetTokens(item.address, item.name, 1);
            }}
          >
            {item.name}
          </button>
        ))}
        <p style={{ color: "white" }}>{tokens["token0"].address}</p>
        <p style={{ color: "white" }}>{tokens["token1"].address}</p>
        <p style={{ color: "white" }}>{poolHop ? "true" : "false"}</p>
      </div>


*/
