import { promises as fs } from 'fs';
import { loadStdlib, test } from '@reach-sh/stdlib';
const { chk, chkErr } = test;
import * as libBackend from './build/index.main.mjs';
import * as netBackend from './build/index.net_tok.mjs';
import * as tokBackend from './build/index.tok_tok.mjs';
import * as daoBackend from './build/index.triumvirate.mjs';
import * as limitOrder from './limitOrder.mjs';
import * as nettleBackend from './build/nettle.main.mjs';
import * as staker from "./staker.mjs"

console.log('Started');

// Initialize
const stdlib = loadStdlib({ ...process.env, REACH_NO_WARN: 'Y' });
const conn = stdlib.connector;
const { T_Null, T_UInt, T_Tuple, T_Object, T_Data, T_Address, T_Token, T_Contract, T_Bool, T_Struct } = stdlib;
const bn = stdlib.bigNumberify;
const conDecimals = (conn == 'ALGO') ? 6 : 18;
const fmt = (x) => stdlib.formatCurrency(x, (conn == 'ALGO') ? 6 : 18);
const setGas = (acc) => { if (conn !== 'ALGO') { acc.setGasLimit(5_000_000); } };
const pc = stdlib.parseCurrency;
const bz = bn(0);
const um = stdlib.reachStdlib.UInt_max;
const [ exports, chkExport ] = test.makeChkExport(stdlib, libBackend);
const { computeSwap_, computeMint_, calcAmtIn_ } = exports;
const mil = 1e6;
const defAddr = T_Address.canonicalize('0x0');
const bMin = (x, y) => x.lt(y) ? y : x;

const defaultFees = { protoFee: 5, lpFee: 25, totFee: 30, protoAddr: defAddr, locked: false };
const calcFee = (amtIn, balIn, balOut, actOut) => {
  let fee = undefined;
  const num = amtIn.mul(balOut);
  const den = balIn.add(amtIn);
  try {
    const valueOut = num.toNumber() / den.toNumber();
    const fee_ = valueOut - actOut.toNumber();
    // When the contract calculates the amtOut, any fractional values will be floored.
    // When a small trade occurs, the fee is a fraction of 1.
    // So, the amtOut would be fractional, floored, and the fee would be rounded up to 1.
    // This is a workaround to get accurate reporting because BigNumbers don't support fractions.
    fee =  (fee_ < 1) ? bn(1) : bn(fee_);
  } catch (_) {
    const valueOut = num.div(den);
    const fee_ = valueOut.sub(actOut);
    fee = fee_.eq(0) ? bn(1) : fee_;
  }
  return fee;
}

test.one('getMinIn', () => {
  const getMinIn = (balIn, balOut) => {
    // Simulate ceiling with add 1
    return balIn.mul(10_000).div(balOut.sub(1)).div(9_975).add(1);
  }
  const chkGetMinIn = (args, expected) => {
    chk('getMinIn', getMinIn(...args.map(bn)), bn(expected));
  }
  chkGetMinIn([100, 10], 12);
  chkGetMinIn([10, 100], 1);
  chkGetMinIn([100_000, 1_000], 101);
});

const ui = (x) => Uint8Array.from(x);
const choose = (ethOrCfx, algo) => {
  return ({ ETH: bn(ethOrCfx), CFX: bn(ethOrCfx), ALGO: bn(algo) }[conn]);
}
const within = (act, exp, diff) => exp.sub(act).abs().lte(diff);

// Unit tests
chkExport('computeMint_', (chkf, chkfErr) => {
  // This computation of `sqr` is what frontends should do
  const aN = ([A, B]) =>
    [{A, B}, {A: bn(0), B: bn(0)}, {A: um, B: bn(0)}];

  chkf(aN([ bn(20), bn(200) ]), bn(63));
  chkf(aN([ bn(100), bn(100) ]), bn(100));
  chkf(aN([ bn(14), bn(10) ]), bn(11));
  chkf(aN([ bn(65_000), bn(20_000) ]), bn(36_055));

  const aO = ([A, B], [pA, pB], m) =>
    [{A, B}, {A: pA, B: pB}, {A: um.sub(m), B: m}];
  chkf(aO([ bn(20), bn(200) ], [ bn(100), bn(100) ], bn(100)), bn(20));
  chkf(aO([ bn(0), bn(200) ], [ bn(100), bn(100) ], bn(100)), bn(0));
  chkf(aO([ bn(1), bn(200) ], [ bn(100), bn(100) ], bn(100)), bn(1));
  chkf(aO([ bn(25), bn(200) ], [ bn(100), bn(100) ], bn(100)), bn(25));
  chkf(aO([ bn(20), bn(100) ], [ bn(100), bn(100) ], bn(100)), bn(20));
  chkf(aO([ bn(200), bn(200) ], [ bn(100), bn(100) ], bn(100)), bn(200));

  // Really big numbers
  chkf(aN([ um, um ]), um);
  chkf(aN([ um.sub(1), um.sub(1) ]), um.sub(1));
  chkf(aO([ um.sub(100), bn(100) ], [ bn(100), bn(100) ], bn(100)), bn(100));
  chkf(aO([ bn(100), um.sub(100) ], [ bn(100), bn(100) ], bn(100)), bn(100));
  chkf(aO([ bn(20), bn(100) ], [ um.sub(100), um.sub(100) ], um.sub(100)), bn(20));

  chkf(aO([ 2.5*mil, 100*mil ], [ 50*mil, 50*mil ], 50*mil), bn(2.5*mil));
});

chkExport('computeSwap_', (chkf, chkfErr) => {
  const protoInfo = defaultFees;
  const aA = (inA, [A, B]) =>
    [ true, { A: inA, B: bn(0) }, { A, B }, protoInfo ];
  const rA = (outB, [A, B]) =>
    [ {A: bn(0), B: outB}, { A, B } ];
  const aB = (inB, [B, A]) =>
    [ false, { A: bn(0), B: inB }, { A, B }, protoInfo ];
  const rB = (outA, [B, A]) =>
    [ {A: outA, B: bn(0)}, { A, B } ];

  const chkF = (dom, rng) => {
    chkf(aA(...dom), rA(...rng));
    chkf(aB(...dom), rB(...rng));
  };

  chkF([ bn(10), [ bn(100), bn(100) ] ],
       [ bn(9), [ bn(0), bn(0) ] ]);

  chkF([ bn(1), [ bn(1_000), bn(100) ] ],
       [ bn(0), [ bn(0), bn(0) ] ]);
  chkF([ bn(10), [ bn(1_000), bn(100) ] ],
       [ bn(0), [ bn(0), bn(0) ] ]);
  chkF([ bn(100), [ bn(1_000), bn(100) ] ],
       [ bn(9), [ bn(0), bn(0) ] ]);
  chkF([ bn(1_000), [ bn(1_000), bn(100) ] ],
       [ bn(49), [ bn(0), bn(0) ] ]);

  chkF([ bn(1), [ bn(100), bn(1_000) ] ],
       [ bn(9), [ bn(0), bn(0) ] ]);
  chkF([ bn(10), [ bn(100), bn(1_000) ] ],
       [ bn(90), [ bn(0), bn(0) ] ]);
  chkF([ bn(100), [ bn(100), bn(1_000) ] ],
       [ bn(499), [ bn(0), bn(0) ] ]);

  chkF([ bn(10), [ um.sub(10), um.sub(10) ] ],
       [ bn(9), [ bn(0), bn(0) ] ]);
  chkF([ bn(10), [ um.sub(10), um ] ],
       [ bn(9), [ bn(0), bn(0) ] ]);

  chkF([ bn(10), [ bn(10), um ] ],
       [ bn('0x7fcec62f6e5fa1a6'), [ bn(0), bn('0x07e04a54bd7fbc') ] ]);
  chkF([ bn(10), [ um.sub(10), bn(100) ] ],
       [ bn(0), [ bn(0), bn(0) ] ]);
  chkF([ bn(10_000), [ um.sub(10_000), um ] ],
       [ bn(9970), [ bn(5), bn(0) ] ]);

  chkF([ bn(10), [ um.sub(10), bn(10_000) ] ],
       [ bn(0), [ bn(0), bn(0) ] ]);
  chkF([ bn(10), [ um.sub(10), bn('10000000000000000000') ] ],
       [ bn(5), [ bn(0), bn(0) ] ]);
});

// End-to-end tests
const T_Maybe = ty => T_Data({ None: T_Null, Some: ty })
const None = ['None', null];
const Some = (x) => ['Some', x];
const stdTys = [T_UInt, T_UInt, T_UInt];
const apiNum = 3;
const prNum = 738;
const tagDep = `Provider_deposit0_${prNum}`;
const tagWit = `Provider_withdraw0_${prNum}`;
const tagSA = `Trader_swapAForB0_${prNum}`;
const tagSB = `Trader_swapBForA0_${prNum}`
const tagESA = `Trader_exactSwapAForB0_${prNum}`;
const tagESB = `Trader_exactSwapBForA0_${prNum}`;
const tagH = `Protocol_harvest0_${prNum}`;
const tyBals = T_Struct([['A', T_UInt], ['B', T_UInt]]);
const tyDepArgs = [tyBals, T_UInt];
const tyDep = T_Tuple(tyDepArgs);
const tyWitArgs = [T_UInt, tyBals];
const tyWit = T_Tuple(tyWitArgs);
const tySwapArgs = [T_UInt, T_UInt];
const tySA = T_Tuple(tySwapArgs);
const tySB = T_Tuple(tySwapArgs);
const tyExactSwapArgs = [T_UInt, T_UInt];
const tyESA = T_Tuple(tyExactSwapArgs);
const tyESB = T_Tuple(tyExactSwapArgs);
const tyProtocolInfo = T_Struct([
  ['protoFee', T_UInt],
  ['lpFee', T_UInt],
  ['totFee', T_UInt],
  ['protoAddr', T_Address],
  ['locked', T_Bool],
]);
const tyHArgs = [T_Address, tyProtocolInfo];
const tyH = T_Tuple(tyHArgs);
const apiUis = {
  [tagDep]: 626735584,
  [tagWit]: 3794731225,
  [tagESA] : 1854553950,
  [tagESB] : 3487219383,
  [tagSA] : 2699621785,
  [tagSB] : 2091154360,
  [tagH] : 681198702,
}
const mkApiTys = ({tyDep, tyWit, tySA, tySB, tyH}) => ([
  ...stdTys,
  T_Data({
    [tagDep]: tyDep,
    [tagWit]: tyWit,
    [tagESA]: tyESA,
    [tagESB]: tyESB,
    [tagSA]: tySA,
    [tagSB]: tySB,
    [tagH]: tyH
  })
]);
const apiTys = mkApiTys({ tyDep, tyWit, tySA, tySB, tyH });

