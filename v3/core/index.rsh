'reach 0.1';
//'use strict';
// ^ We don't use this because of dynamic typing.
const verifyArithmetic = false;
// ^ Too expensive in verification and execution time
// ^ We don't know if it passes either
const checkTheBigOne = false;
// ^ Makes verification take a lot longer, but it does work.

// General tools
const MToken = Maybe(Token);
const MInt = Maybe(UInt);
const min = (a, b) => (a < b) ? a : b;
const max = (a, b) => (a > b) ? a : b;
const checkV = verifyArithmetic ? check : ((...args) => { void args; });
const chkAdd = (a, b) => { checkV((UInt.max - a) >= b); return a + b; };
const chkSub = (a, b) => { checkV(a >= b); return a - b; };
const chkMul = (a, b, f = checkV) => {
  f(a <= UInt.max / (b == 0 ? 1 : b));
  return a * b;
};
const chkMulDiv = (x, y, z) => {
  checkV(z != 0);
  if ( verifyArithmetic ) { verifyMuldiv(x, y, z); }
  return muldiv(x, y, z);
};

// Humble library
const ProtocolInfo = Struct([
  ['protoFee', UInt],
  ['lpFee', UInt],
  ['totFee', UInt],
  ['protoAddr', Address],
  ['locked', Bool],
]);
const PS = ProtocolInfo.fromObject;

// We define a structure for talking about pairs of balances
const Bals = Struct([
  ['A', UInt],
  ['B', UInt],
]);
const BS = Bals.fromObject;
// These allow use to inject a single side into the structu
const az = (B) => ({A: 0, B});
const bz = (A) => ({A, B: 0});
const abz = {A: 0, B: 0};
// We use the structure for the liquidity pool tokens too, but we don't want to
// use the keys A and B in the code there, because that would be confusing.
// Instead, we use the names below and these functions are projections to and
// from the names we prefer and the A/B names. The R one "reads", so it
// projects _from_ and the W one "writes", so it projects _to_.
const lptBalsR_ = (lptBals) => ({ lpHeld: lptBals.A, lpMinted: lptBals.B });
const lptBalsW_ = ({lpHeld, lpMinted}) => ({ A: lpHeld, B: lpMinted });
// We define some helper functions for working with balances at the same time.
const balsF2 = (F) => (b1, b2) => ({
  A: F(b1.A, b2.A),
  B: F(b1.B, b2.B),
});
const balsAdd = balsF2(chkAdd);
const balsSub = balsF2(chkSub);
const balsLte = (b1, b2) => (
  b1.A <= b2.A
  && b1.B <= b2.B
);
const balsMulDiv = (x, {A, B}, z) => ({
  A: chkMulDiv(x, A, z),
  B: chkMulDiv(x, B, z),
});
const computeK = ({A, B}) => (UInt256(A) * UInt256(B));

const feePrecision = 10_000;
const invFees = ({protoFee, lpFee, totFee}) => (
  protoFee < 100
  && lpFee < 100
  && totFee == lpFee + protoFee
  && totFee < 100
  && totFee > 0
);
const chkFees = (x) => check(invFees(x));
const ProtocolInfoInv = Refine(ProtocolInfo, invFees);

