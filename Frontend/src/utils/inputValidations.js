import BN from "bignumber.js";
import { BigNumber } from "bignumber.js";
import { error } from "./alerts";

export function validate(value) {
  if (BigNumber.isBigNumber(value)) {
    value.toString();
  }
  if (isNaN(value)) {
    return 0.0;
  }
  return value;
}

export function numericFormat(value) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 5,
  });

  return formatter.format(BN(value).div(BN(10).pow(18)));
}
export function currencyFormat(value, currency) {
  if (typeof value !== "bigint" && isNaN(value)) {
    return BigInt(0).toLocaleString("en-GB", {
      style: "currency",
      currency: currency,
    });
  }
  return BigInt(value).toLocaleString("en-GB", {
    style: "currency",
    currency: "USD",
  });
}
export function currency(value, currency) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 10,
  });

  return formatter.format(value);
}

export function addressFormat(value) {
  return value.slice(0, 4) + "..." + value.slice(39);
}

export function txHashFormat(value) {
  return value.slice(0, 4) + "..." + value.slice(63);
}

export function dynamicPrecisionDecimal(value) {
  if (value == 0) {
    return value;
  } else if (value > 1000000) {
    return value.toFixed(0);
  } else if (value > 10000) {
    return value.toFixed(1);
  } else if (value > 100) {
    return value.toFixed(3);
  } else if (value > 1) {
    return value.toFixed(5);
  } else if (value > 0.01) {
    return value.toFixed(7);
  } else if (value > 0.000000099999999999) {
    return value;
  } else if (value > 0.00000000099999999999) {
    return value.toFixed(9);
  } else {
    return value.toFixed(18);
  }
}

export function safeBigInt(value) {
  try {
    BigInt(value);
  } catch {
    return 0;
  }
}

export function isAddress(address) {
  if (!address.startsWith("0x")) return false;
  if (address.length != 42) return false;
  return true;
}