const createCmd = async ({ useNetwork, id, opts, chkErr_this }) => {
  const { tokAOpts, tokBOpts } = opts;

  const startBal = pc(200);
  const backend = useNetwork ? netBackend : tokBackend;

  const testAccs = await stdlib.newTestAccounts(8, startBal);
  testAccs.forEach(setGas);
  const [ accAdmin, ...triumvirs ] = testAccs;
  const [ accCaesar, accCrassus, accPompey, accOctavian, accAntony, accLepidus, accChristus ] = triumvirs;

  const ctcAdmin_tri = accAdmin.contract(daoBackend);
  await stdlib.withDisconnect(() =>
    ctcAdmin_tri.p.Admin({
      ready: stdlib.disconnect,
      triumvirs: [
        accCaesar,
        accCrassus,
        accPompey,
      ]
    })
  );
  const protoCtcInfo = await ctcAdmin_tri.getInfo();
  const protoAttach = (acc) => acc.contract(daoBackend, protoCtcInfo);
  const [ ctcCaesar, ctcCrassus, ctcPompey, ctcOctavian, ctcAntony, ctcLepidus, ctcChristus ] = triumvirs.map(protoAttach);

  const newTok = (name, sym, opts={}) => stdlib.launchToken(accAdmin, name, sym, opts);

  const zmd = !useNetwork && await newTok("zorkmid", "ZMD", tokAOpts);
  const tokA = useNetwork ? null : zmd.id;
  const tokAM = useNetwork ? ['None',null] : ['Some',tokA];
  const gil = await newTok("gil", "GIL", tokBOpts);
  const tokB = gil.id;
  const ctcAdmin = accAdmin.contract(backend);

  const LPToken = await stdlib.withDisconnect(async () => {
    await ctcAdmin.p.Admin({
      tokA, tokB,
      ltName: 'HUMBLE LP - ZMD/GIL',
      ltSymbol: 'HMBL1LT',
      proto: protoCtcInfo,
      signalPoolCreation: stdlib.disconnect,
    });
    throw new Error('impossible');
  });

  const ctcInfo = await ctcAdmin.getInfo();
  console.log(id, 'deployed', { ctcInfo });

  const getPoolInfo = () => cmd.vs.Info();

  const getBals = async () => {
    const { poolBals: {A, B} } = await getPoolInfo();
    return [A, B];
  };
  const getProBals = async () => {
    const { protoBals: {A, B} } = await getPoolInfo();
    return [A, B];
  };
  const getActBals = async () => {
    const [ balA, balB ] = await getBals();
    const [ proBalA, proBalB ] = await getProBals();
    return [ balA.add(proBalA), balB.add(proBalB) ];
  }

  const rawSend = (acc) => async (go) => {
    const ctcAppID = stdlib.bigNumberToNumber(ctcInfo);

    const ALGO = stdlib;
    const { algosdk } = ALGO;
    const params = await ALGO.getTxnParams('');
    const thisAcc = acc.networkAccount;
    const from = thisAcc.addr;
    const mkAppR = (xtraFees, args, assets, makeAppF = algosdk.makeApplicationNoOpTxn) => {
      const t = makeAppF(
        from, params, ctcAppID, args,
        undefined, undefined, assets.map(stdlib.bigNumberToNumber),
      );
      const before = t.fee;
      t.fee += ALGO.MinTxnFee * xtraFees;
      console.log('mkAppR', before, xtraFees, t.fee);
      return t;
    };
    const mkAppB = (xtraFees, args, xtraAssets = [], makeAppF = algosdk.makeApplicationNoOpTxn) => {
      const assets = (tokA ? [tokA] : []).concat([ LPToken, tokB ]).concat(xtraAssets);
      return mkAppR(xtraFees, args, assets, makeAppF);
    };
    const mkApp = (xtraFees, tys, args, xtraAssets = [], makeAppF = algosdk.makeApplicationNoOpTxn) => {
      return mkAppB(xtraFees, tys.map((ty, i) => ty.toNet(args[i])), xtraAssets, makeAppF);
    };
    let i = 0;
    const mkPay = (amt, tok) => {
      const ctcAddr = algosdk.getApplicationAddress(ctcAppID);
      const t = ALGO.makeTransferTxn(from, ctcAddr, amt, tok, params, undefined, i++);
      t.fee = 0;
      return t;
    };
    const rtxns = await go({ mkAppB, mkAppR, mkApp, mkPay });
    algosdk.assignGroupID(rtxns);
    const wtxns = rtxns.map(ALGO.toWTxn);
    await ALGO.signSendAndConfirm( thisAcc, wtxns );
  };
  const outLab = (isAForB) => (isAForB ? 'B' : 'A');
  // This function is basically what the frontend will do
  const computeSwap = async (isAForB, amt) => {
    const { protoInfo, poolBals } = await getPoolInfo();
    const [ inA, inB ] = isAForB ? [ amt, bn(0) ] : [ bn(0), amt ];
    const [ out, balsP ] = computeSwap_(isAForB, { A: inA, B: inB }, poolBals, protoInfo);
    return out[outLab(isAForB)];
  };
  const computeInRequired = async (isAForB, out) => {
    const { protoInfo, poolBals } = await getPoolInfo();
    const [ resIn, resOut ] = isAForB ? [ poolBals.A, poolBals.B ] : [ poolBals.B, poolBals.A ];
    return calcAmtIn_(out, resOut, resIn, protoInfo.totFee);
  }

  const accs = [...testAccs];

  const newAcc = async (label, bal = startBal, doMint = true) => {
    bal = bn(bal);
    const acc = await stdlib.newTestAccount(bal.mul(10));
    accs.push(acc);
    await acc.setDebugLabel(label);
    setGas(acc);
    const addTok = async (tok) => {
      if ( ! tok ) { return; }
      await acc.tokenAccept(tok.id);
      if ( doMint ) { await tok.mint(acc, bal); }
    };
    await addTok(zmd);
    await addTok(gil);
    await acc.tokenAccept(LPToken);

    const ctc = acc.contract(backend, ctcInfo);
    const vs = ctc.unsafeViews;
    const ap = ctc.a.Provider;
    const at = ctc.a.Trader;
    const makeBal = (tok) => () => stdlib.balanceOf(acc, tok);
    const balN = makeBal(null);
    const balA = makeBal(tokA);
    const balB = makeBal(tokB);
    const balL = makeBal(LPToken);

    const computeDeposit = async (amtA, amtB, mLpl) => {
      if (mLpl) {
        return mLpl;
      }
      const { lptBals, poolBals } = await getPoolInfo();
      return (amtA == bz || amtB == bz)
              ? bz
              : computeMint_({A: amtA, B: amtB}, poolBals, lptBals);
    }
    const depositRaw = async (amtA, amtB, mLpl) => {
      const cm = await computeDeposit(amtA, amtB, mLpl);
      return await ap.deposit([amtA, amtB], cm);
    };
    const deposit = async (amtA, amtB, mLpl) => {
      return await depositRaw(amtA, amtB, mLpl);
    };
    const withdraw = async (amtL, mBalL = undefined) => {
      const balL = (mBalL == undefined) ? await computeWithdraw(amtL) : mBalL;
      const { A, B } = await ap.withdraw(amtL, balL);
      return [ A, B ];
    };
    const makeSwap = (isAForB) => async (amt, expectedOut_) => {
      const which = isAForB ? 'swapAForB' : 'swapBForA';
      const expectedOut = expectedOut_ || slipByPct(await computeSwap(isAForB, amt), 5);
      const out = await at[which](amt, expectedOut);
      return out[outLab(isAForB)];
    };
    const swapAForB = makeSwap(true);
    const swapBForA = makeSwap(false);

    const makeExactSwap = (isAForB) => async (amt, exactOut_) => {
      const which = isAForB ? 'exactSwapAForB' : 'exactSwapBForA';
      const exactOut = exactOut_ || await computeSwap(isAForB, amt);
      const out = await at[which](amt, exactOut);
      return out;
    }

    const exactSwapAForB = makeExactSwap(true);
    const exactSwapBForA = makeExactSwap(false);

    const badSend = async (x, y) => {
      let msg = 'logic eval error';
      let go = x;
      if ( y ) { msg = x; go = y; }
      await chkErr_this('raw', msg, () => rawSend(acc)(go));
    };

    return {
      acc, addTok, ctc,
      balL, balA, balB, balN,
      deposit, depositRaw, withdraw, swapAForB, swapBForA,
      exactSwapAForB, exactSwapBForA,
      rawSend: rawSend(acc), badSend,
    };
  };
  const getK = async () => {
    const [ A, B ] = await getBals();
    return A.mul(B);
  }
  const computeWithdraw = async (lp) => {
    const [ balA, balB ] = await getBals();
    const { lptBals } = await getPoolInfo();
    const lpMinted = lptBals.B;
    return {
      A: stdlib.muldiv(lp, balA, lpMinted),
      B: stdlib.muldiv(lp, balB, lpMinted)
    };
  }

  const cmd = {
    // DAO
    accCaesar, accCrassus, accPompey, accOctavian, accAntony, accLepidus, accChristus,
    ctcCaesar, ctcCrassus, ctcPompey, ctcOctavian, ctcAntony, ctcLepidus, ctcChristus,
    protoCtcInfo,
    // Pool
    accAdmin,
    tokA, tokAM, tokB, tokL: LPToken,
    tokA_mint: zmd.mint,
    tokB_mint: gil.mint,
    newTok, ctcInfo, getK,
    getActBals, getProBals, getBals,
    computeSwap,
    computeInRequired,
    computeWithdraw,
    new: newAcc,
    vs: ctcAdmin.unsafeViews,
    backend, rawSend, accs
  };

  return cmd;
}

const returnToFaucet = async (accs) => {
  const faucet = await stdlib.getFaucet();
  for (const i in accs) {
    const acc = accs[i];
    const bal = await stdlib.balanceOf(acc);
    if (bal.gt(bn(3000000))) { // amount thats well above min fee
      await stdlib.transfer(acc, faucet, bal.sub(3000000));
    }
  }
}

const chkScenario__ = async (useNetwork, id, go, opts={}) => {
  let cnt = 0;
  const mkId = (idt) => `${id}.${cnt++}.${idt}`;
  const chk_this = (idt, a, e, l = {}) => chk(mkId(idt), a, e, { ...l });
  const chkErr_this = (idt, e, f, l = {}) => chkErr(mkId(idt), e, f, { ...l });

  const cmdOpts = { useNetwork, id, opts, chkErr_this };
  const cmd = await createCmd(cmdOpts);

  const result = await go(chk_this, cmd, chkErr_this, cmdOpts);
  await returnToFaucet(cmd.accs);
  return result;
};
const chkScenario_ = async (useNetwork, lab_in, go, opts={}) => {
  const lab = `${lab_in}.${useNetwork ? 'N' : 'T'}`;
  test.one(lab, () => chkScenario__(useNetwork, lab, go, opts));
};

const chkScenario = (lab, go, opts={}) => {
  chkScenario_(true, lab, go, opts);
  chkScenario_(false, lab, go, opts);
};

const chkBals = async (chk, cmd, P, a, b, l) => {
  if ( cmd.tokA ) { chk('bal(A)', bn(await P.balA()), a); }
  chk('bal(B)', bn(await P.balB()), b);
  chk('bal(L)', bn(await P.balL()), l);
}
const setupPool = async (chk, cmd, b1, b2, P) => {
  b1 = bn(b1);
  b2 = bn(b2);
  const max = b1.gt(b2) ? b1 : b2;
  const Creator = P || await cmd.new('P1', max);
  console.log('before D1', {
    N: await Creator.balN(),
    A: await Creator.balA(),
    B: await Creator.balB(),
    L: await Creator.balL(),
    b1, b2,
    addr: Creator.acc.getAddress(),
  });
  const D1 = await Creator.deposit(b1, b2);
  console.log('after D1');
  const minted = stdlib.sqrt256(b1.mul(b2));
  chk('dep', D1, minted);
  await chkBals(chk, cmd, Creator, max.sub(b1), max.sub(b2), minted);
  return minted;
}
const slipByPct = (amt, pct) =>
  pct
    ? amt.mul(100 - pct).div(100)
    : amt;

chkScenario('Null', async (chk, cmd) => {
});

chkScenario('CheckViews', async (chk, cmd) => {
  const { ctcChristus } = cmd;
  console.log(await ctcChristus.unsafeViews.Info());
  console.log(await ctcChristus.e.Register.next());
});

// Every time we check bal(N), it may be wrong because of rewards, so that's
// why !tokA turns off these checks:
chkScenario('New', async (chk, cmd) => {
  const { tokA } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  if ( tokA ) {
    chk('bal(A)', await P1.balA(), b);
  }
  chk('bal(B)', await P1.balB(), b);
});