const TRI = 3;
const ProtocolI = {
  register: Fun([Contract, MToken, Token], ProtocolInfoInv),
};
const PoolI = {
  Protocol_harvest: Fun([Address, ProtocolInfoInv], Tuple(Bals, UInt)),
};
export const triumvirate = Reach.App(() => {
  const Triumvirs = Array(Address, TRI);
  const Admin = Participant('Admin', {
    triumvirs: Triumvirs,
    ready: Fun([], Null),
  });
  const Command = Data({
    NoOp: Null,
    NewTriumvirs: Triumvirs,
    NewInfo: ProtocolInfo,
    Harvest: Tuple(Contract, MToken, Token, Address),
    Rewards: Address,
    Kill: Null
  });
  const noop = Command.NoOp();
  const Triumvir = API('Triumvir', {
    propose: Fun([Command], Null),
    support: Fun([UInt, Command], Null),
  });
  const Protocol = API(ProtocolI);
  const N = Events({
    Register: [ Contract, MToken, Token ],
    Propose: [ Address, Command ],
    Support: [ Address, UInt, Command ],
  });
  const Info = Struct([
    ['triumvirs', Triumvirs],
    ['cmds', Array(Command, TRI)],
    ['protoInfo', ProtocolInfo],
  ]);
  const V = View({ 'Info': Fun([], Info) });
  init();
  Admin.only(() => {
    const triumvirs0 = declassify(interact.triumvirs);
  });
  Admin.publish(triumvirs0);
  const info0 = {
    protoFee: 5,
    lpFee: 25,
    totFee: 30,
    protoAddr: getAddress(),
    locked: false,
  };
  Admin.interact.ready();
  const cmds0 = Array.replicate(TRI, noop);
  const [ done, triumvirs, cmds, info ] =
    parallelReduce([ false, triumvirs0, cmds0, info0 ])
    .define(() => {
      V.Info.set(() => Info.fromObject({
        triumvirs,
        cmds,
        protoInfo: PS(info),
      }));
      const invCmd = (x) => x.match({
        NewInfo: invFees,
        default: (_) => true,
      });
      const chkCmd = (x) => check(invCmd(x));
      const invCmds = () => cmds.all(invCmd);
      const chkTriumvir = (who) => {
        const midx = triumvirs.indexOf(who);
        check(isSome(midx), "not triumvir");
        return fromSome(midx, 0);
      };
      const evalCommand = (cmd) => cmd.match({
        NoOp: () => [ false, triumvirs, info ],
        NewTriumvirs: (triumvirsP) => [ false, triumvirsP, info ],
        NewInfo: (infoP) => [ false, triumvirs, ProtocolInfo.toObject(infoP) ],
        Harvest: ([ctc, tokAM, tokB, recvr]) => {
          const pool = remote(ctc, PoolI);
          const go = (tokAs) => {
            const assets = [ ...tokAs, tokB ];
            const fees = assets.length + 1;
            const _ = pool.Protocol_harvest.ALGO({
              fees, assets
            })(recvr, PS(info));
          };
          switch (tokAM) {
            case Some: go([tokAM]);
            case None: go([]);
          }
          return [ false, triumvirs, info ];
        },
        Rewards: (recvr) => {
          const rewards = getUntrackedFunds();
          transfer(rewards).to(recvr);
          return [ false, triumvirs, info ];
        },
        Kill: () => [ true, triumvirs, info ],
      });
    })
    .invariant(balance() == 0 && invFees(info) && invCmds())
    .while( ! done )
    .api_(Protocol.register, (ctc, tokAM, tokB) => {
      const ctcAddr = this;
      check(Contract.addressEq(ctc, ctcAddr), "not contract");
      return [ 0, (k) => {
        k(PS(info));
        N.Register(ctc, tokAM, tokB);
        return [ false, triumvirs, cmds, info ];
      }];
    })
    .api_(Triumvir.propose, (cmd) => {
      check(invCmd(cmd), "invalid command");
      const idx = chkTriumvir(this);
      const cmdsP = cmds.set(idx, cmd);
      return [ 0, (k) => {
        k(null);
        N.Propose(this, cmd);
        return [ false, triumvirs, cmdsP, info ];
      }];
    })
    .api_(Triumvir.support, (oth, ecmd) => {
      check(oth < triumvirs.length, "illegal idx");
      const idx = chkTriumvir(this);
      check(oth != idx, "cannot support self");
      const cmd = cmds[oth];
      check(ecmd == cmd, "command switched");
      const cmdsP = cmds.set(oth, noop);
      return [ 0, (k) => {
        k(null);
        N.Support(this, oth, cmd);
        const [ doneP, triumvirsP, infoP ] = evalCommand(cmd);
        return [ doneP, triumvirsP, cmdsP, infoP ];
      }];
    })
    .timeout(false);
  commit();
  exit();
});

const calcAmtOut = (amtIn, reserveIn, reserveOut, totFee) => {
  const tenK_b = UInt256(feePrecision);
  const reserveOut_b = UInt256(reserveOut);
  const reserveIn_b = UInt256(reserveIn);
  const amtInFee_b = UInt256(amtIn) * UInt256(feePrecision - totFee);
  const reserveInScaled_b = reserveIn_b * tenK_b;
  const reserveInPFee_b = reserveInScaled_b + amtInFee_b;
  const yesFeeOut_b = (amtInFee_b * reserveOut_b) / reserveInPFee_b;
  // This guy is the most important theorem... this is ensure that we won't
  // crash when computing fees
  if ( checkTheBigOne ) {
    assert(yesFeeOut_b <= UInt256(UInt.max));
  }
  return UInt(yesFeeOut_b);
}

