'reach 0.1';

const mkOpts = (nnA, nnB) => Struct([
  ["tokA", nnA ? Token : Null],
  ["tokB", nnB ? Token : Null],
  ["amtA", UInt],
  ["amtB", UInt],
  ["ctcAnnouncer", Contract],
]);

const checkOpts = (nnA, nnB, tokA, tokB) => {
  check(tokA != tokB);
  check(nnA == (tokA != null));
  check(nnB == (tokB != null));
  const mkPay = (nn, tok) => nn ? (amt => [[amt, tok]]) : (amt => [amt]);
  return {
    payA: mkPay(nnA, tokA),
    payB: mkPay(nnB, tokB),
  };
};

const MToken = Maybe(Token);
const mtoken = a => a == null ? MToken.None() : MToken.Some(a);
//                    deployer, ctcLO,    tokA,   tokB,   amtA, amtB
const AnnouncerArgs = [Address, Contract, MToken, MToken, UInt, UInt];

// Provides "a" and wants "b"
// nn = "non-network"
const limitOrder = (nnA, nnB) => Reach.App(() => {
  const Opts = mkOpts(nnA, nnB);
  const D = Participant('D', {
    ready: Fun([], Null),
    opts: Opts,
  });
  const A = API({
    SwapViaPool: Fun([Contract, Bool, UInt, UInt], Null),
    Cancel: Fun([], Null),
  });
  const V = View({ opts: Opts });
  init();

  D.only(() => {
    const opts = declassify(interact.opts);
    const { tokA, tokB, amtA, amtB, ctcAnnouncer } = opts;
    void checkOpts(nnA, nnB, tokA, tokB);
  });
  D.publish(opts, tokA, tokB, amtA, amtB, ctcAnnouncer);
  const { payA, payB } = checkOpts(nnA, nnB, tokA, tokB);
  commit();

  D.pay(payA(amtA));
  D.interact.ready();
  V.opts.set(opts);
  remote(ctcAnnouncer, { announceLimitOrder: Fun(AnnouncerArgs, Null) })
    .announceLimitOrder(
      D,
      getContract(),
      mtoken(tokA),
      mtoken(tokB),
      amtA,
      amtB
    );
  commit();

  fork()
    .api_(A.SwapViaPool, (poolCtc, aForB, giveA, minProfitB) => {
      check(giveA <= amtA, "giveA <= amtA");
      return [k => {
        k(null);
        const Bals = Struct([['A', UInt], ['B', UInt]]);
        const Swap = Fun([UInt, UInt], Bals);
        const pool = remote(poolCtc, {
          Trader_swapAForB: Swap,
          Trader_swapBForA: Swap,
        });

        const doSwap = swapFn => {
          if (nnB) {
            const [net, [recvB], _] = swapFn
              .ALGO({
                apps: [poolCtc],
                simTokensRecv: [amtB],
              })
              .pay(payA(giveA))
              .withBill([tokB])
              (giveA, amtB);
            enforce(net == 0, "net == 0");
            return recvB;
          } else {
            const [recvB, _] = swapFn
              .ALGO({
                apps: [poolCtc],
                simNetRecv: amtB,
              })
              .pay(payA(giveA))
              .withBill()
              (giveA, amtB);
            return recvB;
          }
        }

        const recvB = aForB
          ? doSwap(pool.Trader_swapAForB)
          : doSwap(pool.Trader_swapBForA);


        enforce(recvB >= amtB, "recvB >= amtB");
        const botProfitA = amtA - giveA;
        const botProfitB = recvB - amtB;
        enforce(botProfitB >= minProfitB, "botProfitB >= minProfitB");

        transfer(payA(botProfitA)).to(this);
        transfer(payB(botProfitB)).to(this);
        transfer(payB(amtB)).to(D);
      }];
    })
    .api_(A.Cancel, () => {
      check(this == D);
      return [k => {
        k(null);
        transfer(payA(amtA)).to(D);
      }];
    });
  commit();
});

export const lo_net_tok = limitOrder(false, true);
export const lo_tok_net = limitOrder(true, false);
export const lo_tok_tok = limitOrder(true, true);

// Centralized contract for limit orders to advertise to bots
export const announcer = Reach.App(() => {
  //            ctcLO,    tokA,         tokB,         amtA, amtB
  const D = Participant('D', { ready: Fun([], Null) });
  const A = API({ announceLimitOrder: Fun(AnnouncerArgs, Null) });
  const E = Events({ LimitOrder: AnnouncerArgs });
  init();

  D.publish();
  D.interact.ready();
  const _ = parallelReduce(null)
    .while(true)
    .invariant(balance() == 0)
    .api_(A.announceLimitOrder, (deployer, ctcLO, tokA, tokB, amtA, amtB) => {
      check(tokA != tokB, "Disallow identical tokens (invalid limit orders)");
      return [k => {
        k(null);
        E.LimitOrder(deployer, ctcLO, tokA, tokB, amtA, amtB);
      }];
    });
  commit();
});

// EvilSwap is Humble's rival which is happy to take your tokens
// and pretend that it traded you something back.
const evil_swap = nnA => Reach.App(() => {
  const Bals = Struct([
    ['A', UInt],
    ['B', UInt],
  ]);
  const Swap = Fun([UInt, UInt], Bals);

  const D = Participant('D', {
    tokA: nnA ? Token : Null,
    ready: Fun([], Null),
  });
  const Trader = API('Trader', {
    swapAForB: Swap,
    swapBForA: Swap,
  });
  init();

  D.only(() => { const tokA = declassify(interact.tokA); });
  D.publish(tokA);
  D.interact.ready();
  commit();

  const payA = nnA ? amt => [[amt, tokA]] : amt => amt;

  fork()
    .api_(Trader.swapAForB, (amtA, wantB) => {
      return [payA(amtA), k => {
        k(Bals.fromObject({ A: 0, B: wantB }));
      }];
    })
    .api_(Trader.swapBForA, (amtA, wantB) => {
      return [payA(amtA), k => {
        k(Bals.fromObject({ A: 0, B: wantB }));
      }];
    });
  commit();

  closeTo(D, () => { }, nnA ? payA(balance(tokA)) : []);
});

export const evil_swap_net = evil_swap(false);
export const evil_swap_tok = evil_swap(true);