chkScenario('InOut-Norm', async (chk, cmd) => {
  const { tokA } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const bA = await P1.balA();
  const amt = await P1.deposit(b, b);
  chk('dep', amt, b);
  if ( tokA ) { chk('bal(A)', await P1.balA(), bA.sub(b)); }
  chk('bal(B)', await P1.balB(), bz);
  chk('bal(L)', await P1.balL(), b);
  const get = await P1.withdraw(amt);
  chk('wit', get, [ b, b ]);
  if ( tokA ) { chk('bal(A)', await P1.balA(), bA); }
  chk('bal(B)', await P1.balB(), b);
  chk('bal(L)', await P1.balL(), bz);
});
chkScenario('Deposit-Slippage-Fail', async (chk, cmd) => {
  const b = pc(10);
  const P1 = await cmd.new(`P1`, b);
  const f = () => P1.deposit(b, b, pc(11));
  await chkErr('dep p1', 'slippage', f);
});
chkScenario('Deposit-Slippage-Succ', async (chk, cmd) => {
  const b = pc(10);
  const P1 = await cmd.new(`P1`, b);
  const amt = await P1.deposit(b, b, pc(9));
  chk(`dep slippage`, amt, b);
});
chkScenario('Withdraw-Slippage-Fail', async (chk, cmd) => {
  const b = pc(10);
  const P1 = await cmd.new(`P1`, b);
  const lp = await P1.deposit(b, b);
  const f = () => P1.withdraw(lp, {A: b.add(1), B: b });
  await chkErr('wit p1', 'slippage', f);
});
chkScenario('Withdraw-Slippage-Succ', async (chk, cmd) => {
  const b = pc(10);
  const P1 = await cmd.new(`P1`, b);
  const lp = await P1.deposit(b, b);
  const amts = await P1.withdraw(lp, { A: b.sub(1), B: b.sub(1) });
  chk(`wit slippage`, amts, [b, b]);
});
chkScenario('InOut-Raw1', async (chk, cmd) => {
  const { tokA } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const bA = await P1.balA();
  const pm = stdlib.sqrt256(b.mul(b));
  const amt = await P1.depositRaw(b, b);
  chk('dep', amt, pm);
  if ( tokA ) { chk('bal(A)', await P1.balA(), bA.sub(b)); }
  chk('bal(B)', await P1.balB(), bz);
  chk('bal(L)', await P1.balL(), pm);
  const get = await P1.withdraw(amt);
  chk('wit', get, [ b, b ]);
  if ( tokA ) { chk('bal(A)', await P1.balA(), bA); }
  chk('bal(B)', await P1.balB(), b);
  chk('bal(L)', await P1.balL(), bz);
});
chkScenario('InOut2', async (chk, cmd) => {
  const { tokA } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const P2 = await cmd.new('P2', b);
  const D1 = await P1.deposit(b, b);
  chk('dep', D1, b);
  if ( tokA ) { chk('bal(A)', await P1.balA(), bz); }
  chk('bal(B)', await P1.balB(), bz);
  chk('bal(L)', await P1.balL(), b);
  const D2 = await P2.deposit(b, b);
  chk('dep', D2, b);
  if ( tokA ) { chk('bal(A)', await P2.balA(), bz); }
  chk('bal(B)', await P2.balB(), bz);
  chk('bal(L)', await P2.balL(), b);
  const W2 = await P2.withdraw(D2);
  chk('wit', W2, [ b, b ]);
  if ( tokA ) { chk('bal(A)', await P2.balA(), b); }
  chk('bal(B)', await P2.balB(), b);
  chk('bal(L)', await P2.balL(), bz);
  const W1 = await P1.withdraw(D1);
  chk('wit', W1, [ b, b ]);
  if ( tokA ) { chk('bal(A)', await P1.balA(), b); }
  chk('bal(B)', await P1.balB(), b);
  chk('bal(L)', await P1.balL(), bz);
});
chkScenario('InOut2-Raw1', async (chk, cmd) => {
  const { tokA } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const P2 = await cmd.new('P2', b);
  const b1 = stdlib.sqrt256(b.mul(b));
  const D1 = await P1.depositRaw(b, b);
  chk('dep', D1, b1);
  if ( tokA ) { chk('bal(A)', await P1.balA(), bz); }
  chk('bal(B)', await P1.balB(), bz);
  chk('bal(L)', await P1.balL(), b1);
  const D2 = await P2.deposit(b, b);
  chk('dep', D2, b1);
  if ( tokA ) { chk('bal(A)', await P2.balA(), bz); }
  chk('bal(B)', await P2.balB(), bz);
  chk('bal(L)', await P2.balL(), b1);
  const W2 = await P2.withdraw(D2);
  chk('wit', W2, [ b, b ]);
  if ( tokA ) { chk('bal(A)', await P2.balA(), b); }
  chk('bal(B)', await P2.balB(), b);
  chk('bal(L)', await P2.balL(), bz);
  const W1 = await P1.withdraw(D1);
  chk('wit', W1, [ b, b ]);
  if ( tokA ) { chk('bal(A)', await P1.balA(), b); }
  chk('bal(B)', await P1.balB(), b);
  chk('bal(L)', await P1.balL(), bz);
});
chkScenario('InOut2-Raw1-Flip', async (chk, cmd) => {
  const { tokA } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const P2 = await cmd.new('P2', b);
  const b1 = stdlib.sqrt256(b.mul(b));
  const D1 = await P1.depositRaw(b, b);
  chk('dep', D1, b1);
  if ( tokA ) { chk('bal(A)', await P1.balA(), bz); }
  chk('bal(B)', await P1.balB(), bz);
  chk('bal(L)', await P1.balL(), b1);
  const D2 = await P2.deposit(b, b);
  chk('dep', D2, b1);
  if ( tokA ) { chk('bal(A)', await P2.balA(), bz); }
  chk('bal(B)', await P2.balB(), bz);
  chk('bal(L)', await P2.balL(), b1);
  const W1 = await P1.withdraw(D1);
  chk('wit', W1, [ b, b ]);
  if ( tokA ) { chk('bal(A)', await P1.balA(), b); }
  chk('bal(B)', await P1.balB(), b);
  chk('bal(L)', await P1.balL(), bz);
  const W2 = await P2.withdraw(D2);
  chk('wit', W2, [ b, b ]);
  if ( tokA ) { chk('bal(A)', await P2.balA(), b); }
  chk('bal(B)', await P2.balB(), b);
  chk('bal(L)', await P2.balL(), bz);
});

chkScenario('Reject-DepositOneSide', async (chk, cmd) => {
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const lp = await P1.deposit(b, bz);
});

// Withdraw fails without the contract being involved, because you can't trick
// the network into thinking you have tokens you don't have
chkScenario('Reject-TooBigWithdraw1', async (chk, cmd) => {
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const amt = await P1.deposit(b, b);
  console.log(amt);
  console.log(amt.add(1));
  await chkErr('wit p1', 'add overflow', () => P1.withdraw(amt.add(1)));
});
chkScenario('Reject-TooBigWithdraw2', async (chk, cmd) => {
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const amt = await P1.deposit(b, b);
  const P2 = await cmd.new('P2', b);
  await P2.deposit(b, b);
  const err = (stdlib.connector === 'ALGO') ? 'underflow' : 'error';
  await chkErr('wit p1', err, () => P1.withdraw(amt.add(1)));
});

chkScenario('InTradeOut-aForB', async (chk, cmd) => {
  const { getK } = cmd;
  const b = pc(1_000);
  const P1 = await cmd.new('P1', b);
  const T1 = await cmd.new('T1', b);

  await setupPool(chk, cmd, b, b, P1);
  chk('k1', await getK(), choose('1000000000000000000000000000000000000000000', '1000000000000000000'));

  const aTraded = bn(1_000);
  const bRecv = await T1.swapAForB(aTraded);
  const expRecv = bn(996);
  chk('bRecv', bRecv, expRecv);
  await chkBals(chk, cmd, T1, b.sub(aTraded), b.add(expRecv), bz);
  chk('k2', await getK(), choose('1000000000000000000003999999999999999004000', '1000000003999004000'));

  const W1 = await P1.withdraw(b);
  chk('k3', await getK(), bn(0));
  const bA = b.add(aTraded);
  const bB = b.sub(expRecv);
  chk('wit', W1, [ bA, bB ]);
  await chkBals(chk, cmd, P1, bA, bB, bz);
});
chkScenario('InTradeOut-bForA', async (chk, cmd) => {
  const { getK } = cmd;
  const b = pc(1_000);
  const P1 = await cmd.new('P1', b);
  const T1 = await cmd.new('T1', b);
  await setupPool(chk, cmd, b, b, P1);
  chk('k1', await getK(), choose('1000000000000000000000000000000000000000000', '1000000000000000000'));

  const bTraded = pc(150);
  const aRecv = await T1.swapBForA(bTraded);
  const expRecv = choose('130094384759253620982', 130094384);
  chk('aRecv', aRecv, expRecv);
  chk('k2', await getK(), choose('1000391457526858335870700000000000000000000', '1000326215478800000'));
  await chkBals(chk, cmd, T1, b.add(expRecv), b.sub(bTraded), bz);

  const [ wA, wB ] = await P1.withdraw(b);
  const [ pA, pB ] = await cmd.getProBals();
  const bA = b.sub(expRecv).sub(pA);
  const bB = b.add(bTraded).sub(pB);
  chk('k3', await getK(), bn(0));
  chk('witA', wA, bA);
  chk('witB', wB, bB);
  await chkBals(chk, cmd, P1, bA, bB, bz);
});
chkScenario('InTrade+Out', async (chk, cmd) => {
  const { getK } = cmd;
  const b = pc(50_000);
  const P1 = await cmd.new('P1', b);
  const T1 = await cmd.new('T1', b);
  const T2 = await cmd.new('T2', b);

  await setupPool(chk, cmd, b, b, P1);
  const k1 = await getK();
  chk('k1', k1, choose('2500000000000000000000000000000000000000000000', '2500000000000000000000'));

  const aTraded = bn(10);
  const bRecv = await T1.swapAForB(aTraded);
  // The ratio of reserves is 1-1 and there is a 0.0025% fee.
  // There is little to no price impact because of how small the trade is.
  const expBRecv = bn(9); // This is rounded down from 9.97
  chk('bRecv', bRecv, expBRecv);
  chk('k2', await getK(), choose('2500000000000000000000049999999999999999999910', '2500000000049999999910'));
  await chkBals(chk, cmd, T1, b.sub(aTraded), b.add(expBRecv), bz);

  const bTraded = pc(2_312);
  const aRecv = await T2.swapBForA(bTraded);
  const expARecv = choose('2203480718425275227653', '2203480719');
  chk('aRecv', aRecv, expARecv);
  await chkBals(chk, cmd, T2, b.add(expARecv), b.sub(bTraded), bz);

  const k3 = await getK();
  chk('k3', k3, choose('2500276263881447501909272370634465827477048787', '2500276263944322930381'));
  chk(`P1's bal is worth more`, k3.gt(k1), true);

  const W1 = await P1.withdraw(b);
  const [ pA, pB ] = await cmd.getProBals();
  const bA = b.sub(expARecv).add(aTraded).sub(pA);
  const bB = b.sub(expBRecv).add(bTraded).sub(pB);
  chk('k4', await getK(), bn(0));
  chk('wit', W1, [ bA, bB ]);
  await chkBals(chk, cmd, P1, bA, bB, bz);
});
chkScenario('InTradeOut-Slippage', async (chk, cmd) => {
  const b = pc(100);
  await setupPool(chk, cmd, b, b);
  const T1 = await cmd.new('T1', b);
  const T2 = await cmd.new('T2', b);

  // T1 wants to trade `1` and will accept slippage of 10%
  const aTraded1 = pc(1);
  const expectedOut = slipByPct(await cmd.computeSwap(true, aTraded1), 10);

  // T2 trades before them to cause the slippage
  const aTraded2 = pc(5);
  const bRecv1 = await T2.swapAForB(aTraded2);
  const expBRecv1 = choose('4748297375815592703', 4748297);
  chk('bRecv1', bRecv1, expBRecv1);

  // T1 continues trading with 10% slippage allowed
  const bRecv2 = await T1.swapAForB(aTraded1, expectedOut);
  const expBRecv2 = choose('895951653305707881', 895951);
  chk('bRecv2', bRecv2, expBRecv2);
  chk('Recv is within slippage tolerance', bRecv2.gt(expectedOut), true);
});
chkScenario('InTradeOut-Slippage-Reject', async (chk, cmd) => {
  const b = pc(100);
  await setupPool(chk, cmd, b, b);
  const T1 = await cmd.new('T1', b);
  const T2 = await cmd.new('T2', b);

  // T1 wants to trade `1` and will accept slippage of 5%
  const aTraded1 = pc(1);
  const expectedOut = slipByPct(await cmd.computeSwap(true, aTraded1), 5);

  // T2 trades before them to cause the slippage
  const aTraded2 = pc(5);
  const bRecv = await T2.swapAForB(aTraded2);
  const expBRecv = choose('4748297375815592703', 4748297);
  chk('bRecv', bRecv, expBRecv);

  // T1 continues trading with 5% slippage and gets rejected
  await chkErr('slippage-reject', 'slippage', () => T1.swapAForB(aTraded1, expectedOut));
});

