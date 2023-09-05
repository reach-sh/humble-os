import * as smallAnnouncerBin from './build/farmAnnouncer.small.mjs';
import * as mediumAnnouncerBin from './build/farmAnnouncer.medium.mjs';
import * as largeAnnouncerBin from './build/farmAnnouncer.large.mjs';
import sampleData from './sampleData.mjs';
import * as farmBin from './build/staker.main.mjs';
import * as reachsdk from '@reach-sh/stdlib';
process.env.REACH_NO_WARN=1;
process.env.REACH_CONNECTOR_MODE='ALGO'; // XXX
const reach = reachsdk.loadStdlib();

const omap = (obj, f) => {
  const o = {};
  for (const k in obj) { o[k] = f(obj[k]); }
  return o;
};

const modifyAll = (obj, p, f) => {
  const go = (o) => modifyAll(o, p, f);
  if (p(obj)) { return f(obj); }
  if (!obj) return obj;
  if (obj._isBigNumber) return obj;
  if (typeof obj === 'number') return obj;
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) { return obj.map(go); }
  if (Object.keys(obj).length > 0) { return omap(obj, go); }
  throw Error(`idk what this is: ${obj}`);
};

const stripTrailingGarbage = (obj) => {
  return modifyAll(obj,
    ((s) => typeof s === 'string'),
    ((s) => s.split('\u0000')[0])
  );
};

const stringifyNums = (obj) => {
  return modifyAll(obj,
    ((n) => n && (typeof n === 'number' || n._isBigNumber)),
    ((s) => s.toString())
  );
};

const pretty = (obj) => stringifyNums(stripTrailingGarbage(obj));

// XXX this is fragile: sensitive to object field order
const assertEq = (o1, o2) => {
  [o1, o2] = [o1, o2].map(pretty);
  const [ostr1, ostr2] = [o1, o2].map((o) => JSON.stringify(o, null, 2));
  if (ostr1 !== ostr2) {
    console.error(`Expected`, ostr1);
    console.error(`Actual`, ostr2);
    throw Error(`Expected does not match Actual`);
  };
};

const runTest = async ({label, announcerBin, farmBin, numAnns, mkOpts, mkArgObj, toks}) => {
  console.log(`====================================`);
  console.log(`running ${label} test...`);

  const [accDeployer, ...accAnns] = await reach.newTestAccounts(numAnns + 1, amt);
  const ctcDeployer = accDeployer.contract(announcerBin);

  await reach.withDisconnect(async () => {
    await ctcDeployer.p.Deployer({
      ready: reach.disconnect,
    });
  });

  const ctcInfoAnn = await ctcDeployer.getInfo();

  console.log(`Launching & announcing farms`);
  const es = [];
  for (const i in accAnns) {
    const accAnn = accAnns[i];
    // Set up farm
    const now = await reach.getNetworkTime();
    const opts = await mkOpts({accAnn, i, now});
    const ctcFarm = accAnn.contract(farmBin);
    console.log(`Launching farm #${i}...`);
    await reach.withDisconnect(async () => {
      await ctcFarm.p.Deployer({
        opts,
        readyForRewarder: reach.disconnect,
        readyForStakers: reach.disconnect,
      });
    });
    const ctcInfo = await ctcFarm.getInfo();
    const addr = accAnn.getAddress();
    console.log(`Launched`);
    console.log(JSON.stringify({
      addr, ctcInfo,
    }, null, 2));
    await ctcFarm.apis.Setup.fund();
    console.log(`Announcing...`);
    const ctcAnn = accAnn.contract(announcerBin, ctcInfoAnn);
    const argObj = await mkArgObj({i, ctcInfo});
    const res = await ctcAnn.apis.announce(argObj);
    es.push([addr, argObj, res]);

    console.log(`Announced (see above). Result:`);
    console.log(res);
  };

  // observe the farms
  console.log(`Observer is taking a look`);
  const accObs = await reach.createAccount();
  const ctcAnnObs = accObs.contract(announcerBin, ctcInfoAnn);
  for (const eExpected of es) {
    // TODO: not hang forever if the test fails w/ not enough events
    console.log(`Waiting for the next one...`);
    const eActual = await ctcAnnObs.events.Announce.next();
    assertEq(eExpected, eActual.what);
    console.log(`Event matches expectations!`);
    console.log(JSON.stringify(pretty(eActual), null, 2));
  }
}

const time = async (f) => {
  const start = new Date();
  await f();
  const stop = new Date();
  console.log(`Elapsed: ${(stop-start)/1000}s`);
};


console.log(`creating admin account...`);
const amt = reach.parseCurrency('100');
const accAdmin = await reach.newTestAccount(amt);
console.log(`created.`);

console.log(`launching tokens...`);
const numAnns = 2;

const RWD = [];
const STK = [];
for (let i = 0; i < numAnns; i++) {
  console.log(`launching tokens (${i})...`)
  RWD.push(await reach.launchToken(accAdmin, `stake${i}`, `STK${i}`));
  STK.push(await reach.launchToken(accAdmin, `reward${i}`, `RWD${i}`));
}
console.log(`launched.`);

const smallOpts = {
  label: 'small',
  announcerBin: smallAnnouncerBin,
  farmBin,
  numAnns,
  mkOpts: (({accAnn, i, now}) => {
    const start = reach.bigNumberify(now).add(100);
    return {
      rewardToken1: RWD[i].id,
      stakeToken: STK[i].id,
      rewardsPerBlock: [0, 0],
      start,
      end: start.add(1),
      Rewarder0: reach.formatAddress(accAnn),
    };
  }),
  mkArgObj: (({i, ctcInfo}) => {
    void(i);
    return {ctcInfo};
  }),
};

const mediumOpts = {
  ...smallOpts,
  label: 'medium',
  announcerBin: mediumAnnouncerBin,
  mkArgObj: (async ({i, ctcInfo}) => {
    const acc = await reach.createAccount();
    const [tag, info] = await acc.contract(farmBin, ctcInfo).v.Info();
    const argObj = {
      ctcInfo,
      startBlock: info.opts.start,
      endBlock: info.opts.end,
      rewardTokenId: info.opts.rewardToken1,
      rewardsPerBlock: info.opts.rewardsPerBlock,
      stakedTokenId: info.opts.stakeToken,
    };
    // these are just sanity checks
    assertEq('Some', tag);
    assertEq(RWD[i].id, argObj.rewardTokenId);
    assertEq(STK[i].id, argObj.stakedTokenId);
    return argObj;
  }),
};

// TODO: more sophistocated sample data
const getSampleData = (_i, _) => sampleData;

const largeOpts = {
  ...mediumOpts,
  label: 'large',
  announcerBin: largeAnnouncerBin,
  mkArgObj: (async ({i, ctcInfo}) => {
    const medArgObj = await mediumOpts.mkArgObj({i, ctcInfo});
    return {
      ...getSampleData(i, medArgObj),
      ...medArgObj,
    };
  }),
};

await time(() => runTest(smallOpts));
await time(() => runTest(mediumOpts));
await time(() => runTest(largeOpts));
