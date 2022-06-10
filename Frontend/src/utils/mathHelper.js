import BN from "bignumber.js";
export function _scaleDown(value) {
    return BN(value.toString()).div(BN(10).pow(18)).toString();
  }