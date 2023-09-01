import * as backend from './build/staker.main.mjs';
import { loadStdlib, test } from '@reach-sh/stdlib';
const stdlib = loadStdlib({ ...process.env, REACH_NO_WARN: 'y', REACH_ISOLATED_NETWORK: 'y' });
const { assert } = stdlib;

const runTest = async ({ nStakers, stakeMint, test, title }) => {
  const eq = (a, b) => {
    const aStr = JSON.stringify(a);
    const bStr = JSON.stringify(b)
    const arrEq = (a, b) => Array.isArray(a) && Array.isArray(b) &&
      a.every((a, i) => eq(a, b[i]))
    return a === b || arrEq(a, b) || a?.eq?.(b) || b?.eq?.(a) || aStr === bStr;
  }
  const assertEq = (a, b) => {
    const aStr = JSON.stringify(a);
    const bStr = JSON.stringify(b);
    assert(eq(a, b), `${aStr} === ${bStr}`);
  }

  console.log(`\x1b[33m### ${title}\x1b[0m`);
  // Await network time stability, improves test consistency
  do {
    const t0 = await stdlib.getNetworkTime();
    await new Promise(r => setTimeout(r, 6000));
    const t1 = await stdlib.getNetworkTime();
    var stable = t0.eq(t1);
  } while (!stable);

  // Setting up the staker contract and accounts
  const bal = stdlib.parseCurrency(100);
  const [accAdmin, accDeployer] = await stdlib.newTestAccounts(2, bal);
  const accStakers = await stdlib.newTestAccounts(nStakers, bal);
  const tokReward = await stdlib.launchToken(accAdmin, '', '');
  const tokStake = await stdlib.launchToken(accAdmin, '', '');
  const rewards = [1000 * nStakers, 1000 * nStakers];

  for (const acc of accStakers) {
    await acc.tokenAccept(tokReward.id);
    await acc.tokenAccept(tokStake.id);
    await tokStake.mint(acc, stakeMint);
  }
  await accDeployer.tokenAccept(tokReward.id);
  await accDeployer.tokenAccept(tokStake.id);
  await tokReward.mint(accDeployer, rewards[1]);

  const now = (await stdlib.getNetworkTime()).toNumber();
  const start = now + 1000 * nStakers;
  const end = start + 2000 * nStakers;
  const ctcDeployer = accDeployer.contract(backend);
  await stdlib.withDisconnect(() => ctcDeployer.p.Deployer({
    opts: {
      rewardToken1: tokReward.id,
      stakeToken: tokStake.id,
      rewards,
      start,
      end,
      Rewarder0: accDeployer.getAddress(),
    },
    readyForRewarder: stdlib.disconnect,
    readyForStakers: () => { },
  }));
  await ctcDeployer.a.Setup.fund();

  // Global state for simplifying the following functions
  const ctcInfo = ctcDeployer.getInfo();
  const stakers = accStakers.map(a => [a, a.getAddress(), a.contract(backend, ctcInfo)]);
  const addrMap = stakers.reduce((am, [, addr], i) => ({ ...am, [addr]: `<Staker ${i}>` }), {});

  // Helpers
  const pretty = x => {
    if (Array.isArray(x))
      return x.map(pretty).toString();
    else if (stdlib.isBigNumber(x))
      return stdlib.bigNumberToNumber(x);
    else if (x?.constructor === Object) {
      const y = {};
      for (const k of Object.keys(x))
        y[k] = pretty(x[k]);
      return JSON.stringify(y);
    } else if (x === undefined)
      return 'undefined';
    else if (addrMap?.[x])
      return addrMap[x]
    else
      return x.toString();
  }

  const checkEvent = (evName, fields, fn) => async () => {
    const res = await fn();
    const ev = (await ctcDeployer.e[evName].next()).what;

    const label = `  event ${evName}`;
    console.log(label, pretty(ev));

    assertEq(fields.length, ev.length);
    for (let i = 0; i < ev.length; i++)
      if (fields[i] !== undefined)
        assertEq(fields[i], ev[i]);
    return res;
  }

  const checkView = (viewName, args, expected, fn) => async () => {
    const pre = await ctcDeployer.unsafeViews[viewName](...args);
    const res = await fn();
    const post = await ctcDeployer.unsafeViews[viewName](...args);
    console.log(`  view ${viewName} ${pre} -> ${post}`);
    assert(expected(pre, post), `${expected.toString()}(${pre}, ${post})`);
    return res;
  }

  const checkView_stakedDelta = (addr, delta, fn) =>
    checkView('Info', [], (pre, post) => eq(pre.totalStaked.add(delta), post.totalStaked),
      checkView('staked', [addr], (pre, post) => eq(pre.add(delta), post), fn));
  const checkView_zeroRewardsAvailable = (addr, fn) =>
    checkView('rewardsAvailable', [addr], (_pre, post) => eq(post, [0, 0]), fn);

  // Testing interface implementation
  const printBals = async label => {
    const column = (title, rows) => {
      rows = [title, ...rows]
      const width = Math.max(...rows.map(x => x.toString().length));
      return rows.map(x => x.toString().padStart(width));
    }
    const bals = await Promise.all(stakers.map(([a]) => stdlib.balancesOf(a, [tokStake.id, tokReward.id])));
    const staker = column("staker", stakers.keys());
    const unstaked = column("unstaked", bals.map(a => a[0]));
    const staked = column("staked", bals.map(a => stakeMint - a[0]));
    const reward = column("reward", bals.map(a => a[1]));
    console.log(label + " balances:");
    for (let i = 0; i <= accStakers.length; i++)
      console.log(' ', staker[i], unstaked[i], staked[i], reward[i]);
  }

  const stake = async (i, amt) => {
    console.log(`${i} stake ${amt}`);
    const [, addr, ctc] = stakers[i];
    await
      checkView_stakedDelta(addr, amt,
        checkEvent('Stake', [addr, amt, undefined],
          () => ctc.apis.Staker.stake(amt)))();
  }

  const harvest = async (i) => {
    console.log(`${i} harvest`);
    const [, addr, ctc] = stakers[i];
    await
      checkView_zeroRewardsAvailable(addr,
        checkEvent('Harvest', [addr, undefined, addr],
          () => ctc.apis.Staker.harvest()))();
  }

  const withdraw = async (i, amt) => {
    console.log(`${i} withdraw ${amt}`);
    const [, addr, ctc] = stakers[i];
    await
      checkView_stakedDelta(addr, -amt,
        checkEvent('Withdraw', [addr, amt, undefined, addr],
          () => ctc.apis.Staker.withdraw(amt)))();
  }

  const withdrawAndHarvest = async (i, amt) => {
    console.log(`${i} withdrawAndHarvest ${amt}`);
    const [, addr, ctc] = stakers[i];
    await
      checkView_stakedDelta(addr, -amt,
        checkView_zeroRewardsAvailable(addr,
          checkEvent('Harvest', [addr, undefined, addr],
            checkEvent('Withdraw', [addr, amt, undefined, addr],
              () => ctc.apis.Staker.withdrawAndHarvest(amt)))))();
  }

  const emergencyWithdraw = async (i) => {
    console.log(`${i} emergencyWithdraw`);
    const [, addr, ctc] = stakers[i];
    const amt = await ctc.unsafeViews.staked(addr);
    await
      checkView_stakedDelta(addr, -amt,
        checkView('rewardsAvailable', [addr], eq,
          checkEvent('EmergencyWithdraw', [addr, undefined, undefined, addr],
            () => ctc.apis.Staker.emergencyWithdraw())))();
  }

  const assertRewardCmp = async (a, b, cmp) => {
    const aBal = (await stdlib.balanceOf(accStakers[a], tokReward.id)).toNumber();
    const bBal = (await stdlib.balanceOf(accStakers[b], tokReward.id)).toNumber();
    if (!cmp(aBal, bBal)) {
      await printBals(`(${cmp.toString()})(${aBal}, ${bBal})`);
      stdlib.assert(false);
    }
  }

  const assertRewardGt = async (a, b) => await assertRewardCmp(a, b, (x, y) => x > y);
  const assertRewardEq = async (a, b) => await assertRewardCmp(a, b, (x, y) => x == y);

  let rwdBegin, rwdEnd;
  const printRewardsPeriod = ({ current }) => {
    if (current.gte(start) && !rwdBegin) {
      rwdBegin = true;
      console.log("Rewards period begins");
    }
    if (current.gte(end) && !rwdEnd) {
      rwdEnd = true;
      console.log("Rewards period ends");
    }
  }

  const waitUntilStart = async () => {
    stdlib.assert(await stdlib.getNetworkTime() < start, "waitUntilStart() called after start (network advanced too fast)");
    await stdlib.waitUntilTime(start, printRewardsPeriod)
  }

  const waitUntilEnd = async () => {
    stdlib.assert(await stdlib.getNetworkTime() < end, "waitUntilEnd() called after end (network advanced too fast)");
    await stdlib.waitUntilTime(end, printRewardsPeriod);
  }

  await printBals("start");
  await test({
    printBals,
    waitUntilStart,
    waitUntilEnd,
    stake,
    harvest,
    withdraw,
    withdrawAndHarvest,
    emergencyWithdraw,
    assertRewardGt,
    assertRewardEq,
  });
  await printBals("end");
  console.log();
}