const chkExactSwap = (isAForB, poolBal, amtIn, amtOut) => {
  const [ b1, b2 ] = Array.isArray(poolBal)
                    ? [ bn(poolBal[0]), bn(poolBal[1]) ]
                    : [ bn(poolBal), bn(poolBal).mul(2) ];
  const name = isAForB ? `exactSwapAForB` : `exactSwapBForA`;
  chkScenario(`${name}-${amtIn}-${amtOut}`, async (chk, cmd) => {
    const b = pc(b1);
    await setupPool(chk, cmd, b1, b2);
    const T1 = await cmd.new(`T1`, b);

    const inRequired = await cmd.computeInRequired(isAForB, amtOut);
    const { A, B } = await T1[name](amtIn, amtOut);
    const actOut = isAForB ? B : A;
    const actLeftover = isAForB ? A : B;
    chk(`Got exact amtOut`, actOut, amtOut)
    chk(`Got left over amtIn`, actLeftover, amtIn.sub(inRequired));
  });
}

await chkExactSwap(true, 50_000, bn(10), bn(15));
await chkExactSwap(true, 10_000_000, bn(8_200), bn(15_000));
await chkExactSwap(true, [166332829, 125124999] , bn(6), bn(4));
await chkExactSwap(true, [10_000, 100_000], bn(1), bn(9));
await chkExactSwap(true, [2_000_000, 6_000_000], bn(3500), bn(7000));
await chkExactSwap(true, [2_000_000, 6_000_000], bn(2344), bn(7000));
await chkExactSwap(false, 50_000, bn(70), bn(30));
await chkExactSwap(false, 10_000_000, bn(10_000), bn(3_500));
await chkExactSwap(false, 10_000_000, bn(10_000), bn(3_500));
await chkExactSwap(false, 10_000_000, bn(55_000), bn(26_263));
await chkExactSwap(false, [1994019, 1000002], bn(2), bn(1));
await chkExactSwap(false, [10_000, 100_000], bn(11), bn(1));

// Check fees made on one exact swap
const chkExactSwapFees = async (isAForB) => {
  const name = isAForB ? `exactSwapAForB` : `exactSwapBForA`;
  chkScenario(`${name}-Fees`, async (chk, cmd) => {
    const { getK } = cmd;
    const b = pc(1_000_000);
    const P = await cmd.new(`P1`, b.mul(10));
    const D = await P.deposit(b, b);
    const k1 = await getK();

    const T = await cmd.new(`T1`, b);
    await T[name](bn(60_000), bn(50_000));

    const [ protoFeesA, protoFeesB ] = await cmd.getProBals();
    const actFee = isAForB ? protoFeesB : protoFeesA;
    const expFee = bn(24); // 50_000 * 0.0005 = 25 but rounding :shrug:
    chk(`proto fee`, actFee, expFee);

    const k2 = await getK();
    chk('k increases', k2.gt(k1), true);
    await P.withdraw(D);
  });
}

chkExactSwapFees(true);
chkExactSwapFees(false);

// Make a trade expecting exactly X out.
// Make an identical pool and show that
// the amount charged will get you the same
// out when using an exactFor swap
const chkForExactAndExactFor_ = async (isAForB, poolBal, amtIn, amtOut, cmp = `eq`) => {
  const [ b1, b2 ] = Array.isArray(poolBal) ? poolBal : [ poolBal, poolBal ];
  const [exactSwapF, swapF] = isAForB ? [`exactSwapAForB`, `swapAForB`] : [`exactSwapBForA`, `swapBForA`];
  chkScenario(`exactFor-forExact-${amtIn}-${amtOut}-${isAForB}`, async (chk, cmd, _, cmdOpts) => {
    const b = pc(10_000_000);
    await setupPool(chk, cmd, b1, b2);
    const T = await cmd.new(`T1`, b);
    const recv  = await T[exactSwapF](amtIn, amtOut);
    const [inBack, out] = isAForB ? [ recv.A, recv.B ] : [ recv.B, recv.A ];
    chk(`Received amtOut from exact swap`, out, amtOut);

    const cmd2 = await createCmd(cmdOpts);
    await setupPool(chk, cmd2, b1, b2);
    const T1 = await cmd2.new(`T1`, b);
    const inNeeded = amtIn.sub(inBack);
    const outRecv = await T1[swapF](inNeeded);
    chk(`Received amtOut from swap`, outRecv[cmp](out), true);
  });
}

const chkForExactAndExactFor = (pb, amtIn, amtOut, cmp) => {
  chkForExactAndExactFor_(true, pb, amtIn, amtOut, cmp);
  chkForExactAndExactFor_(false, pb, amtIn, amtOut, cmp);
}

chkForExactAndExactFor(pc(1_000_000), bn(20), bn(10));
chkForExactAndExactFor(pc(1_000_000), bn(11), bn(10));
chkForExactAndExactFor(pc(1_000_000), bn(120), bn(54));
// This is one of those cases where the `+ 1` in calcAmtIn is needed.
// It takes `1` IN to get `4` out (with no fees).
// However, `swapForExact` will need to charge `2` IN for `4` out. (2 is rounded up from 1.003 IN)
// So when we pay `2 IN` using swapExactFor, we receive more OUT than when we used swapForExact.
chkForExactAndExactFor([pc(200_000), pc(800_000)], bn(17), bn(4), `gte`);
chkForExactAndExactFor([pc(1_000_000), pc(500_000)], bn(300), bn(125));
chkForExactAndExactFor([pc(250_000), pc(2_00_000)], bn(1000), bn(120));

const chkExactSwapReject = async (isAForB) => {
  const name = isAForB ? `exactSwapAForB` : `exactSwapBForA`;
  chkScenario(`${name}-Reject`, async (chk, cmd) => {
    const b = pc(10_000);
    await setupPool(chk, cmd, b, b.mul(2));
    const T1 = await cmd.new(`T1`, b);
    chkErr('reject swap', 'provided enough funds', async () => await T1[name](bn(4), bn(2000)));
  });
}
chkExactSwapReject(true);
chkExactSwapReject(false);

chkScenario(`Nettle`, async (chk, cmd, _, cmdOpts) => {
  // Launch two pools and use the nettle ctc to make
  // an atomic trade from A -> Algo -> B

  // Force useNetwork to create { A - ALGO } pool and { ALGO - B } pool
  const cmd1 = await createCmd({ ...cmdOpts, useNetwork: true });
  const cmd2 = await createCmd({ ...cmdOpts, useNetwork: true });
  const b = pc(1_000);
  await setupPool(chk, cmd1, b, b);
  await setupPool(chk, cmd2, b, b);

  const T = await cmd.new('Receiver', b);
  const N = await cmd.new('Nettle', b);

  const cmds = [ cmd1, cmd2 ];

  const acceptToks = async (acc) => {
    for (const cmd of cmds) {
      await acc.tokenAccept(cmd.tokB);
      await stdlib.transfer(cmd.accAdmin, acc, b, cmd.tokB);
    }
  }
  await acceptToks(T.acc);
  await acceptToks(N.acc);

  const ctcN = N.acc.contract(nettleBackend);

  await nettleBackend.Alice(ctcN, {
    tokA: cmd1.tokB,
    tokB: cmd2.tokB,
    aIn: bn(20),
    bNeeded: bn(5),
    receiver: T.acc.getAddress(),
    aNetPoolCtc: cmd1.ctcInfo,
    bNetPoolCtc: cmd2.ctcInfo,
  });

  const tbBal = await T.acc.balanceOf(cmd2.tokB);
  chk(`Trader got money`, tbBal, b.add(5));
});

const chkDecimals_ = (lab, aD, bD, f) => {
  chkScenario(lab, async (chk, cmd, chkErr) => {
    await f(chk, cmd, chkErr);
  }, { tokAOpts: { decimals: aD }, tokBOpts: { decimals: bD }});
}

const chkDecimals = (aDecimals, bDecimals, info) => {
  chkDecimals_(`Decimal-${aDecimals}-${bDecimals}`, aDecimals, bDecimals, async (chk, cmd) => {
    const { balA, balB, swapAForB, swapBForA } = info;
    const maxBal = balA.gt(balB) ? balA : balB;
    const P1 = await cmd.new('P1', maxBal);
    const D1 = await setupPool(chk, cmd, balA, balB, P1);

    // Subsequent mints work as expected
    const P2 = await cmd.new('P2', maxBal);
    const p2d = [ balA.div(2), balB.div(2) ];
    const D2 = await P2.deposit(p2d[0], p2d[1]);
    console.log({ D1, p2d, D2 });
    chk('D2', D2, D1.div(2));

    const aTraded  = swapAForB.trade;
    const expBRecv = swapAForB.recv;
    const T1 = await cmd.new('T1', maxBal);
    const bRecv = await T1.swapAForB(aTraded);
    chk('bRecv', bRecv, expBRecv);

    const bTraded  = swapBForA.trade;
    const expARecv = swapBForA.recv;
    const T2 = await cmd.new('T2', maxBal);
    const aRecv = await T2.swapBForA(bTraded);
    chk('aRecv', aRecv, expARecv);

    const [ feesA, feesB ] = await cmd.getProBals();

    const W2 = await P2.withdraw(D2);
    const W1 = await P1.withdraw(D1);
    // P2 has 1/3 share of pool. Gets 1/3 of profits
    const expP1BalA = W2[0].mul(2);
    const expP1BalB = W2[1].mul(2);
    chk('W1:a', W1[0].gte(expP1BalA), true);
    chk('W1:b', W1[1].gte(expP1BalB), true);
  });
}

chkDecimals(0, conDecimals, ({
  balA: bn(100),
  balB: bn(100_000),
  swapAForB: {
    trade: bn(5),
    recv: choose('4824', 4824),
  },
  swapBForA: {
    trade: bn(20_000),
    recv: choose('18', 18),
  }
}));

chkDecimals(0, 3, ({
  balA: pc(100_000),
  balB: pc(1_000_000),
  swapAForB: {
    trade: pc(500),
    recv : choose('4968488058020511832343', '4968488058'),
  },
  swapBForA: {
    trade: pc(25_000),
    recv : choose('2467969471019439832430', '2467969471'),
  }
}));

chkDecimals(1, 1, ({
  balA: pc(12_000),
  balB: pc(4_000),
  swapAForB: {
    trade: pc(350),
    recv: choose('114104621790347676570', '114104621'),
  },
  swapBForA: {
    trade: bn(20_000),
    recv: choose('62164', 62164),
  }
}));

chkDecimals_('CalcK-Fails', 0, 0, async (chk, cmd) => {
  // This test used to fail when ctc stored
  // `k = muldiv(balA, balB, conUnitA * conUnitB)`
  const { getK } = cmd;
  const b = stdlib.sqrt256(um);
  const k = b.mul(b);
  const P1 = await cmd.new('P1', b);
  await P1.deposit(b, b);
  chk('K1', await getK(), k);

  const T1 = await cmd.new('T1', b);
  const aTraded = bn(10);
  await T1.swapAForB(aTraded);
  const K2 = await getK();
  // Ctc can hold reserves that produce `k > UInt.max`
  chk('K2', K2.gt(um), true);
});

