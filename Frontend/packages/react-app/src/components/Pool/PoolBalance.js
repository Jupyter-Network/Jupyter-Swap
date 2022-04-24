
import {
   useCall
} from "@usedapp/core";
import { Contract } from "@ethersproject/contracts";
import { abis, addresses } from "@my-app/contracts";
const tokenAddresses =
  addresses.token0Address < addresses.token1Address
    ? [addresses.token0Address, addresses.token1Address]
    : [addresses.token1Address, addresses.token0Address];
    let router = new Contract(addresses.routerAddress, abis.router);

export default function PoolBalance(){
    const balances = useCall(
        {
          contract: router,
          method: "getPoolBalances",
          args: tokenAddresses,
        }
      );


      return (<>
        <p>{balances ? balances.value.toString():0}</p>
      </>)

}