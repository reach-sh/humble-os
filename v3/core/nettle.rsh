'reach 0.1';

// I need to pay in USDC but I only have Zork
// I want to trade my Zork for ALGO, then ALGO to USDC
// I need to give somebody a fixed amount of USDC
// I need to figure out the ALGO → USDC, then the Zork → ALGO
const Bals = Struct([
  ['A', UInt],
  ['B', UInt],
]);
const Swap = Fun([UInt, UInt], Bals);
const SwapPreview = Fun([UInt], UInt);

const PoolI = {
  // Views
  v_exactSwapAForB: SwapPreview,
  v_exactSwapBForA: SwapPreview,
  // Actual Methods
  Trader_exactSwapAForB: Swap,
  Trader_exactSwapBForA: Swap,
};

export const main = Reach.App(() => {
  const A = Participant('Alice', {
    tokA : Token,
    tokB : Token,
    // General amt in that should cover the costs, rest is refunded
    aIn: UInt,
    // Amt we need to give to someone
    bNeeded: UInt,
    // Who will receive the funds
    receiver: Address,
    aNetPoolCtc: Contract,
    bNetPoolCtc: Contract,
  });
  init();
  A.only(() => {
    const TokA = declassify(interact.tokA);
    const TokB = declassify(interact.tokB);
    const aIn = declassify(interact.aIn);
    const bNeeded = declassify(interact.bNeeded);
    const receiver = declassify(interact.receiver);
    const aNetPoolCtc = declassify(interact.aNetPoolCtc);
    const bNetPoolCtc = declassify(interact.bNetPoolCtc);
  });
  A.publish(TokB, TokA, bNeeded, aIn, receiver, aNetPoolCtc, bNetPoolCtc)
    .check(() => { check(TokB != TokA); check(bNeeded > 0); });
  commit();

  A.pay([ [ aIn, TokA ] ]);
  commit();
  A.publish();

  const aPool = remote(aNetPoolCtc, PoolI);
  const bPool = remote(bNetPoolCtc, PoolI);

  const zBill = [ 0, [ 0, TokA ] ];
  const simView = (p) => ({
    simReturnVal: p,
    simNetRecv: 0,
    simTokensRecv: [ 0 ],
  })

  // Call views to figure out how much ALGO and TokA is needed
  // We want to receive `bNeeded` out, figure out how much algo we'd need to trade
  const algoNeeded =
    bPool.v_exactSwapAForB
      .bill(zBill)
      .ALGO(simView(0))
      (bNeeded);
  const aNeeded =
    aPool.v_exactSwapBForA
      .bill(zBill)
      .ALGO(simView(aIn))
      (algoNeeded);
  enforce(aIn >= aNeeded, "Did not provide enough to receive needed ALGO");

  // Call aPool contract to recv ALGO for TokA
  void(aPool.Trader_exactSwapBForA
                    .pay([ [ aNeeded, TokA ] ])
                    .bill(algoNeeded)
                    .ALGO({ simNetRecv: algoNeeded })
                    (aNeeded, algoNeeded));

  // Call bPool contract to receive TokB for ALGO
  void(bPool.Trader_exactSwapAForB
                    .pay(algoNeeded)
                    .bill([ [ bNeeded, TokB ] ])
                    .ALGO({ simTokensRecv: [ bNeeded ] })
                    (algoNeeded, bNeeded));

  transfer([ [ bNeeded, TokB] ]).to(receiver);
  transfer([ balance(), [ balance(TokA), TokA ], [ balance(TokB), TokB] ]).to(A);

  commit();

})
