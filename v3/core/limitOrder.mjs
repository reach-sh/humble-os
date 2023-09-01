import * as lo_tok_tok from './build/limitOrder.lo_tok_tok.mjs';
import * as lo_tok_net from './build/limitOrder.lo_tok_net.mjs';
import * as lo_net_tok from './build/limitOrder.lo_net_tok.mjs';
import * as evil_swap_tok from './build/limitOrder.evil_swap_tok.mjs';
import * as evil_swap_net from './build/limitOrder.evil_swap_net.mjs';
import * as announcer from './build/limitOrder.announcer.mjs';
import { loadStdlib } from '@reach-sh/stdlib';
const stdlib = loadStdlib({ ...process.env, REACH_NO_WARN: 'Y' });

const yellow = s => "\x1b[33m" + s + "\x1b[0m";
const red = s => "\x1b[31m" + s + "\x1b[0m";
const oneAlgo = 1_000_000;
const { assert } = stdlib;

// Limit order tests ignore gas fees by rounding to whole algos, but algos printed in microalgos is very hard to read.
// logBalances scales all large numbers printed back down to integer whole algos.
// An alpha character indicates the number has been modified. α = 1,000,000.
const divN = n => n < oneAlgo ? n : `${Math.trunc(n / oneAlgo)}α`;
const divBalances = s => s.replaceAll(/[0-9]+/g, divN);
const logBalances = (...args) => {
  const newArgs = args.map(a => typeof (a) === 'string' ? divBalances(a) : a);
  console.log(...newArgs);
}

const assertDiff = (msg, a, b, diff) => {
  const d = Math.abs(a - b);
  assert(d <= diff, `${msg}: (${a} - ${b} = ${d}) <= ${diff}`);
}

const assertEq = (msg, a, b) => {
  const aStr = JSON.stringify(a);
  const bStr = JSON.stringify(b);
  const eq = a?.eq?.(b) || b?.eq?.(a) || a === b || aStr === bStr;
  assert(eq, `${msg}: ${aStr} === ${bStr}`);
}

const launch = async (label, participant, interactObj = {}) => {
  interactObj.ready = stdlib.disconnect;
  await stdlib.withDisconnect(() => participant(interactObj));
  logBalances(`Launched ${label}`);
};

const mkRunLO = async (cmd, chkErr, loMod, aForB, slippageA, slippageB) => {
  const {
    tokA, tokB, tokA_mint, computeSwap, accAdmin,
    new: newAcc,
    ctcInfo: poolInfo,
    getBals: getPoolBals
  } = cmd;

  const pc = stdlib.parseCurrency;
  const accLO = (await newAcc("accLO", pc(10), false)).acc;
  const accBot = (await newAcc("accBot", pc(10), false)).acc;
  await stdlib.fundFromFaucet(accLO, pc(1));  // extra algo to spend on contract launches
  await stdlib.fundFromFaucet(accBot, pc(1)); // ^
  await tokA_mint?.(accLO, 100);

  const ctcAnnouncer = accAdmin.contract(announcer);
  await launch('Announcer', ctcAnnouncer.p.D);

  const balances = async () => {
    const tn = bn => bn.toNumber();
    const [loA, loB] = (await stdlib.balancesOf(accLO, [tokA, tokB])).map(tn);
    const [botA, botB] = (await stdlib.balancesOf(accBot, [tokA, tokB])).map(tn);
    const [poolA, poolB] = (await getPoolBals()).map(tn);
    return { loA, loB, botA, botB, poolA, poolB };
  };

  const printBals = async label => {
    const { loA, loB, botA, botB, poolA, poolB } = await balances();
    logBalances(label, "balances:");
    logBalances(`  Pool has ${poolA} A and ${poolB} B`);
    logBalances(`  LO   has ${loA} A and ${loB} B`);
    logBalances(`  Bot  has ${botA} A and ${botB} B`);
  }

  const runLO = async (amtA, amtB, giveA, minProfitB, failMsg = null) => {
    const label = `LO(${amtA} -> ${amtB})`;
    logBalances(yellow(`### ${label}`));

    await printBals(`Before ${label}`);
    const preBals = await balances();
    const expectedRecvB = await computeSwap(aForB, giveA);
    const botProfitA = amtA - giveA;
    const botProfitB = expectedRecvB - amtB;
    logBalances(`Bot proposes ${giveA} A for ${expectedRecvB} B`);
    logBalances(`Bot must profit at least ${minProfitB} B`);
    logBalances(`Bot profits  ${botProfitA} A and ${botProfitB} B`);

    const go = async () => {
      // Launch the limit order
      const ctcLO = accLO.contract(loMod); // The important contract
      await launch(label, ctcLO.p.D, { opts: { tokA, tokB, amtA, amtB, ctcAnnouncer: await ctcAnnouncer.getInfo() } });

      // Check the announcer
      const ctcLOInfo = await ctcLO.getInfo();
      const [deployer_ev, ctcLO_ev, tokA_ev, tokB_ev, amtA_ev, amtB_ev] = (await ctcAnnouncer.e.LimitOrder.next()).what;
      const assertEq_ = (a, b) => assertEq("Announcer event", a, b);
      assertEq_(stdlib.formatAddress(deployer_ev), stdlib.formatAddress(accLO.getAddress()));
      assertEq_(ctcLO_ev, ctcLOInfo);
      assertEq_(amtA_ev, amtA);
      assertEq_(amtB_ev, amtB);
      assertEq_(tokA_ev, tokA ? ['Some', tokA] : ['None', null])
      assertEq_(tokB_ev, tokB ? ['Some', tokB] : ['None', null])

      // Fulfill the limit order
      const ctcBot = accBot.contract(loMod, ctcLOInfo);
      await ctcBot.a.SwapViaPool(poolInfo, aForB, giveA, minProfitB); // The important API call
    }

    if (failMsg) {
      console.log("Expeting error:", red(failMsg));
      await chkErr(failMsg, failMsg, go);
      return;
    } else {
      await go();
    }

    const postBals = await balances();
    await printBals(`After ${label}`);

    assertDiff("accLO paid amtA", postBals.loA, preBals.loA - amtA, slippageA);
    assertDiff("accLO recv amtB", postBals.loB, preBals.loB + amtB, slippageB);
    assertDiff("accBot profit amtA - give", postBals.botA, preBals.botA + botProfitA, slippageA);
    assertDiff("accBot profit recvB - amtB", postBals.botB, preBals.botB + botProfitB, slippageB);
  };

  return runLO;
}

