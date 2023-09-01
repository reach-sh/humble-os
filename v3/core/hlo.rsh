'reach 0.1';
import {
  HasDisconnect, Swap, Cancel, Get,
  nTok, checkOpts
} from './limitOrder.rsh';

const Bals = Struct([
  ['A', UInt],
  ['B', UInt],
]);
const HSwap = Fun([UInt, UInt], Bals);
const Humble = {
  swapAforB: HSwap,
  swapBforA: HSwap,
};
const mkOpts = (fromNet, toNet) => Struct([
  ["tokA", nTok(fromNet)],
  ["tokB", nTok(toNet)],
  ["pool", Contract],
  ["a4b", Bool],
]); // XXX reduce duplication
// accepts A, uses a humble pool to swap it for B, then pays out B
const humbleFulfillerAB = (fromNet, toNet) => Reach.App(() => {
  const Opts = mkOpts(fromNet, toNet);
  const D = Participant('D', {...HasDisconnect, opts: Opts});
  const A = API({Swap, Cancel, Get});
  const V = View({opts: Opts});
  init();
  D.only(() => {
    const opts = declassify(interact.opts);
    const {tokA, tokB} = opts;
    void checkOpts(fromNet, toNet, tokA, tokB);
  });
  D.publish(opts, tokA, tokB);
  D.interact.disconnect();
  const {pool, a4b} = opts;
  V.opts.set(opts);
  const {payA, payB, balA, balB} = checkOpts(fromNet, toNet, tokA, tokB);
  const p0 = [...payA(0), ...payB(0)];
  commit();
  fork()
  .api_(A.Swap, (a, b) => {
    const pa = payA(a);
    const pb = payB(b);
    return [[...pa, ...pb], (k) => {
      if (a4b) {
        void remote(pool, Humble).swapAforB.pay(pa).bill(pb)(a, b);
      } else {
        void remote(pool, Humble).swapBforA.pay(pa).bill(pb)(a, b);
      }
      transfer(pb).to(this);
      k(null);
      // XXX only do it if I can get a cut
    }];
  })
  .api_(A.Cancel, () => {
    return [p0, (k) => { k(null); }];
  });
  commit();
  const [_, k] = call(A.Get);
  transfer(payA(balA())).to(D);
  transfer(payB(balB())).to(D);
  k(null);
  commit();
});
export const hf_tok_tok = humbleFulfillerAB(false, false);
