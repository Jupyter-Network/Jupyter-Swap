/*global BigInt */
import BN from "bignumber.js";
export function _scaleDown(value) {
  return BN(value.toString()).div(BN(10).pow(18)).toString();
}

function mostSignificantBit(x) {
  x = BigInt(x);
  let msb = BigInt(0);
  if (x >= BigInt("0x100000000000000000000000000000000")) {
    x = x >> 128n;
    msb = msb + 128n;
  }
  if (x >= BigInt("0x10000000000000000")) {
    x = x >> 64n;
    msb = msb + 64n;
  }
  if (x >= BigInt("0x100000000")) {
    x = x >> 32n;
    msb = msb + 32n;
  }
  if (x >= BigInt("0x10000")) {
    x = x >> 16n;
    msb = msb + 16n;
  }
  if (x >= BigInt("0x100")) {
    x = x >> 8n;
    msb = msb + 8n;
  }
  if (x >= BigInt("0x10")) {
    x = x >> 4n;
    msb = msb + 4n;
  }
  if (x >= BigInt("0x4")) {
    x = x >> 2n;
    msb = msb + 2n;
  }
  if (x >= BigInt("0x2")) {
    x = x >> 1n;
    msb = msb + 1n;
  }
  return msb;
}

function refine(r, log_2, shift) {
  r = (r * r) >> 127n;
  let f = r >> 128n;
  log_2 = log_2 | (f << shift);
  r = r >> f;
  return [r, log_2];
}

export function tickAtSqrtPrice(sqrtPrice) {
  // second inequality must be < because the price can never reach the price at the max tick
  //require(sqrtPrice >= MIN_SQRT_RATIO && sqrtPrice < MAX_SQRT_RATIO, 'R');
  let ratio = sqrtPrice << 32n;
  ratio = BigInt(ratio);
  let r = ratio;
  let msb = 0n;
  msb = mostSignificantBit(ratio);
  msb = BigInt(msb);

  if (msb >= 128) r = ratio >> (msb - 127n);
  else r = ratio << (127n - msb);

  let log_2 = (msb - 128n) << 64n;
  [r, log_2] = refine(r, log_2, 63n);
  [r, log_2] = refine(r, log_2, 62n);
  [r, log_2] = refine(r, log_2, 61n);
  [r, log_2] = refine(r, log_2, 60n);
  [r, log_2] = refine(r, log_2, 59n);
  [r, log_2] = refine(r, log_2, 58n);
  [r, log_2] = refine(r, log_2, 57n);
  [r, log_2] = refine(r, log_2, 56n);
  [r, log_2] = refine(r, log_2, 55n);
  [r, log_2] = refine(r, log_2, 54n);
  [r, log_2] = refine(r, log_2, 53n);
  [r, log_2] = refine(r, log_2, 52n);
  [r, log_2] = refine(r, log_2, 51n);
  [r, log_2] = refine(r, log_2, 50n);

  let log_sqrt10001 = log_2 * 255738958999603826347141n; // 128.128 number

  let low = (log_sqrt10001 - 3402992956809132418596140100660247210n) >> 128n;
  let high = (log_sqrt10001 + 291339464771989622907027621153398088495n) >> 128n;

  return low == high ? low : sqrtPriceFromTick(high) <= sqrtPrice ? high : low;
}