const tests = [
  {
    title: "All for one",
    nStakers: 1,
    stakeMint: 1,
    test: async ({ stake, waitUntilEnd, withdrawAndHarvest }) => {
      await stake(0, 1);
      await waitUntilEnd();
      await withdrawAndHarvest(0, 1);
    }
  },
  {
    title: "Five way split",
    nStakers: 5,
    stakeMint: 1,
    test: async ({ stake, waitUntilEnd, withdrawAndHarvest, assertRewardEq }) => {
      for (let i = 0; i < 5; i++) await stake(i, 1);
      await waitUntilEnd();
      for (let i = 0; i < 5; i++) await withdrawAndHarvest(i, 1);
      for (let i = 1; i < 5; i++) await assertRewardEq(0, i);
    }
  },
  {
    title: "Consecutive staking",
    nStakers: 5,
    stakeMint: 1,
    test: async ({ stake, waitUntilStart, withdrawAndHarvest, assertRewardGt, waitUntilEnd }) => {
      await waitUntilStart();
      for (let i = 0; i < 5; i++) await stake(i, 1).then(() => stdlib.wait(5));
      await waitUntilEnd();
      for (let i = 0; i < 5; i++) await withdrawAndHarvest(i, 1);
      for (let i = 0; i < 4; i++) await assertRewardGt(i, i + 1);
    }
  },
  {
    title: "Consecutive harvesting",
    nStakers: 5,
    stakeMint: 1,
    test: async ({ stake, waitUntilStart, withdrawAndHarvest, assertRewardGt, assertRewardEq, waitUntilEnd, harvest, printBals }) => {
      for (let i = 0; i < 5; i++) await stake(i, 1);
      await waitUntilStart();
      for (let i = 0; i < 5; i++) await harvest(i).then(() => stdlib.wait(5));
      await waitUntilEnd();
      for (let i = 0; i < 4; i++) await assertRewardGt(i + 1, i);
      await printBals("After consecutive harvests");
      for (let i = 0; i < 5; i++) await withdrawAndHarvest(i, 1);
      for (let i = 1; i < 5; i++) await assertRewardEq(0, i);
    }
  },
  {
    title: "Midway stake increase",
    nStakers: 2,
    stakeMint: 2,
    test: async ({ stake, withdrawAndHarvest, waitUntilStart, waitUntilEnd, assertRewardGt }) => {
      await stake(0, 1);
      await stake(1, 1);
      await waitUntilStart().then(() => stdlib.wait(10));
      await stake(0, 1);
      await waitUntilEnd();
      await withdrawAndHarvest(0, 2);
      await withdrawAndHarvest(1, 1);
      await assertRewardGt(0, 1);
    }
  },
  {
    title: "Midway stake decrease",
    nStakers: 2,
    stakeMint: 2,
    test: async ({ stake, withdrawAndHarvest, withdraw, waitUntilStart, waitUntilEnd, assertRewardGt }) => {
      await stake(0, 2);
      await stake(1, 2);
      await waitUntilStart().then(() => stdlib.wait(10));
      await withdraw(1, 1);
      await waitUntilEnd();
      await withdrawAndHarvest(0, 2);
      await withdrawAndHarvest(1, 1);
      await assertRewardGt(0, 1);
    }
  },
  {
    title: "emergencyWithdraw",
    nStakers: 2,
    stakeMint: 1,
    test: async ({ stake, harvest, waitUntilEnd, emergencyWithdraw, assertRewardEq }) => {
      await stake(0, 1);
      await waitUntilEnd();
      await emergencyWithdraw(0, 1);
      await harvest(0);
      await assertRewardEq(0, 1); // both should have 0
    }
  },
  {
    title: "No free rewards",
    nStakers: 3,
    stakeMint: 1,
    test: async ({ stake, harvest, waitUntilEnd, assertRewardEq, assertRewardGt }) => {
      await stake(0, 1);
      await waitUntilEnd();
      await harvest(0);
      await harvest(1);
      await harvest(2);
      await assertRewardGt(0, 1);
      await assertRewardEq(1, 2);
    }
  },
  {
    title: "Withdraw too much",
    nStakers: 1,
    stakeMint: 1,
    expectFail: true,
    test: async ({ stake, withdraw }) => {
      await stake(0, 1);
      await withdraw(0, 2);
    }
  },
  {
    title: "Stake after end",
    nStakers: 1,
    stakeMint: 1,
    expectFail: true,
    test: async ({ stake, harvest, waitUntilEnd }) => {
      // Staker contract actually will accept 1 stake after the end of the
      // rewards period, if it's the first call after it finished.
      // This is due to limitations in the verifier?
      // So, we insert a harvest to update lastRewardsRefreshed
      await waitUntilEnd();
      await harvest(0);
      await stake(0, 1);
    }
  },
];

export const runTests = async () => {
  for (const t of tests) {
    const testName = `staker.${t.title}`;

    if (test.shouldRun(testName)) {
      let e;
      try {
        await runTest(t);
      } catch (e_) {
        e = e_;
        console.log(e);
      }

      // Hook into stdlib test module
      let fn;
      if (e) {
        if (t.expectFail) fn = () => console.log(`${testName}: Got expected error: ${e}`)
        else fn = () => { throw e }
      } else {
        if (t.expectFail) fn = () => { throw `${testName}: Expected error but didn't get one` }
        else fn = () => console.log(`${testName}: success`);
      }
      test.one(testName, fn);
    }
  }
}