// Proof that this function produces the correct `amtIn` needed:
// https://docs.google.com/spreadsheets/d/1jAGg5XsfJsyv8YNfVQs4OTaPzYGfhc6UI02o0O8GIBk/edit?usp=sharing
// The `+ 1` on `yesFeeIn` is needed because natural numbers get rounded down.
// This addition prevents people from paying less than an `amtOut` is worth.
const calcAmtIn = (amtOut, reserveOut, reserveIn, totFee) => {
  const reserveOutP_b = UInt256(reserveOut - amtOut);
  const reserveIn_b = UInt256(reserveIn);
  const amtOutFee_b = UInt256(amtOut) * UInt256(feePrecision + totFee);
  const resOutPFee_b = reserveOutP_b * UInt256(feePrecision);
  const yesFeeIn_b = (amtOutFee_b * reserveIn_b) / resOutPFee_b;
  // This guy is the most important theorem... this is ensure that we won't
  // crash when computing fees
  if ( checkTheBigOne ) {
    assert(yesFeeIn_b <= UInt256(UInt.max - 1));
  }
  const yesFeeIn = UInt(yesFeeIn_b) + 1;
  return yesFeeIn;
}

export const calcAmtIn_ = is(calcAmtIn, Fun([UInt, UInt, UInt, UInt], UInt));

const computeAmtInAndOut = (amtIn, mExactOut, reserveIn, reserveOut, totFee, isView) => {
  return mExactOut.match({
    Some: (amtOut) => {
      const yesFeeIn = calcAmtIn(amtOut, reserveOut, reserveIn, totFee);
      if (not(isView)){
        check(amtIn >= yesFeeIn, "provided enough funds to receive amt out");
      }
      return [ yesFeeIn, amtOut, isView ? 0 : amtIn - yesFeeIn ];
    },
    None: () => {
      const yesFeeOut = calcAmtOut(amtIn, reserveIn, reserveOut, totFee);
      return [ amtIn, yesFeeOut, 0 ];
    }
  });
}

const computeSwap1 = (amtIn, mExactOut, reserveIn, reserveOut, protoInfo, isView) => {
  const { protoFee, totFee } = protoInfo;

  // Figure out the amount with a fee
  const [ yesFeeIn, yesFeeOut, leftoverIn ] =
    computeAmtInAndOut(amtIn, mExactOut, reserveIn, reserveOut, totFee, isView);

  // Not using MulDiv, because we know everything is small
  const protoFeePct = chkMul(protoFee, 100, assert) / totFee;
  assert(protoFeePct <= 100);

  const calcProtoFee_ = (amt) => chkMulDiv(amt, protoFeePct, 100);

  const reserveInP = chkAdd(reserveIn, yesFeeIn);
  // Turn an "in" amt to an "out" amount using the new exchange rate.
  const inToOutNew = (xIn) => chkMulDiv(xIn, reserveOut, reserveInP);
  // Compute the no-fee swap based on the NEW exchange rate
  // ... so this is LIKE doing the computation with the fees set to 0
  const noFeeOut = inToOutNew(yesFeeIn);
  // We subtract yesFee from the noFee to get the Fee, rather than trying to
  // compute the fee directly so that we don't lose any money with rounding
  const feeOut = chkSub(noFeeOut, yesFeeOut);
  const protoFeeOut = calcProtoFee_(feeOut);
  // We know that this will not overflow because protoFee is small
  const protoFeeIn = chkMulDiv(yesFeeIn, protoFee, 10000);
  // Normalize the fees to the same unit
  const protoFeeInNormal = inToOutNew(protoFeeIn);
  const protoFeeOutNormal = protoFeeOut

  // The protocol gets whatever fee is worth more
  const poolToProto =
    protoFeeInNormal > protoFeeOutNormal ?
      [ protoFeeIn, 0 ] :
      [ 0, protoFeeOut ];

  return [ yesFeeOut, leftoverIn, poolToProto, yesFeeIn ];
};
const computeSwap = (AforB, normalIn, mExactOut, poolBals, protoInfo, isView) => {
  const { A:  inA, B:  inB } = normalIn;
  const { A: balA, B: balB } = poolBals;
  if ( AforB ) {
    check(inB == 0);
    const [ outB, leftOverA, [ poolToProtoA, poolToProtoB ], yesFeeIn ] =
      computeSwap1(inA, mExactOut, balA, balB, protoInfo, isView);
    return [ { A: leftOverA, B: outB }, { A: poolToProtoA, B: poolToProtoB } , yesFeeIn];
  } else {
    check(inA == 0);
    const [ outA, leftOverB, [ poolToProtoB, poolToProtoA ], yesFeeIn] =
      computeSwap1(inB, mExactOut, balB, balA, protoInfo, isView);
    return [ { A: outA, B: leftOverB }, { A: poolToProtoA, B: poolToProtoB }, yesFeeIn ];
  }
};
export const computeSwap_ =
  is((a4b, x, y, z) => {
    check(UInt.max > feePrecision);
    const [a, b, _] = computeSwap(a4b, x, MInt.None(), y, z, false);
    return [BS(a), BS(b)];
  }, Fun([Bool, Bals, Bals, ProtocolInfoInv], Tuple(Bals, Bals)));