export function sqrtPriceFromTick(tick) {
  let absTick = BigInt(tick);
  absTick = tick > 0 ? absTick : -absTick;
  let ratio =
    (absTick & 0x1n) != 0n
      ? 0xfffcb933bd6fad37aa2d162d1a594001n
      : 0x100000000000000000000000000000000n;
  if ((absTick & 0x2n) != 0)
    ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
  if ((absTick & 0x4n) != 0)
    ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
  if ((absTick & 0x8n) != 0)
    ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
  if ((absTick & 0x10n) != 0)
    ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
  if ((absTick & 0x20n) != 0)
    ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
  if ((absTick & 0x40n) != 0)
    ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
  if ((absTick & 0x80n) != 0)
    ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
  if ((absTick & 0x100n) != 0)
    ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
  if ((absTick & 0x200n) != 0)
    ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
  if ((absTick & 0x400n) != 0)
    ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
  if ((absTick & 0x800n) != 0)
    ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
  if ((absTick & 0x1000n) != 0)
    ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
  if ((absTick & 0x2000n) != 0)
    ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
  if ((absTick & 0x4000n) != 0)
    ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
  if ((absTick & 0x8000n) != 0)
    ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
  if ((absTick & 0x10000n) != 0)
    ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
  if ((absTick & 0x20000n) != 0)
    ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
  if ((absTick & 0x40000n) != 0)
    ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
  if ((absTick & 0x80000n) != 0)
    ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;

  if(tick > 0) ratio =
    115792089237316195423570985008687907853269984665640564039457584007913129639935n /
    ratio;

  return (ratio >> 32n) + (ratio % (1n << 32n) == 0 ? 0n : 1n);
}

export function priceFromSqrtPrice(sqrtPrice) {
  let num = (sqrtPrice ** 2n / 2n ** 64n).toString();
  //let frac = num.slice(-18)
  //num = num.split(frac)[0] + "." +  frac
  return num / 2 ** 128;
}
export function sqrtPriceFromPrice(price) {
  return BigInt(Math.round(Math.sqrt(price) * 2 ** 96));
}

export function priceFromTick(tick) {
  return priceFromSqrtPrice(sqrtPriceFromTick(tick));
}

export function getAmount0(lowerPrice, upperPrice, liquidity) {
  [lowerPrice, upperPrice] =
    lowerPrice < upperPrice
      ? [lowerPrice, upperPrice]
      : [upperPrice, lowerPrice];
  const lp = sqrtPriceFromTick(tickAtSqrtPrice(lowerPrice));
  const up = sqrtPriceFromTick(tickAtSqrtPrice(upperPrice));
  liquidity = BigInt(liquidity) << 96n;
  let delta = up - lp;

  return (liquidity * delta) / BigInt(lp * up);
}

export function getAmount1(lowerPrice, upperPrice, liquidity) {
  const lp = BigInt(lowerPrice);
  const up = BigInt(upperPrice);

  liquidity = BigInt(liquidity);
  let delta = up - lp;
  return (liquidity * delta) / 79228162514264337593543950336n;
}

export function calcNewPosition(
  _startTick,
  _endTick,
  _currentTick,
  _liquidity,
  _currentPrice
) {
  let amount0;
  let amount1;
  _currentTick = BigInt(_currentTick);


  if (_currentTick >= _startTick && _currentTick < _endTick) {


    amount0 = getAmount0(
      _currentPrice,
      sqrtPriceFromTick(_endTick),
      _liquidity
    );
    amount1 = getAmount1(
      sqrtPriceFromTick(_startTick),
      _currentPrice,
      _liquidity
    );
  } else if (_currentTick >= _endTick) {
    console.log("Tick > _endTick");
    amount0 = 0;
    amount1 = getAmount1(
      sqrtPriceFromTick(_startTick),
      sqrtPriceFromTick(_endTick),
      _liquidity
    );
  } else if (_currentTick < _startTick) {
    console.log("Tick < _endTick");

    amount1 = 0;
    amount0 = getAmount0(
      sqrtPriceFromTick(_startTick),
      sqrtPriceFromTick(_endTick),
      _liquidity
    );
  }
  return [amount0, amount1];
}

//Get next price from token 1 amount always rounding down
export function getNextPriceFromAmount1(currentPrice, liquidity, amount) {
  let priceChange = (BigInt(amount) << 96n) / BigInt(liquidity);
  return BigInt(currentPrice) + priceChange / 10n ** 18n;
}

export function getNextPriceFromAmount0(currentPrice, liquidity, amount) {
  amount = BigInt(amount);
  currentPrice = BigInt(currentPrice);
  if (amount == 0n) return currentPrice;
  const numerator1 = BigInt(liquidity) << 96n;
  const product = amount * currentPrice;
  const denominator = numerator1 + product;

  return (numerator1 * currentPrice) / denominator;
}