chkScenario('Adv-Bad-Args0', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  await P1.badSend(({ mkAppB, mkPay }) => {
    return [ mkAppB(0, []) ];
  });
});
chkScenario('Adv-Bad-Args4', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  await P1.badSend(({ mkAppB, mkPay }) => {
    return [ mkAppB(0, [ui([]), ui([]), ui([]), ui([])]) ];
  });
});
chkScenario('Adv-Bad-Ctor', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  await P1.badSend(({ mkApp, mkPay }) => {
    return [ mkApp(0, [T_UInt, T_UInt, T_UInt], [0, 1, 2]) ];
  });
});

chkScenario('Adv-Swap-FeeLow', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokA, tokB } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const P2 = await cmd.new('P2', b);

  // Do a deposit
  const bA = await P1.balA();
  const amt = await P1.deposit(b, b);
  chk('dep', amt, b);
  if ( tokA ) { chk('bal(A)', await P1.balA(), bA.sub(b)); }
  chk('bal(B)', await P1.balB(), bz);
  chk('bal(L)', await P1.balL(), b);

  // Do a swap with the wrong fee
  await P2.badSend('fee too small', async ({ mkApp, mkPay }) => {
    const amtA = pc(1);
    const expectedOut = await cmd.computeSwap(true, amtA);
    return [
      mkPay(amtA, tokA),
      // This first 1 is the thing we're testing... it should be 2, because
      // there's an inner txn that we're not paying for
      mkApp(1, apiTys, [0, apiNum, 0, [tagSA, [amtA, expectedOut]]]),
    ];
  });

  // Do a withdrawl
  const get = await P1.withdraw(amt);
  chk('wit', get, [ b, b ]);
  if ( tokA ) { chk('bal(A)', await P1.balA(), bA); }
  chk('bal(B)', await P1.balB(), b);
  chk('bal(L)', await P1.balL(), bz);
});
chkScenario('Adv-Dep-FeeLow', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokA, tokB } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  await P1.badSend('less than the minimum', ({ mkApp, mkPay }) => {
    const amtA = b; const amtB = b;
    return [
      mkPay(amtA, tokA),
      mkPay(amtB, tokB),
      mkApp(0, apiTys, [0, apiNum, 0, [tagDep, [{A: amtA, B: amtB}, 0]]]),
    ];
  });
});
chkScenario('Adv-Dep-FeeHi', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokA, tokB } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  await P1.rawSend(({ mkApp, mkPay }) => {
    const amtA = b; const amtB = b;
    return [
      mkPay(amtA, tokA),
      mkPay(amtB, tokB),
      // This 4 is "wrong", but we don't reject people spending too much money
      mkApp(4, apiTys, [0, apiNum, 0, [tagDep, [{A: amtA, B: amtB}, 0]]]),
    ];
  });
});
chkScenario('Adv-Dep-TokOrder', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokA, tokB } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  await P1.badSend(({ mkApp, mkPay }) => {
    const amtA = b; const amtB = b;
    return [
      mkPay(amtB, tokB),
      mkPay(amtA, tokA),
      mkApp(3, apiTys, [0, apiNum, 0, [tagDep, [{A: amtA, B: amtB}, 0]]]),
    ];
  });
});
chkScenario('Adv-Dep-TokB2', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokA, tokB } = cmd;
  if ( ! tokA ) { return; }
  const b = pc(50);
  const P1 = await cmd.new('P1', b);
  await P1.badSend(({ mkApp, mkPay }) => {
    const amtA = pc(10); const amtB = pc(10);
    return [
      mkPay(amtA, tokB),
      mkPay(amtB, tokB),
      mkApp(3, apiTys, [0, apiNum, 0, [tagDep, [{A: amtA, B: amtB}, 0]]]),
    ];
  });
});
chkScenario('Adv-Dep-TokC1', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokA, tokB } = cmd;
  if ( ! tokA ) { return; }
  const tokCd = await cmd.newTok('gold', 'GP');
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  await P1.addTok(tokCd);
  const tokC = tokCd.id;
  await P1.badSend('missing from', ({ mkApp, mkPay }) => {
    const amtA = b; const amtB = b;
    return [
      mkPay(amtA, tokC),
      mkPay(amtB, tokB),
      mkApp(3, apiTys, [0, apiNum, 0, [tagDep, [{A: amtA, B: amtB}, 0]]], [tokC]),
    ];
  });
});
chkScenario('Adv-Dep-TokC2', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokA, tokB } = cmd;
  const tokCd = await cmd.newTok('gold', 'GP');
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  await P1.addTok(tokCd);
  const tokC = tokCd.id;
  await P1.badSend('missing from', ({ mkApp, mkPay }) => {
    const amtA = b; const amtB = b;
    return [
      mkPay(amtA, tokA),
      mkPay(amtB, tokC),
      mkApp(3, apiTys, [0, apiNum, 0, [tagDep, [{A: amtA, B: amtB}, 0]]], [tokC]),
    ];
  });
});
chkScenario('Adv-Dep-EncodeWrong', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokA, tokB } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  await P1.badSend(({ mkApp, mkPay }) => {
    const amtA = b; const amtB = b;
    const tyDepBad = T_Tuple([T_UInt]);
    const apiTysBad = mkApiTys({ tyDep: tyDepBad, tyWit, tySA, tySB, tyH });
    return [
      mkPay(amtA, tokA),
      mkPay(amtB, tokB),
      mkApp(3, apiTysBad, [0, apiNum, 0, [tagDep, [amtA]]]),
    ];
  });
});
chkScenario('Adv-Dep-TokenWrong-TokL', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokA, tokL } = cmd;
  const b = pc(20);
  const b1 = pc(10);
  const P1 = await cmd.new('P1', b);
  const lb = await P1.deposit(b1, b1);
  await P1.badSend(({ mkApp, mkPay }) => {
    const amtA = b1;
    const amtB = lb;
    return [
      mkPay(amtA, tokA),
      mkPay(amtB, tokL),
      mkApp(3, apiTys, [0, apiNum, 0, [tagDep, [{A: amtA, B: amtB}, 0]]]),
    ];
  });
});
const advDep = (isAPI) => {
  const lab = isAPI ? `API` : `Raw`;
  chkScenario(`Adv-Dep-${lab}`, async (chk, cmd) => {
    if ( conn !== 'ALGO' ) { return; }
    const { tokA, tokB } = cmd;
    const b = pc(10);
    const P1 = await cmd.new('P1', b);
    await P1.rawSend(({ mkApp, mkPay }) => {
      const amtA = b; const amtB = b;
      const tys  = isAPI ? [T_UInt, ...tyDepArgs] : apiTys;
      const args = isAPI
        ? [apiUis[tagDep], {A: amtA, B: amtB}, 0]
        : [0, apiNum, 0, [tagDep, [{A: amtA, B: amtB}, 0]]]
      return [
        mkPay(amtA, tokA),
        mkPay(amtB, tokB),
        mkApp(3, tys, args),
      ];
    });
  });
}
advDep(true);
advDep(false);

const advWit = (isAPI) => {
  const lab = isAPI ? `API` : `Raw`;
  chkScenario(`Adv-Wit-${lab}`, async (chk, cmd) => {
    if ( conn !== 'ALGO' ) { return; }
    const { tokL } = cmd;
    const b = pc(10);
    const P1 = await cmd.new('P1', b);
    const liquidity = await P1.deposit(b, b);
    const tys = isAPI ? [T_UInt, ...tyWitArgs] : apiTys;
    const args = isAPI
      ? [apiUis[tagWit], liquidity, {A: 0, B: 0}]
      : [0, apiNum, 0, [tagWit, [liquidity, {A: 0, B: 0}]]];
    await P1.rawSend(({ mkApp, mkPay }) => {
      return [
        mkPay(liquidity, tokL),
        mkApp(3, tys, args)
      ]
    });
  });
}
advWit(true);
advWit(false);

chkScenario('Adv-Wit-TokenWrong', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const liquidity = await P1.deposit(b, b);
  const wrongTokL = await cmd.newTok('gold', 'GP');
  await P1.addTok(wrongTokL);
  await P1.badSend('missing from', ({ mkApp, mkPay }) => {
    return [
      mkPay(liquidity, wrongTokL.id),
      mkApp(3, apiTys, [0, apiNum, 0, [tagWit, [liquidity, {A: 0, B: 0}]]])
    ]
  });
});
chkScenario('Adv-Wit-TokenWrong-TokB', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokB } = cmd;
  const b = pc(20);
  const b1 = pc(10);
  const P1 = await cmd.new('P1', b);
  await P1.deposit(b1, b1);
  await P1.badSend(({ mkApp, mkPay }) => {
    return [
      mkPay(b1, tokB.id),
      mkApp(3, apiTys, [0, apiNum, 0, [tagWit, [b1, {A: 0, B: 0}]]])
    ]
  });
});
chkScenario('Adv-Wit-EncodeWrong', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokL } = cmd;
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const liquidity = await P1.deposit(b, b);
  const tyWitBad = T_Tuple([T_Address]);
  const apiTysBad = mkApiTys({ tyWit: tyWitBad, tyDep, tySA, tySB, tyH });
  await P1.badSend(({ mkApp, mkPay }) => {
    return [
      mkPay(liquidity, tokL),
      mkApp(3, apiTysBad, [0, apiNum, 0, [tagWit, [liquidity, {A: 0, B: 0}]]])
    ]
  });
});
const advSwapAForB = (isAPI) => {
  const lab = isAPI ? `API` : `Raw`;
  chkScenario(`Adv-SwapAForB-${lab}`, async (chk, cmd) => {
    if ( conn !== 'ALGO' ) { return; }
    const { tokA } = cmd;
    const b = pc(10);
    await setupPool(chk, cmd, b, b);
    const T1 = await cmd.new('T1', b);
    await T1.rawSend(async ({ mkApp, mkPay }) => {
      const amtA = pc(1);
      const expectedOut = await cmd.computeSwap(true, amtA);
      const tys = isAPI ? [T_UInt, ...tySwapArgs] : apiTys;
      const args = isAPI
        ? [apiUis[tagSA], amtA, expectedOut]
        : [0, apiNum, 0, [tagSA, [amtA, expectedOut]]];
      return [
        mkPay(amtA, tokA),
        mkApp(3, tys, args),
      ]
    });
  });
}
advSwapAForB(true);
advSwapAForB(false);

chkScenario('Adv-SwapAForB-TokenWrong', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const b = pc(10);
  await setupPool(chk, cmd, b, b);
  const T1 = await cmd.new('T1', b);
  const wrongTokA = await cmd.newTok('Gold', 'GP');
  await T1.badSend('missing from', async ({ mkApp, mkPay }) => {
    const amtA = pc(1);
    const expectedOut = await cmd.computeSwap(true, amtA);
    return [
      mkPay(amtA, wrongTokA.id),
      mkApp(3, apiTys, [0, apiNum, 0, [tagSA, [amtA, expectedOut]]]),
    ]
  });
 });

chkScenario('Adv-SwapAForB-EncodeWrong', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokA } = cmd;
  const b = pc(10);
  await setupPool(chk, cmd, b, b);
  const T1 = await cmd.new('T1', b);
  const tySABad = T_Tuple([T_UInt, T_Address]);
  const apiTysBad = mkApiTys({ tyWit, tyDep, tySA: tySABad, tySB, tyH });
  await T1.badSend(async ({ mkApp, mkPay }) => {
    const amtA = pc(1);
    const expectedOut = await cmd.computeSwap(true, amtA);
    return [
      mkPay(amtA, tokA),
      mkApp(3, apiTysBad, [0, apiNum, 0, [tagSA, [amtA, expectedOut]]]),
    ]
  });
});
const advSwapBForA = (isAPI) => {
  const lab = isAPI ? `API` : `Raw`;
  chkScenario(`Adv-SwapBForA-${lab}`, async (chk, cmd) => {
    if ( conn !== 'ALGO' ) { return; }
    const { tokB } = cmd;
    const b = pc(10);
    await setupPool(chk, cmd, b, b);
    const T1 = await cmd.new('T1', b);
    await T1.rawSend(async ({ mkApp, mkPay }) => {
      const amtB = pc(1);
      const expectedOut = await cmd.computeSwap(false, amtB);
      const tys = isAPI ? [T_UInt, ...tySwapArgs]: apiTys;
      const args = isAPI
        ? [apiUis[tagSB], amtB, expectedOut]
        : [0, apiNum, 0, [tagSB, [amtB, expectedOut]]] ;
      return [
        mkPay(amtB, tokB),
        mkApp(3, tys, args),
      ]
    });
  });
}
advSwapBForA(true);
advSwapBForA(false);

