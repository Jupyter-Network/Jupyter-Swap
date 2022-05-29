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

export function numericFormat(value, maxDigits = 18) {
  let dollarUSLocale = Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDigits,
  });

  value = BN(value).toFixed(36);
  let v = value.split(".");
  let firstNonNullDecimal = 0;

  if (v[0] == "0") {
    for (let i in v[1]) {
      if (v[1][i] == 0) {
        continue;
      }
      firstNonNullDecimal = i;
      const factor = Math.pow(10, firstNonNullDecimal) * 10000;
      const out = Math.floor(value * factor) / factor;
      value = out.toFixed(parseInt(firstNonNullDecimal) + 3);
    }
  } else if (v[0].length < 6) {
    value = Math.floor(value * 10000) / 10000;
  } else if (v[0].length >= 6) {
    value = Math.floor(value);
  }
  return dollarUSLocale.format(value);
}