const initA = 10000;
const initB = 500000;
const gasFees = oneAlgo / 4;

// [amtA, amtB, giveA, minProfitB, failMsg?]
const tokTokTestCases = [
  // Good tests
  [ 1,   1,  1,    48],
  [10,  20, 10,   477],
  [10,  20,  5,   228],
  [50, 700, 40,  1279],
  [ 0,   0,  0,     0],

  // Bad tests
  [1,      1, 2, 0, "SwapViaPool: giveA <= amtA"], // Bot tries to make lo contract overspend, fails giveA check
  [1, 500000, 1, 0, "<=\\\\nassert"], // Bot proposes trade that pool won't take, fails slippage check in pool code
  [0,      0, 0, 1, ">=\\\\nassert"], // Bot proposes trade that it cannot profit off of, fails minProfitB enforce
];

const tokNetTestCases = tokTokTestCases.map(tc => {
  const tcNew = [...tc];
  tcNew[1] *= oneAlgo; // multiply amtB to whole ALGOs
  tcNew[3] *= oneAlgo; // multiply minProfitB to whole algos
  return tcNew;
});

const netTokTestCases = tokTokTestCases.map(tc => {
  const tcNew = [...tc];
  tcNew[0] *= oneAlgo; // multiply amtA to whole ALGOs
  tcNew[2] *= oneAlgo; // multiply giveA to whole ALGOs
  return tcNew;
});

export const registerLimitOrderTests = (test, chkScenario__, setupPool) => {
  test.one("limitOrder.tok-tok", () => chkScenario__(false, "", async (chk, cmd, chkErr) => {
    await setupPool(chk, cmd, initA, initB);
    const runLO = await mkRunLO(cmd, chkErr, lo_tok_tok, true, 0, 0, cmd, chkErr);
    for (const c of tokTokTestCases) await runLO(...c);
  }));

  test.one("limitOrder.tok-net", () => chkScenario__(true, "", async (chk, cmd, chkErr) => {
    await setupPool(chk, cmd, initB * oneAlgo, initA);
    const switched = { ...cmd, tokA: cmd.tokB, tokB: null, tokA_mint: cmd.tokB_mint };
    const runLO = await mkRunLO(switched, chkErr, lo_tok_net, false, 0, gasFees, cmd, chkErr);
    for (const c of tokNetTestCases) await runLO(...c);
  }));

  test.one("limitOrder.net-tok", () => chkScenario__(true, "", async (chk, cmd, chkErr) => {
    await setupPool(chk, cmd, initA * oneAlgo, initB);
    const runLO = await mkRunLO(cmd, chkErr, lo_net_tok, true, gasFees, 0, cmd, chkErr);
    for (const c of netTokTestCases) await runLO(...c);
  }));

  test.one("limitOrder.evil", () => chkScenario__(false, "", async (_chk, cmd, chkErr) => {
    const { accAdmin: acc, tokA, tokB } = cmd;

    let ctcAnnouncer = acc.contract(announcer);
    await launch('Announcer', ctcAnnouncer.p.D);
    ctcAnnouncer = await ctcAnnouncer.getInfo();

    // EvilSwap (takes your money and doesn't give anything back)
    const runEvil = async (loMod, evilMod, aForB, tokA, tokB, poolTok) =>
      chkErr("EvilSwap is thwarted", ">=\\\\nassert", async () => {
        const ctcEvil = acc.contract(evilMod);
        const ctcLO = acc.contract(loMod);
        await launch("EvilSwap", ctcEvil.p.D, { tokA: poolTok })
        await launch("LO Justice", ctcLO.p.D, { opts: { tokA, tokB, amtA: 1, amtB: 1, ctcAnnouncer } });
        await ctcLO.a.SwapViaPool(await ctcEvil.getInfo(), aForB, 1, 0);
      });

    await runEvil(lo_tok_tok, evil_swap_tok, true, tokA, tokB, tokA);
    await runEvil(lo_net_tok, evil_swap_net, true, null, tokB, null);
    await runEvil(lo_tok_net, evil_swap_tok, false, tokA, null, tokA);
  }));
}