chkScenario('Adv-SwapBForA-TokenWrong-TokA', async (chk, cmd) => {
  const { tokA } = cmd;
  if ( conn !== 'ALGO' || tokA == undefined ) { return; }
  const b = pc(10);
  await setupPool(chk, cmd, b, b);
  const T1 = await cmd.new('T1', b);
  await T1.badSend(async ({ mkApp, mkPay }) => {
    const amtB = pc(1);
    const expectedOut = await cmd.computeSwap(false, amtB);
    return [
      mkPay(amtB, tokA.id),
      mkApp(3, apiTys, [0, apiNum, 0, [tagSB, [amtB, expectedOut]]]),
    ]
  });
});
chkScenario('Adv-SwapBForA-TokenWrong-TokC', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const b = pc(10);
  await setupPool(chk, cmd, b, b);
  const T1 = await cmd.new('T1', b);
  const wrongTokB = await cmd.newTok('Gold', 'GP');
  await T1.badSend('missing from', async ({ mkApp, mkPay }) => {
    const amtB = pc(1);
    const expectedOut = await cmd.computeSwap(false, amtB);
    return [
      mkPay(amtB, wrongTokB.id),
      mkApp(3, apiTys, [0, apiNum, 0, [tagSB, [amtB, expectedOut]]]),
    ]
  });
});
chkScenario('Adv-SwapBForA-TokenWrong-TokL', async (chk, cmd) => {
  const { tokL } = cmd;
  if ( conn !== 'ALGO' ) { return; }
  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  await P1.deposit(b, b);
  await P1.badSend(async ({ mkApp, mkPay }) => {
    const amtB = pc(1);
    const expectedOut = await cmd.computeSwap(false, amtB);
    return [
      mkPay(amtB, tokL),
      mkApp(3, apiTys, [0, apiNum, 0, [tagSB, [amtB, expectedOut]]]),
    ]
  });
});
chkScenario('Adv-SwapBForA-EncodeWrong', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokB } = cmd;
  const b = pc(10);
  await setupPool(chk, cmd, b, b);
  const T1 = await cmd.new('T1', b);
  const tySBBad = T_Tuple([T_Address, T_UInt]);
  const apiTysBad = mkApiTys({ tyWit, tyDep, tySA, tySB: tySBBad, tyH });
  await T1.badSend(async ({ mkApp, mkPay }) => {
    const amtB = pc(1);
    const expectedOut = await cmd.computeSwap(false, amtB);
    return [
      mkPay(amtB, tokB),
      mkApp(3, apiTysBad, [0, apiNum, 0, [tagSB, [amtB, expectedOut]]]),
    ]
  });
});

chkScenario('Adv-WrongOpKont', async (chk, cmd) => {
  if ( conn !== 'ALGO' ) { return; }
  const { tokA, tokB } = cmd;
  const b = pc(1_000);
  await setupPool(chk, cmd, b, b);
  const T1 = await cmd.new('T1', b);
  const amt = pc(1);
  const expectedOut = await cmd.computeSwap(true, amt);
  await T1.badSend(({ mkApp, mkPay }) => {
    return [
      mkPay(amt, tokA),
      mkApp(3, apiTys, [0, apiNum, 0, [tagSA, [amt, expectedOut]]], [], stdlib.algosdk.makeApplicationDeleteTxn),
    ]
  });
  await T1.badSend(({ mkApp, mkPay }) => {
    return [
      mkPay(amt, tokA),
      mkApp(3, apiTys, [0, apiNum, 0, [tagSA, [amt, expectedOut]]], [], stdlib.algosdk.makeApplicationCloseOutTxn),
    ]
  });
  await T1.badSend(({ mkApp, mkPay }) => {
    return [
      mkPay(amt, tokB),
      mkApp(3, apiTys, [0, apiNum, 0, [tagSB, [amt, expectedOut]]], [], stdlib.algosdk.makeApplicationOptInTxn),
    ]
  });
});

/**

  TESTS for the following Slack convo:

  Jay: Suppose that the ratio is 1 ZERO to 10 MANY.

    If I have 10 MANY and want to buy 1 ZERO, then if the fee is always in the "other" token,
    that means that the fee will round up to 1 ZERO, so then we'll look for 10+X to make it
    so the MANY I put in is worth the 2 ZERO on the other side, thus I will have to put in
    20 MANY at least to get 1 ZERO and thus my "effective" fee is 50%.

    Is this what we talked about yesterday, do I understand it correct, that the "X" could be 10?

    The alternative is for the fee to sometimes be in the "from" currency, so that I can put
    in 10+X with a smaller X than 10 and have it clear?

    I want the answer to the question to be:
      1. ... it computes X >= 10, you are correct.
      2. ... it computes X = 1, you are wrong.
      3. If 1, here's an idea of how to do it.

  Chris: The fee is in the from currency, in that you can pay `x = 2` (if it were higher liquidity, it’d be `x = 1`).

    You’re not necessarily wrong because x can be in [1, 10] and you’d still get 1 ZERO

  ...

  Jay: If I have 1 ZERO and I want to buy 10 MANY, if the fee is in the "from", then I have
    to put in 2 ZERO but I only get 10 MANY? Or am I "forced" to get 17 MANY? What if I were
    willing to put in 1 ZERO and 3 MANY to get back 10 MANY? (Maybe that is stupid?)

  Chris: 1 Zero gets you 9 MANY, or 2 for ~19 basically. You always get the value of your trade,
    not how much you want out. ...

    The last scenario isn’t supported, not sure it’d make sense because if I wanted 10 MANY and
    already had 3. 1 ZERO would give me 9 MANY and I’d now have 12

  Jay: Very good.

    Why would you get 9 MANY rather than 9.9956 MANY?
    And why would it be 11 MANY rather than 10.1256 MANY?
    I think the answer is that we're assuming a test where the MANY is also a 0-decimal?
    Because if MANY isn't a 0-decimal, we'd want a "small" fee as close to 0.25% or whatever as possible

  Chris: No, ZERO has no decimals, so 1 ZERO is extremely low. With a ratio of 1-10, if MANY is 6 decimal,
    it’d be worth 0.000010 MANY. That’s why’d you have to deposit 0.000011 to get 1 ZERO out.

  Jay: Ah, when we've been saying "10 MANY" this whole time, we've been referring to "10 micro-MANY" not
    to "10 macro-MANY" or "10,000,000" uMANY (if MANY=ALGO)
    So it would really be 11 uMANY and in the case of a 10,000,000 uMANY trade then it might end up being a 10,000,001 uMANY trade

  Chris: Yup
**/

chkDecimals_('Trade-Zero-Many', 0, conDecimals, async (chk, cmd, chkErr) => {
  const b = pc(1000);
  const P1 = await cmd.new('P1', b);
  // Ratio is 1-10
  await P1.deposit(bn(100), bn(1_000));
  const T1 = await cmd.new('T1', b);
  await chkErr('trade-fail', 'slippage', async () => {
    // There are three guards that will make this txn fail:
    //  1. require(expectedOut > 0);
    //  2. require(amtOut > 0);
    //  3. require(amtOut > expectedOut)
    //
    // `expectedOut` would normally be calculated to 0.
    // Let's bypass that to test that the trade fails for `amtOut` being 0.
    await T1.swapBForA(bn(10), bn(1));
  });

  // Test user does not have to trade twice the value of 1 ZERO because of fees
  const bTraded = bn(12); // `x = 2` with regards to slack convo
  const aRecv = await T1.swapBForA(bTraded);
  chk('aRecv', bn(1), aRecv);

  // XXX think about how to represent the fee better in tests.
  // In most cases, it is easy to think about it in terms of the token OUT.
  // For a test like this, it is easy to think about it as "I had to pay 2 more IN to get what amtOut is worth"

  // Test that user gets value of their trade instead of the amount they want (which is less).
  const aTraded = bn(2);
  const bRecv = await T1.swapAForB(aTraded, bn(10));
  chk('bRecv', bn(19), bRecv);

});

/** END Slack Tests */

chkDecimals_('Acorn', conDecimals, 0, async (chk, cmd) => {
  const { getActBals, getProBals } = cmd;
  const b  = pc(100);
  const P1 = await cmd.new('P1', b);
  // 1 ACORN worth 0.001250 ALGO
  const ba = bn(1_000_000);
  const bb = bn(800);
  const D1 = await P1.deposit(ba, bb);
  chk('D1', D1, bn('28284'));

  const T1 = await cmd.new('T1', b);

  // Trade 1 ACORN for 0.001245 ALGO
  const bTraded1 = bn(1);
  const aRecv1 = await T1.swapBForA(bTraded1);
  chk('aRecv1', aRecv1, bn('1244'));

  // Trade 0.002520 ALGO for 2 ACORN
  const aTraded1 = bn(2520)
  const bRecv1 = await T1.swapAForB(aTraded1);
  chk('bRecv1', bRecv1, bn(2));

  // Trade 10 ACORN for 0.012346 ALGO
  const bTraded2 = bn(10);
  const aRecv2 = await T1.swapBForA(bTraded2);
  chk('aRecv2', aRecv2, bn('12340'));

  // Trade 0.25 ALGO for 162 ACORN
  const aTraded2 = bn(250000);
  const bRecv2 = await T1.swapAForB(aTraded2);
  chk('bRecv2', bRecv2, bn('162'));

  const W1 = await P1.withdraw(D1);
  const actBals = await getActBals();
  const proBals = await getProBals();
  console.log({ actBalA: actBals[0].toString(), actBalB: actBals[1].toString() });
  console.log({ proBalA: proBals[0].toString(), proBalB: proBals[1].toString() });
  const fba = bn('1238931');
  const fbb = bn(647);
  chk('W1', W1, [ fba, fbb ]);
  chk('K increase', ba.mul(bb).lt(fba.mul(fbb)), true);

});

const loudDeposit = async (who, P, bA, bB, mLpl) => {
  if ( bA.eq(0) || bB.eq(0) ) { return bz; }
  const lp = await P.deposit(bA, bB, mLpl);
  return lp;
};
const loudWithdraw = async (who, P, lp, mBalL) => {
  const [ bA, bB ] = await P.withdraw(lp, mBalL);
  console.log(`${who}.withdraw`, `${lp}`, '&', `${mBalL}`, `=`, `${bA}`, '&', `${bB}`);
  return [ bA, bB ];
};
const loudSwapAForB = async (who, P, bA) => {
  const bB = await P.swapAForB(bA);
  console.log(`${who}.swapAForB`, `${bA}`, `=`, `${bB}`);
  return bB;
};
const loudSwapBForA = async (who, P, bB) => {
  const bA = await P.swapBForA(bB);
  console.log(`${who}.swapBForA`, `${bB}`, `=`, `${bA}`);
  return bA;
};

chkScenario('Mint2-DDWW', async (chk, cmd) => {
  const { tokA } = cmd;
  const bBig = pc(100);
  const P1 = await cmd.new('P1', bBig);
  const P2 = await cmd.new('P2', bBig);

  const b1 = pc(10);
  const lp1 = await loudDeposit('A', P1, b1, b1);

  const b2 = pc(20);
  const lp2 = await loudDeposit('B', P2, b2, bn(1));

  await loudWithdraw('B', P2, lp2);

  await loudWithdraw('A', P1, lp1);
});

