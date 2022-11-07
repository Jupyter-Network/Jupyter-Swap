totalFees = 0;

class Position {
  l; //liquidity
  ep; //entry point
  epl; //entry point liquidity
  enter(l, ep, epl) {
    this.l = l;
    this.ep = ep;
    this.epl = epl;
  }
}

class Tick {
  l = 0; //liquidity
  f = 0; //fees
  w = 0; //Wraps

  addFees(amount) {
    this.f += amount;
    //let max = 1000;
    //let newTotal = this.f + amount;
    //if (newTotal > max) {
    //  this.f = newTotal - max;
    //} else {
    //  this.f = newTotal;
    //}
  }
}

let t = new Tick();
let p = new Position();
let p1 = new Position();

//t.addFees(20);
p.enter(100, t.f, t.l);
t.l = 100;
t.addFees(50);

p1.enter(900, t.f, t.l);
t.l = 1000;
t.addFees(50);
t.addFees(50);
t.addFees(100);

t;
p;
p1;

console.log((p.l / (p.epl - t.l)) * (t.f - p.ep));
console.log((p1.l / t.l) * (t.f - p1.ep));
console.log((p.l / t.l) * (t.f - p.ep));
console.log(p.l - p.epl);

calcFee(p);
calcFee(p1);

function calcFeesSpan(p) {}

function calcFee(pos) {
  if (pos.epl === 0) {
    return ((t.f - pos.ep) * ((t.l - pos.l) / t.l))
  }
  return (t.f - pos.ep) * (pos.l / t.l);//(pos.l / pos.epl);
  
}

function assert(a, err) {
  if (!a) console.log(err);
}

console.log(calcFee(p1));
console.log(calcFee(p));

assert(calcFee(p) == 60, "P receives wrong amount");


let ticks = [
  {l:10,ln:-10},
  {l:5,ln:5}
]

