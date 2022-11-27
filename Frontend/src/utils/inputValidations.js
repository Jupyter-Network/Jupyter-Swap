import BN from "bignumber.js";
import { isBigNumberish } from "ethers/node_modules/@ethersproject/bignumber/lib/bignumber";
import { error } from "./alerts";

export function validate(value) {
  if (isBigNumberish(value)) {
    value.toString();
  }
  if (isNaN(value)) {
    return 0.0;
  }
  return value;
}


export function numericFormat(value){
  const formatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits:5 })

  return (formatter.format(BN(value).div(BN(10).pow(18))))
}
export function currencyFormat(value,currency){
  if(typeof value !== 'bigint' && isNaN(value)){
    return BigInt(0).toLocaleString("en-GB",{ style: 'currency', currency: currency });
  }
  return BigInt(value).toLocaleString("en-GB",{ style: 'currency', currency: "USD" })
}
export function currency(value,currency){
  const formatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits:10 })

  return (formatter.format(value))
}


export function addressFormat(value){
  return value.slice(0,4) + "..." + value.slice(39)
}

export function txHashFormat(value){
  return value.slice(0,4) + "..." + value.slice(63)
}