chkScenario('Mint2-Many-Both', async (chk, cmd) => {
  const { tokA } = cmd;
  const bBig = pc(100);
  const P1 = await cmd.new('P1', bBig);
  const P2 = await cmd.new('P2', bBig);

  const b1 = pc(10);
  const lp1 = await loudDeposit('A', P1, b1, b1);

  const P2rt = async (bA, bB) => {
    const lp2 = await loudDeposit('B', P2, bA, bB);
    return await loudWithdraw('B', P2, lp2);
  };
  const P2rts = async (i, bA, bB) => {
    if ( i == 0 ) { return [ bA, bB ]; }
    const [ bAp, bBp ] = await P2rt(bA, bB);
    return await P2rts( i-1, bAp, bBp );
  };
  const [ bA2, bB2 ] = await P2rts( 4, pc(20), bn(1) );

  await loudWithdraw('A', P1, lp1);

  console.log('B', 'ended with', `${bA2}`, `${bB2}`);
});

const sumValue = (A0, B0, [bA, bB]) =>
  bA.add(bB.mul(A0).div(B0));

const showValue = (A0, B0, who, when, [bA, bB]) => {
  const val = sumValue(A0, B0, [bA, bB]);
  console.log(who, when, 'with', `${bA}`, `${bB}`, `(${val} in A)`);
};

chkScenario('Mint2-Many-A', async (chk, cmd) => {
  const { tokA } = cmd;
  const bBig = pc(100);
  const P1 = await cmd.new('P1', bBig);
  const P2 = await cmd.new('P2', bBig);

  const b1 = pc(10);
  const lp1 = await loudDeposit('A', P1, b1, b1);

  const P2rt = async (bA, bB) => {
    const lp2 = await loudDeposit('B', P2, bA, bB);
    return await loudWithdraw('B', P2, lp2);
  };
  const P2rts = async (i, bA, bB) => {
    if ( i == 0 ) { return [ bA, bB ]; }
    const [ bAp, bBp ] = await P2rt(bA, 1 );
    return await P2rts( i-1, bAp, bB.add(bBp) );
  };
  const getB = await P2rts( 0, pc(20), pc(0) );
  const getA = await loudWithdraw('A', P1, lp1);

  showValue(b1, b1, 'A', 'ended', getA);
  showValue(b1, b1, 'B', 'ended', getB);
});

chkScenario('Mint2-LOX0', async (chk, cmd) => {
  const { tokA } = cmd;
  const bBig = pc(1_000_000);
  const P1 = await cmd.new('P1', bBig);
  const P2 = await cmd.new('P2', bBig);

  const A1_0 = bn('4169615');
  const B1_0 = bn('2295709376');
  const begA = [A1_0, B1_0];
  showValue(A1_0, B1_0, 'P1', 'started', begA);
  const lp1_0 = await loudDeposit('P1', P1, A1_0, B1_0);

  const A2_0 = bn('4000000');
  const B2_0 = bn('1')
  const lp2_0 = await loudDeposit('P2', P2, A2_0, B2_0);
  const get2_0 = await loudWithdraw('P2', P2, lp2_0);
  const [ A2_1, B2_1 ] = get2_0;
  const A2_1p = await loudSwapBForA('P2', P2, B2_1);
  const A2_2 = A2_1.add(A2_1p);

  const finB = [ A2_2, bn(0) ];
  const finA = await loudWithdraw('P1', P1, lp1_0);

  showValue(A1_0, B1_0, 'P1', 'ended', finA);
  showValue(A1_0, B1_0, 'P2', 'ended', finB);
});

chkScenario('Mint2-LOX1', async (chk, cmd) => {
  const { tokA } = cmd;
  const bBig = pc(1_000_000);
  const P1 = await cmd.new('P1', bBig);
  const P2 = await cmd.new('P2', bBig);

  const A1_0 = bn('41696150');
  const B1_0 = bn('22957093760');
  const begA = [A1_0, B1_0];
  showValue(A1_0, B1_0, 'P1', 'started', begA);
  const lp1_0 = await loudDeposit('P1', P1, A1_0, B1_0);

  const A2_0 = bn('40000000');
  const B2_0 = bn('1')
  const lp2_0 = await loudDeposit('P2', P2, A2_0, B2_0);
  const get2_0 = await loudWithdraw('P2', P2, lp2_0);
  const [ A2_1, B2_1 ] = get2_0;
  const A2_1p = await loudSwapBForA('P2', P2, B2_1);
  const A2_2 = A2_1.add(A2_1p);

  const finB = [ A2_2, bn(0) ];
  const finA = await loudWithdraw('P1', P1, lp1_0);

  showValue(A1_0, B1_0, 'P1', 'ended', finA);
  showValue(A1_0, B1_0, 'P2', 'ended', finB);
});

chkScenario('Mint2-LOX2', async (chk, cmd) => {
  const { tokA } = cmd;
  const bBig = pc(1_000_000);
  const P1 = await cmd.new('P1', bBig);
  const P2 = await cmd.new('P2', bBig);

  const A1_0 = bn('4169615');
  const B1_0 = bn('2295709376');
  const begA = [A1_0, B1_0];
  showValue(A1_0, B1_0, 'P1', 'started', begA);
  const lp1_0 = await loudDeposit('P1', P1, A1_0, B1_0);

  const A2_0 = bn('4000000');
  const B2_0 = bn('1')
  const lp2_0 = await loudDeposit('P2', P2, A2_0, B2_0);
  const get2_0 = await loudWithdraw('P2', P2, lp2_0);
  const [ A2_1, B2_1 ] = get2_0;
  const lp2_1 = await loudDeposit('P2', P2, bn('1'), B2_1);
  const get2_1 = await loudWithdraw('P2', P2, lp2_1);
  const [ A2_1p, B2_2 ] = get2_1;
  const A2_2 = A2_1.sub('1').add(A2_1p);

  const finB = [ A2_2, B2_2 ];
  const finA = await loudWithdraw('P1', P1, lp1_0);

  showValue(A1_0, B1_0, 'P1', 'ended', finA);
  showValue(A1_0, B1_0, 'P2', 'ended', finB);
});

const compareSwapToRT = (lab, bA1, bB1, bA2) => {
  const bBig = pc(1_000_000);
  chkScenario(`${lab}-Swap`, async (chk, cmd) => {
    const { tokA } = cmd;
    const P1 = await cmd.new('P1', bBig);
    const P2 = await cmd.new('P2', bBig);

    const lp1 = await loudDeposit('A', P1, bA1, bB1);

    await loudSwapAForB('B', P2, bA2.div(2));

    await loudWithdraw('A', P1, lp1);
  });
  chkScenario(`${lab}-RT`, async (chk, cmd) => {
    const { tokA } = cmd;
    const P1 = await cmd.new('P1', bBig);
    const P2 = await cmd.new('P2', bBig);

    const lp1 = await loudDeposit('A', P1, bA1, bB1);

    const lp2 = await loudDeposit('B', P2, bA2, bn(1));

    await loudWithdraw('B', P2, lp2);

    await loudWithdraw('A', P1, lp1);
  });
};

compareSwapToRT(`Mint2-Chris-1t1`, pc(10), pc(10), pc('0.1'));
compareSwapToRT(`Mint2-Chris-100t1`, pc(1000), pc(10), pc('0.1'));
compareSwapToRT(`Mint2-Chris-1t100`, pc(10), pc(1000), pc('0.1'));

test.one('Pool-Analyze', async () => {
  const AtoNet = 1;
  const An = 'algo';
  const Bn = 'usdc';
  const ratio = 0.9714285714;
  const bA = bn('1050000000000');
  const bB = bn('1020000000000');

  const p = (x) => `${x}`;
  const pre = [An, Bn, p(bA), p(bB), p(AtoNet)];
  const show = (...x) => {
    const both = [...pre,...x];
    const bs = both.join('\t');
    console.log(bs);
  };

  const init = sumValue(bA, bB, [bA, bB]);
  const run1 = async (which, go) => {
    let result = bn(0);
    const useNetwork = An === 'algo';
    const id = `Pools.${An}-${Bn}.${which}`;
    const bBig = pc(2_000_000);
    await chkScenario__( useNetwork, id, async (chk, cmd) => {
      const P1 = await cmd.new('P1', bBig);
      const P2 = await cmd.new('P2', bBig);

      const lp1 = await loudDeposit('P1', P1, bA, bB);
      await go(P2);
      const fin1 = await loudWithdraw('P1', P1, lp1);
      result = sumValue(bA, bB, fin1);
    });
    return result;
  };

  const swapAmt = bMin(bA, bB).sub(1);
  //const swapAmt = pc('1000');
  const swapVal = await run1('swap', async (P2) => {
    await loudSwapAForB('P2', P2, swapAmt);
  });
  const rtVal = await run1('rt', async (P2) => {
    const lp2 = await loudDeposit('P2', P2, swapAmt, bn(1));
    await loudWithdraw('P2', P2, lp2);
  });
  const less = swapVal.sub(rtVal);
  const repeatAmt = swapAmt;
  const repeatVal = await run1('rp', async (P2) => {
    let [ pA, pB ] = [ repeatAmt, bn(1) ];
    for ( let i = 0; i < 5; i++ ) {
      const lp2 = await loudDeposit('P2', P2, pA, bn(1));
      const [ pAp1, pBp1 ] = await loudWithdraw('P2', P2, lp2);
      const pAp1p = pAp1.eq(0) ? bz : pAp1.sub(bn(1));
      const [ pAp2, pBp2 ] = [ pAp1p, pB.add(pBp1) ];
      const lp3 = await loudDeposit('P2', P2, bn(1), pBp2);
      const [ pAp3, pBp3 ] = await loudWithdraw('P2', P2, lp3);
      [ pA, pB ] = [ pAp2.add(pAp3), pBp3 ];
    }
  });
  const loss = repeatVal.sub(init);

  show(p(init), p(swapAmt), p(swapVal), p(rtVal), p(less), p(repeatAmt), p(repeatVal), p(loss));
});

chkScenario('Huge-Pool2', async (chk, cmd) => {
  const { tokA, tokB, tokA_mint, tokB_mint } = cmd;
  if ( ! tokA ) { return; }
  const P1 = await cmd.new('P1', pc(1), false);
  const big = um.sub(bn('1000000'));
  const small = um.sub(big);
  const P2 = await cmd.new('P2', small);
  await tokA_mint(P1.acc, big);
  await tokB_mint(P1.acc, big);
  const lps = await P1.deposit(big, big);
  const amtB = await P2.swapAForB(small);
  const amtA = await P2.swapBForA(small);
  const rets = await P1.withdraw(lps);
  console.log({ big, small, lps, amtA, amtB, rets });
});