// Calculates how many LP tokens to mint
const computeMint = (inBs, poolBals, lptBals) => {
  const { A: inA, B: inB } = inBs;
  const { lpMinted } = lptBalsR_(lptBals);
  if (lpMinted == 0) {
    const inA_b = UInt256(inA);
    const inB_b = UInt256(inB);
    const sqr = inA_b * inB_b;
    const mint_b = sqrt(sqr);
    // inA_b could be UInt.max and so could inB_b
    // So, then this must be UInt.max or smaller.
    const mint = UInt(mint_b);
    return mint;
  } else {
    const { A: balA, B: balB } = poolBals;
    const mintA = chkMulDiv(inA, lpMinted, balA);
    // mintA = (inA/balA) * lpMinted
    // ^ The percentage of how much is already there
    const mintB = chkMulDiv(inB, lpMinted, balB);
    return min(mintA, mintB);
  }
};
export const computeMint_ =
  is(computeMint, Fun([Bals, Bals, Bals], UInt));

const swap = (usesNetwork) => Reach.App(() => {
  const Provider = API('Provider', {
    withdraw: Fun([UInt, Bals], Bals),
    deposit: Fun([Bals, UInt], UInt),
  });
  const TokenA = usesNetwork ? Null : Token;
  const Admin = Participant('Admin', {
    tokA: TokenA,
    tokB: Token,
    ltName: Bytes(32),
    ltSymbol: Bytes(8),
    signalPoolCreation: Fun([Token], Null),
    proto: Contract,
  });
  const Swap = Fun([UInt, UInt], Bals);
  const SwapPreview = Fun([UInt], UInt);
  const Trader = API('Trader', {
    swapAForB: Swap,
    swapBForA: Swap,
    exactSwapAForB: Swap,
    exactSwapBForA: Swap,
  });
  const Protocol = API({
    ...PoolI,
    Protocol_delete: Fun([], Null),
  });
  const Info = Struct([
    ['liquidityToken', Token],
    ['lptBals', Bals],
    ['poolBals', Bals],
    ['protoInfo', ProtocolInfo],
    ['protoBals', Bals],
    ['tokB', Token],
    ['tokA', MToken],
  ]);
  const V = View({
    'Info': Fun([], Info),
    'v_swapAForB': SwapPreview,
    'v_swapBForA': SwapPreview,
    'v_exactSwapAForB': SwapPreview,
    'v_exactSwapBForA': SwapPreview,
  });
  const N = Events({
    Harvest: [ ProtocolInfo ],
    Withdraw: [ Address, UInt, Bals, Bals, Bals ],
    Deposit: [ Address, Bals, UInt, Bals, Bals ],
    Swap: [ Address, Bals, Bals, Bals ],
  });
  setOptions({ verifyArithmetic });
  init();

  const checkInput = ({tokA, tokB}) => {
    check(UInt.max > feePrecision);
    check(usesNetwork ? true : (tokA != tokB));
  };
  Admin.only(() => {
    const tokB = declassify(interact.tokB);
    const tokA = declassify(interact.tokA);
    const ltName   = declassify(interact.ltName);
    const ltSymbol = declassify(interact.ltSymbol);
    const proto = declassify(interact.proto);
  });
  Admin.publish(tokA, tokB, ltName, ltSymbol, proto)
    .check(() => { checkInput({tokA, tokB}); });
  const tokA_t = usesNetwork ? [] : [tokA];
  const tokAM = usesNetwork ? MToken.None() : MToken.Some(tokA);
  const initialProtoInfo = remote(proto, ProtocolI)
    .register(getContract(), tokAM, tokB);
  const initialBals = { A: 0, B: 0 };
  const totalSupply = UInt.max;
  const initialLptBals = lptBalsW_({ lpHeld: totalSupply, lpMinted: 0 });
  const pool = new Token({
    name: ltName, symbol: ltSymbol, supply: totalSupply
  });
  const payExpr = (lp, a, b, r = 0) =>
    usesNetwork ?
      [ a+r, [lp, pool], [ b, tokB ]]
      : [ r, [lp, pool], [ a, tokA ], [ b, tokB ]];
  const payExprBals = ({A, B}, r = 0) => payExpr(0, A, B, r);
  Admin.interact.signalPoolCreation(pool);

  const [ done, poolBals, lptBals, protoInfo, protoBals ] =
    parallelReduce([
      false, initialBals, initialLptBals, initialProtoInfo, initialBals
    ])
    .define(() => {
      V.Info.set(() => Info.fromObject({
        liquidityToken: pool,
        lptBals: BS(lptBals),
        poolBals: BS(poolBals),
        protoInfo: PS(protoInfo),
        protoBals: BS(protoBals),
        tokA: tokAM,
        tokB,
      }));
      const zero = ({A, B}) => A == 0 && B == 0;
      const isLocked = () => protoInfo.locked;
      const lptBalsR = () => lptBalsR_(lptBals);
      const lpMod = (hf, mf) => (lp) => {
        const { lpHeld, lpMinted } = lptBalsR();
        return lptBalsW_({
          lpHeld: hf(lpHeld, lp),
          lpMinted: mf(lpMinted, lp),
        });
      };
      const lpIn = lpMod(chkAdd, chkSub);
      const lpOut = lpMod(chkSub, chkAdd);
    })
    .invariant((() => {
      const { lpHeld, lpMinted } = lptBalsR();
      return (
        implies(! usesNetwork, balance() == 0)
        && pool.supply() == totalSupply
        && ! pool.destroyed()
        && totalSupply == lpHeld + lpMinted
        && balance(pool) == lpHeld
        && balance(...tokA_t) == poolBals.A + protoBals.A
        && balance(tokB) == poolBals.B + protoBals.B
        && invFees(protoInfo)
        && implies(done, isLocked() && lpMinted == 0 && zero(poolBals) && zero(protoBals))
      );
    })())
    .while( ! done )
    .paySpec(usesNetwork ? [ pool, tokB ] : [ pool, tokA, tokB ])
    .api_(Protocol.Protocol_harvest, (recvr, protoInfoP) => {
        check(this == protoInfo.protoAddr, "Thou art not the Protocol");
        chkFees(protoInfoP);
        const protoBalsP = initialBals;
        const { lpMinted } = lptBalsR();
        const doneP = protoInfoP.locked && lpMinted == 0 && zero(poolBals);
        return [ payExpr(0, 0, 0), (k) => {
          const rewards = getUntrackedFunds();
          transfer(payExprBals(protoBals, rewards)).to(recvr);
          k([ BS(protoBals), rewards ]);
          N.Harvest(PS(protoInfoP));
          return [ doneP, poolBals, lptBals, protoInfoP, protoBalsP ];
        } ];
    })
    .api_(Provider.withdraw, (lp, outsl) => {
      const { lpMinted } = lptBalsR();
      const out = balsMulDiv(lp, poolBals, lpMinted);
      check(outsl.A <= out.A, "slippage A");
      check(outsl.B <= out.B, "slippage B");
      const lptBalsP = lpIn(lp);
      const poolBalsP = balsSub(poolBals, out);
      return [ payExpr(lp, 0, 0), (k) => {
        transfer(payExprBals(out)).to(this);
        k(BS(out));
        N.Withdraw(this, lp, BS(out), BS(poolBalsP), BS(lptBalsP));
        return [ false, poolBalsP, lptBalsP, protoInfo, protoBals ];
      }];
    })
    .api_(Provider.deposit, (inBs, lpl) => {
      check(! isLocked(), 'locked');
      const lp = computeMint(inBs, poolBals, lptBals);
      check(lpl <= lp, "slippage");
      const poolBalsP = balsAdd(inBs, poolBals);
      const lptBalsP = lpOut(lp);
      const who = this;
      return [ payExprBals(inBs), (k) => {
        transfer(payExpr(lp, 0, 0)).to(this);
        k(lp);
        N.Deposit(who, BS(inBs), lp, BS(poolBalsP), BS(lptBalsP));
        return [ false, poolBalsP, lptBalsP, protoInfo, protoBals ];
      }];
    })
    .define(() => {
      const calcSwap = (AforB, normalIn, normalOutL, mExactOut, isView = false) => {
        check(! isLocked(), 'locked');
        const poolBalsOrig = poolBals;
        const [ normalOut, poolToProto, _ ] =
          computeSwap(AforB, normalIn, mExactOut, poolBalsOrig, protoInfo, isView);
        // `who` paid into the pool
        const poolBalsAfterIn = balsAdd(poolBalsOrig, normalIn);
        // `who` got paid from the pool
        const poolBalsAfterOut = balsSub(poolBalsAfterIn, normalOut);
        // The protocol collects a fee, but that doesn't concern `who`.
        //
        // Imagine that Alice walks up to Bob and Claire. Alice gives Bob $10.
        // Bob and Claire give Alice 200 pesos and she walks away. Eve comes up
        // and makes them give her $1 or 10 pesos... Alice doesn't care.
        const poolBalsAfterProtoFee = balsSub(poolBalsAfterOut, poolToProto);
        const protoBalsAfterProtoFee = balsAdd(protoBals, poolToProto);

        const protoBalsP = protoBalsAfterProtoFee;
        const poolBalsP = poolBalsAfterProtoFee;

        // Ensure that the slippage constraint is met... compare what they
        // actually get to the lower bound.
        check(balsLte( normalOutL, normalOut ), "slippage");

        // Ensure that the pool ratio is preserved
        const oldK = computeK(poolBals);
        const newK = computeK(poolBalsP);
        // An old version did:
        //  x * y' >= x * y
        //  x * y' >= max(x,y) * min(x,y)     // either x = y or one is bigger
        //  (x * y') / max(x,y) >= min(x,y)   // div by max to reduce bits
        // We do it more directly
        check(newK >= oldK, "constant product");
        return [ normalOut, poolBalsP, protoBalsP ];
      }
      const doSwap = (AforB, normalIn, normalOutL, mExactOut, who) => {
        const [ normalOut, poolBalsP, protoBalsP ] = calcSwap(AforB, normalIn, normalOutL, mExactOut);
        return (k) => {
          transfer(payExprBals(normalOut)).to(who);
          k(BS(normalOut));
          N.Swap(who, BS(normalIn), BS(normalOut), BS(poolBalsP));
          return [ false, poolBalsP, lptBals, protoInfo, protoBalsP ];
        };
      };
      V.v_swapAForB.set((a) => {
        const [ balOut, _, _ ] = calcSwap(true, bz(a), abz, MInt.None(), true);
        return balOut.B;
      });
      V.v_swapBForA.set((b) => {
        const [ balOut, _, _ ] = calcSwap(false, az(b), abz, MInt.None(), true);
        return balOut.A;
      });
      V.v_exactSwapAForB.set((eb) => {
        const [ _, _, yesFeeIn ] = computeSwap(true, abz, MInt.Some(eb), poolBals, protoInfo, true);
        return yesFeeIn;
      });
      V.v_exactSwapBForA.set((ea) => {
        const [ _, _, yesFeeIn ] = computeSwap(false, abz, MInt.Some(ea), poolBals, protoInfo, true);
        return yesFeeIn;
      });
    })
    .api_(Trader.swapAForB, (a, ol) => {
      const c = doSwap(true, bz(a), az(ol), MInt.None(), this);
      return [ payExpr(0, a, 0), (k) => c(k) ];
    })
    .api_(Trader.swapBForA, (b, ol) => {
      const c = doSwap(false, az(b), bz(ol), MInt.None(), this);
      return [ payExpr(0, 0, b), (k) => c(k) ];
    })
    .api_(Trader.exactSwapAForB, (a, eb) => {
      const c = doSwap(true, bz(a), abz, MInt.Some(eb), this);
      return [ payExpr(0, a, 0), (k) => c(k) ];
    })
    .api_(Trader.exactSwapBForA, (b, ea) => {
      const c = doSwap(false, az(b), abz, MInt.Some(ea), this);
      return [ payExpr(0, 0, b), (k) => c(k) ];
    })
    .timeout(false);
  commit();

  const [ [], k ] = call(Protocol.Protocol_delete);
  k(null);
  pool.burn(totalSupply);
  pool.destroy();
  commit();
  exit();
});

export const net_tok = swap( true);
export const tok_tok = swap(false);

export const main = Reach.App(() => {
  init();
});
