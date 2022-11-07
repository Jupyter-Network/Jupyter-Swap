class Pool {
  activeTick = 0;
  ticks = [];
  map = 0;
  init() {
    for (let i = 0; i < 100000; i++) {
      let r = Math.random()
      this.ticks.push(
        new Tick(
          Math.random() * 100,
          Math.pow(1.0001, i / 2),
          (r * 10) % 2 == 0 ? false : true
        )
      );
      this.map = (r * 10) % 2 == 0 ? this.map :  this.map | (1 << i);
     
    }
  }
  getTickState(_tick) {
    return this.ticks[_tick];
  }
  swapXtoY(_amountIn, _startTick, _limitTick) {
    let remainingInput = _amountIn;
    let amountOut = 0;
    this.activeTick = _startTick;
    while (remainingInput > 0) {
      if (
        remainingInput / this.ticks[this.activeTick].sqrtPrice <=
        this.ticks[this.activeTick].liquidity
      ) {
        //Swap inside Tick
        console.log("Swap Inside");
        const deltaY = remainingInput / this.ticks[this.activeTick].sqrtPrice;

        amountOut += deltaY;
        remainingInput = 0;
      } else {
        //Cross tick
        console.log("Cross Tick");
        const deltaX =
          this.ticks[this.activeTick].liquidity *
          this.ticks[this.activeTick].sqrtPrice;
        const deltaY =
          this.ticks[this.activeTick].liquidity /
          this.ticks[this.activeTick].sqrtPrice;
        console.log(this.activeTick, " DX: ", deltaX, " DY: ", deltaY);
        amountOut += deltaY;
        remainingInput -= deltaX;
        this.activeTick = this.getNextInitializedTick(this.activeTick,10).tick;
      }
    }
    console.log(amountOut, Math.pow(this.ticks[_startTick].sqrtPrice, 2));
  }
  getNextInitializedTick(_start, _tickSpacing) {
    return findNextTick(_start, _tickSpacing);
  }
  findNextTick(_tick, _tickSpacing) {
    let compressed = Math.floor(_tick / _tickSpacing);
  
    let mask = ~((1 << _tick) - 1);
    console.log(mask.toString(2));
    let masked = this.map & mask;
  
    return (compressed + 1 + GetLowestBitPos(masked) - _tick) * _tickSpacing;
  }
}
class Tick {
  liquidity;
  sqrtPrice;
  initialized;
  constructor(_liquidity, _sqrtPrice, _initialized) {
    this.liquidity = _liquidity;
    this.sqrtPrice = _sqrtPrice;
    this.initialized = _initialized;
  }
}

let p = new Pool();
p.init();
console.log(p.getTickState(10));

console.log(p.findNextTick(100));
//p.swapXtoY(3000, 10000, 1000000);


function GetLowestBitPos(value) {
  if (value & 1) return 1;
  if (value & 2) return 2;
  if (value & 4) return 3;
  if (value & 8) return 4;
  if (value & 16) return 5;
  if (value & 32) return 6;
  if (value & 64) return 7;
  if (value & 128) return 8;
  if (value & 256) return 9;
  if (value & 512) return 10;
  if (value & 1024) return 11;
  if (value & 2048) return 12;
  if (value & 4096) return 13;
  if (value & 8192) return 14;
  if (value & 16384) return 15;
  if (value & 32768) return 16;
  if (value & 65536) return 17;
  if (value & 131072) return 18;
  if (value & 262144) return 19;
  if (value & 524288) return 20;
  if (value & 1048576) return 21;
  if (value & 2097152) return 22;
  if (value & 4194304) return 23;
  if (value & 8388608) return 24;
  if (value & 16777216) return 25;
  if (value & 33554432) return 26;
  if (value & 67108864) return 27;
  if (value & 134217728) return 28;
  if (value & 268435456) return 29;
  if (value & 536870912) return 30;
  if (value & 1073741824) return 31;
  return 0; // no bits set
}

function tickPosition(_tick) {
  let word = _tick >> 8;
  let bit = _tick % 256;
  return [word, bit];
}