chkScenario('Triumvir-NoOp', async (chk, cmd) => {
  const { ctcCaesar, ctcPompey } = cmd;
  await ctcCaesar.a.Triumvir.propose(['NoOp', null]);
  await ctcPompey.a.Triumvir.support(0, ['NoOp', null]);
});
chkScenario('Triumvir-Switch-NoOp', async (chk, cmd) => {
  const { ctcCaesar, ctcPompey } = cmd;
  await ctcCaesar.a.Triumvir.propose(['Kill', null]);
  await ctcCaesar.a.Triumvir.propose(['NoOp', null]);
  await ctcPompey.a.Triumvir.support(0, ['NoOp', null]);
});
chkScenario('Triumvir-Support-Not', async (chk, cmd, chkErr) => {
  const { ctcAntony } = cmd;
  await chkErr('not', 'not triumvir', async () =>
    await ctcAntony.a.Triumvir.support(0, ['NoOp', null]));
});
chkScenario('Triumvir-Support-Idx', async (chk, cmd, chkErr) => {
  const { ctcCaesar } = cmd;
  await chkErr('idx', 'idx', async () =>
    await ctcCaesar.a.Triumvir.support(3, ['NoOp', null]));
});
chkScenario('Triumvir-Support-Self', async (chk, cmd, chkErr) => {
  const { ctcCaesar } = cmd;
  await ctcCaesar.a.Triumvir.propose(['Kill', null]);
  await chkErr('self', 'self', async () =>
    await ctcCaesar.a.Triumvir.support(0, ['NoOp', null]));
});
chkScenario('Triumvir-Switch-Kill', async (chk, cmd, chkErr) => {
  const { ctcCaesar, ctcPompey } = cmd;
  await ctcCaesar.a.Triumvir.propose(['NoOp', null]);
  await ctcCaesar.a.Triumvir.propose(['Kill', null]);
  await chkErr('switched', 'switched', async () =>
    await ctcPompey.a.Triumvir.support(0, ['NoOp', null]));
});
chkScenario('Triumvir-NewTriumvirs', async (chk, cmd) => {
  const { accCaesar, accCrassus, ctcCaesar, ctcPompey, accAntony, ctcAntony } = cmd;
  await chkErr('not', 'not triumvir', async () =>
    await ctcAntony.a.Triumvir.propose(['NoOp', null]));
  const nt1 = ['NewTriumvirs', [ accCaesar, accCrassus, accAntony ]];
  await ctcCaesar.a.Triumvir.propose(nt1);
  await ctcPompey.a.Triumvir.support(0, nt1);
  await ctcAntony.a.Triumvir.propose(['NoOp', null]);
  await chkErr('not', 'not triumvir', async () =>
    await ctcPompey.a.Triumvir.propose(['NoOp', null]));
});
chkScenario('Triumvir-NewInfo-Okay', async (chk, cmd) => {
  const { ctcCaesar, ctcPompey } = cmd;
  const pi0 = (await ctcCaesar.unsafeViews.Info()).protoInfo;
  chk('before', pi0.locked, false);
  const ni = ['NewInfo', { ...pi0, locked: true }];
  await ctcCaesar.a.Triumvir.propose(ni);
  await ctcPompey.a.Triumvir.support(0, ni);
  const pi1 = (await ctcCaesar.unsafeViews.Info()).protoInfo;
  chk('after', pi1.locked, true);
});
chkScenario('Triumvir-NewInfo-Bad1', async (chk, cmd) => {
  const { ctcCaesar, ctcPompey } = cmd;
  const pi0 = (await ctcCaesar.unsafeViews.Info()).protoInfo;
  const ni = ['NewInfo', { ...pi0, protoFee: 1 }];
  await chkErr('invalid', 'invalid', async () =>
    await ctcCaesar.a.Triumvir.propose(ni));
});
chkScenario('Triumvir-NewInfo-Bad2', async (chk, cmd) => {
  const { ctcCaesar, ctcPompey } = cmd;
  const pi0 = (await ctcCaesar.unsafeViews.Info()).protoInfo;
  const ni = ['NewInfo', { ...pi0, totFee: 1 }];
  await chkErr('invalid', 'invalid', async () =>
    await ctcCaesar.a.Triumvir.propose(ni));
});
chkScenario('Triumvir-NewInfo-Bad3', async (chk, cmd) => {
  const { ctcCaesar, ctcPompey } = cmd;
  const pi0 = (await ctcCaesar.unsafeViews.Info()).protoInfo;
  const ni = ['NewInfo', { ...pi0, protoFee: 60, lpFee: 60, totFee: 120 }];
  await chkErr('invalid', 'invalid', async () =>
    await ctcCaesar.a.Triumvir.propose(ni));
});
chkScenario('Triumvir-Rewards', async (chk, cmd) => {
  const { ctcCaesar, ctcPompey, accCrassus } = cmd;
  const n = ['Rewards', accCrassus];
  const get = () => stdlib.balanceOf(accCrassus);
  const before = await get();

  const b = pc(10);
  const P1 = await cmd.new('P1', b);
  const lp = await P1.deposit(b, b);
  const out = await P1.withdraw(lp);

  await ctcCaesar.a.Triumvir.propose(n);
  await ctcPompey.a.Triumvir.support(0, n);
  const after = await get();
  console.log({before, after});
  chk('lte', before.lte(after), true);
});
chkScenario('Triumvir-Kill', async (chk, cmd) => {
  const { ctcCaesar, ctcPompey, ctcCrassus } = cmd;
  await ctcCaesar.a.Triumvir.propose(['Kill', null]);
  await ctcPompey.a.Triumvir.support(0, ['Kill', null]);
  await chkErr('deleted', 'do not exist|no appSt', async () =>
    await ctcCrassus.a.Triumvir.propose(['NoOp', null]));
});

chkScenario('Triumvir-Harvest-Fail', async (chk, cmd) => {
  const P1 = await cmd.new('P1', pc(1));
  const pi0 = (await P1.ctc.unsafeViews.Info()).protoInfo;
  await chkErr('not', 'art not', async () =>
    await P1.ctc.a.Protocol_harvest(P1.acc, pi0));
});

const primePoolForHarvest_ = async (cmd) => {
  const b = pc(100);
  const T1 = await cmd.new('T1', b);
  const out = await T1.swapAForB(b);
  const [ protoFeesA, protoFeesB ] = await cmd.getProBals();
  const R = await cmd.new('R', pc(1));
  return { R, protoFeesA, protoFeesB };
};
const primePoolForHarvest = async (cmd) => {
  const b = pc(100);
  await setupPool(chk, cmd, b, b);
  return await primePoolForHarvest_(cmd);
};
chkScenario('Triumvir-Harvest-Yes', async (chk, cmd) => {
  const { ctcCaesar, ctcPompey, ctcInfo, tokA, tokAM, tokB } = cmd;
  const { fees, R, protoFeesA, protoFeesB } = await primePoolForHarvest(cmd);
  const nc = ['Harvest', [ ctcInfo, tokAM, tokB, R.acc ] ];
  const beforeA = await R.balA();
  const beforeB = await R.balB();
  await ctcCaesar.a.Triumvir.propose(nc);
  await ctcPompey.a.Triumvir.support(0, nc);
  const afterA = await R.balA();
  const afterB = await R.balB();
  console.log({beforeA, afterA, protoFeesA, protoFeesB});
  if ( tokA ) {
    chk('A fees eq', afterA, beforeA.add(protoFeesA));
  } else {
    chk('A fees gte', afterA.gte(beforeA.add(protoFeesA)), true);
  }
  chk('B fees eq', afterB, beforeB.add(protoFeesB));
});
chkScenario('Triumvir-Lock', async (chk, cmd, chkErr) => {
  const { ctcCaesar, ctcPompey, accCaesar, ctcInfo, tokA, tokAM, tokB } = cmd;

  const P1 = await cmd.new('P1', pc(100));
  const P2 = await cmd.new('P2', pc(100));
  const lp1 = await P1.deposit(pc(10), pc(10));

  // Change protocol to locked
  const pi0 = (await ctcCaesar.unsafeViews.Info()).protoInfo;
  chk('before', pi0.locked, false);
  const c0 = ['NewInfo', { ...pi0, locked: true }];
  await ctcCaesar.a.Triumvir.propose(c0);
  await ctcPompey.a.Triumvir.support(0, c0);

  // Run the Harvest
  const c1 = ['Harvest', [ ctcInfo, tokAM, tokB, P1.acc ] ];
  await ctcCaesar.a.Triumvir.propose(c1);
  await ctcPompey.a.Triumvir.support(0, c1);

  // Try to deposit and fail
  await chkErr('locked-dep', 'locked', async () =>
    await P2.deposit(pc(10), pc(10)));
  // Try to swap A and fail
  await chkErr('locked-swapA', 'locked', async () =>
    await P2.swapAForB(pc(10)));
  // Try to swap B and fail
  await chkErr('locked-swapB', 'locked', async () =>
    await P2.swapBForA(pc(10)));
  // Withdraw
  await P1.withdraw(lp1);

  // Unlock
  const c2 = ['NewInfo', { ...pi0, locked: false }];
  await ctcCaesar.a.Triumvir.propose(c2);
  await ctcPompey.a.Triumvir.support(0, c2);

  // Run the Harvest
  await ctcCaesar.a.Triumvir.propose(c1);
  await ctcPompey.a.Triumvir.support(0, c1);

  // Deposit
  const lp2 = await P2.deposit(pc(10), pc(10));
  // Swap A
  await P2.swapAForB(pc(10));
  // Swap B
  await P2.swapBForA(pc(10));
  // Withdraw
  await P2.withdraw(lp2);
});
chkScenario('Triumvir-LoFees', async (chk, cmd) => {
  const { ctcCaesar, ctcPompey, accCaesar, ctcInfo, tokA, tokAM, tokB } = cmd;

  const b = pc('10000000');
  const P1 = await cmd.new('P1', b);
  const P2 = await cmd.new('P2', pc(100));
  const lp1 = await P1.deposit(b, b);

  // Swap with fees
  const recvWithFees = await P2.swapAForB(pc(10));

  // Change protocol to lo fees
  const pi0 = (await ctcCaesar.unsafeViews.Info()).protoInfo;
  const c0 = ['NewInfo', { ...pi0, protoFee:0, lpFee:1, totFee: 1 }];
  await ctcCaesar.a.Triumvir.propose(c0);
  await ctcPompey.a.Triumvir.support(0, c0);
  // Run the Harvest
  const c1 = ['Harvest', [ ctcInfo, tokAM, tokB, P1.acc ] ];
  await ctcCaesar.a.Triumvir.propose(c1);
  await ctcPompey.a.Triumvir.support(0, c1);

  const pi1 = (await ctcCaesar.unsafeViews.Info()).protoInfo;
  console.log({pi0, pi1});

  // Swap with no fees
  const recvWithNoFees = await P2.swapAForB(pc(10));

  console.log({ recvWithFees, recvWithNoFees });
  chk("got more", recvWithFees.lt(recvWithNoFees), true);
});
const changeProtocol = async (chk, cmd, chkErr) => {
  const { ctcCaesar, ctcPompey, accCaesar, ctcInfo, tokA, tokAM, tokB } = cmd;

  const { R: R1 } = await primePoolForHarvest(cmd);

  // Change protocol to Caesar
  const pi0 = (await ctcCaesar.unsafeViews.Info()).protoInfo;
  const c0 = ['NewInfo', { ...pi0, protoAddr: R1.acc }];
  await ctcCaesar.a.Triumvir.propose(c0);
  await ctcPompey.a.Triumvir.support(0, c0);
  // Run the Harvest
  const c1 = ['Harvest', [ ctcInfo, tokAM, tokB, R1.acc ] ];
  await ctcCaesar.a.Triumvir.propose(c1);
  await ctcPompey.a.Triumvir.support(0, c1);

  const { R: R2 } = await primePoolForHarvest_(cmd);

  // Run the Harvest again but fail
  await ctcCaesar.a.Triumvir.propose(c1);
  await chkErr('cant harvest', 'assert', async () =>
    await ctcPompey.a.Triumvir.support(0, c1));

  return { R1, pi0 };
};
chkScenario('Triumvir-ReplaceProtocol-Harvest', async (chk, cmd, chkErr) => {
  const { R1, pi0 } = await changeProtocol(chk, cmd, chkErr);

  await R1.ctc.a.Protocol_harvest(R1.acc, pi0);
});
const advHarv = (isAPI) => {
  const lab = isAPI ? `API` : `Raw`;
  chkScenario(`Triumvir-ReplaceProtocol-AdvHarvest-${lab}`, async (chk, cmd, chkErr) => {
    const { tokA } = cmd;
    const { R1, pi0 } = await changeProtocol(chk, cmd, chkErr);
    await R1.rawSend(({ mkApp, mkPay }) => {
      const addr = stdlib.protect(T_Address, R1.acc);
      const info = [ addr, pi0 ];
      const tys  = isAPI ? [T_UInt, ...tyHArgs] : apiTys;
      const args = isAPI
        ? [apiUis[tagH], ...info]
        : [0, apiNum, 0, [tagH, info]]
      console.log({tys, args});
      return [
        mkApp((tokA ? 3 : 2), tys, args),
      ];
    });
  });
};
advHarv(true);
advHarv(false);

limitOrder.registerLimitOrderTests(test, chkScenario__, setupPool);

// Staker tests depend on timing, so they must be run separately
console.log("Staker tests:");
await staker.runTests();

const DEVMODE = false;
await test.run(DEVMODE ? {} : {
  howManyAtOnce: 5,
  exitOnFail: false,
});
