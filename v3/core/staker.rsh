'reach 0.1';
'use strict';

// traililng underscore means rewards amt is multiplied already
const REWARDS_PREC = UInt256(10_000_000_000); // 1e10

const NET = 0;
const TOK = 1;

const StakeUpdate = Struct([
  ["newUserStaked", UInt],
  ["newEveryoneStaked", UInt],
]);

const Rewards = Tuple(UInt, UInt);
const zeroRewards = [0, 0];
const z256 = UInt256(0);
const Rewards_ = Tuple(UInt256, UInt256);
const zeroRewards256 = [z256, z256];

const RewardsUpdate = Struct([
  ["userReceived", Rewards],
  ["totalRemaining", Rewards],
]);

const Opts = Struct([
  ["rewardToken1", Token],
  ["stakeToken", Token],
  ["rewards", Rewards],
  ["start", UInt],
  ["end", UInt],
  ["Rewarder0", Address],
]);

const Info = Struct([
  ['opts', Opts],
  ['totalStaked', UInt],
  ['remainingRewards', Rewards],
  ['lastRewardsPerShare_', Rewards_],
  ['REWARDS_PREC', UInt256],
]);

const muldivprec = (x, y) => UInt256(x) * y / REWARDS_PREC;
const min = (x, y) => x <= y ? x : y;
const max = (x, y) => x >= y ? x : y;
const zsub = (x, y, z = 0) => {
  if (y >= x) { return z; }
  else { return x - y; }
};
const sumf = (m, f) => m.reduce(0, (acc, e) => acc + f(e));

export const main = Reach.App(() => {
  setOptions({
    // Users deleting their own local state would only hurt themselves.
    // They would lose access to rewards and stake that should be rightfully theirs.
    untrustworthyMaps: false,
    // Would like to turn this on but it would take more time to satisfy the theorem prover.
    verifyArithmetic: false,
  });

  const Deployer = Participant('Deployer', {
    opts: Opts,
    readyForRewarder: Fun([], Null),
    readyForStakers: Fun([], Null),
  });
  const Setup = API('Setup', {
    abortSetup: Fun([], Null),
    fund: Fun([], Null),
  });
  const Staker = API('Staker', {
    stake: Fun([UInt], StakeUpdate),
    harvest: Fun([], RewardsUpdate),
    withdraw: Fun([UInt], StakeUpdate),
    withdrawAndHarvest: Fun([UInt], Tuple(StakeUpdate, RewardsUpdate)),
    emergencyWithdraw: Fun([], StakeUpdate),
  });
  const N = Events({
    Stake: [ Address, UInt, StakeUpdate ],
    // who, amt, newState, to
    Harvest: [ Address, RewardsUpdate, Address ],
    Withdraw: [ Address, UInt, StakeUpdate, Address ],
    EmergencyWithdraw: [ Address, UInt, StakeUpdate, Address ],
  });
  const V = View({
    Opts,
    Info: Fun([], Info),
    staked: Fun([Address], UInt),
    rewardsAvailable: Fun([Address], Rewards),
    rewardsAvailableAt: Fun([Address, UInt /* round */], Rewards),
  });
  init();

  const checkOpts = (opts) => {
    const {start, end} = opts;
    check(start < end);
  };
  Deployer.only(() => {
    const opts = declassify(interact.opts);
    const {rewardToken1, stakeToken} = opts;
    check(rewardToken1 != stakeToken, "can only reward a different token than the one staked");
    checkOpts(opts);
  });
  Deployer.publish(opts, rewardToken1, stakeToken);
  checkOpts(opts);
  V.Opts.set(opts);
  const {rewards, start, end, Rewarder0} = opts;
  const duration = end - start;
  commit();

  Deployer.pay([[rewards[TOK], rewardToken1]]);
  Deployer.interact.readyForRewarder();
  commit();

  const rewardsPerBlock_ = [
    UInt256(rewards[NET]) * REWARDS_PREC / UInt256(duration),
    UInt256(rewards[TOK]) * REWARDS_PREC / UInt256(duration),
  ];

  const assertEnoughReward = (i) => {
    const rewardFunded_ = UInt256(rewards[i]) * REWARDS_PREC;
    const rewardAllBlocks_ = rewardsPerBlock_[i] * UInt256(duration);
    assert(rewardFunded_ >= rewardAllBlocks_, "enough rewards");
  };
  assertEnoughReward(NET);
  assertEnoughReward(TOK);

  const doAbort = () => {
    transfer([[balance(rewardToken1), rewardToken1]]).to(Deployer);
    transfer(balance()).to(Rewarder0);
    commit();
    exit();
  };
  fork()
  .api_(Setup.abortSetup, () => {
    check(this == Deployer || this == Rewarder0);
    return [ 0, (k) => { k(null); doAbort(); } ]
  })
  .api_(Setup.fund, () => {
    check(this == Rewarder0);
    return [ rewards[NET], (k) => { k(null); }];
  });
  assert(balance() == rewards[NET]);
  Deployer.interact.readyForStakers();

  const UserData = Object({
    stake: UInt,
    rewards: Rewards_,
  });
  const Users = new Map(UserData);
  // Staking "late" is treated as though "you already got" rewards up until the moment you staked

  const lookupUserData = (addr) => fromSome(Users[addr], {
    stake: 0,
    rewards: zeroRewards256,
  });
  const userUpdate = (addr, f) => {
    Users[addr] = f(lookupUserData(addr));
  };

  const lookupStaked = (addr) => lookupUserData(addr).stake;
  const lookupRewardsPaid = (addr) => lookupUserData(addr).rewards;
  V.staked.set(lookupStaked);

  const  [totalStaked, remainingRewards, lastRewardsRefreshed, lastRewardsPerShare_] =
    parallelReduce([0,          rewards,                start,       zeroRewards256])
    .define(() => {
      const userStakes = () => sumf(Users, (x) => x.stake);
      const refresh = (now) => { // calc new rewardsPerShare_
        if (totalStaked == 0) {
          return lastRewardsPerShare_;
        } else {
          const go = (i) => {
            const blocks = zsub(min(end, now), max(start, lastRewardsRefreshed));
            const more_ = rewardsPerBlock_[i] * UInt256(blocks) / UInt256(totalStaked);
            return lastRewardsPerShare_[i] + more_;
          }
          return [go(NET), go(TOK)];
        }
      };
      const lookupRewards_i = (addr, rewardsPerShare_, i) => {
        const youStaked = lookupStaked(addr);
        const youAlreadyGot = lookupRewardsPaid(addr)[i];
        assert(youStaked <= totalStaked);
        const totalRewardsForYou = muldivprec(youStaked, rewardsPerShare_[i]);
        // TODO prove zsub is unnecessary
        const amtDeserved256 = zsub(totalRewardsForYou, youAlreadyGot, z256);
        // TODO: verified downcast
        const amtDeserved = UInt(amtDeserved256);
        // TODO prove min is unnecessary
        const amt = min(amtDeserved, remainingRewards[i]);
        return amt;
      };
      const lookupRewards = (addr, rewardsPerShare_) => [
        lookupRewards_i(addr, rewardsPerShare_, NET),
        lookupRewards_i(addr, rewardsPerShare_, TOK),
      ];
      const lookupRewardsAt = (addr, when) => lookupRewards(addr, refresh(when));
      // TODO: lastConsensusTime() instead of lastRewardsRefreshed, when Reach allows it
      const lookupRewards_lrr = (addr) => lookupRewardsAt(addr, lastRewardsRefreshed);
      V.Info.set(() => Info.fromObject({
        opts, totalStaked, remainingRewards, lastRewardsPerShare_, REWARDS_PREC,
      }));
      V.rewardsAvailableAt.set(lookupRewardsAt);
      V.rewardsAvailable.set(lookupRewards_lrr);
    })
    .invariant(balance(stakeToken) == totalStaked)
    .invariant(userStakes() == totalStaked)
    .invariant(balance() == remainingRewards[NET])
    .invariant(rewards[NET] >= remainingRewards[NET])
    .invariant(balance(rewardToken1) == remainingRewards[TOK])
    .invariant(rewards[TOK] >= remainingRewards[TOK])
    .paySpec([stakeToken])
    .while(true)
    .define(() => {
      const doStake = (who, amt, rewardsPerShare_) => {
        const newEveryoneStaked = totalStaked + amt;
        const newUserStaked = lookupStaked(who) + amt;
        const currentPaid = lookupRewardsPaid(who);
        const mkNewPaid = (i) => {
          const morePaid = muldivprec(amt, rewardsPerShare_[i]);
          return currentPaid[i] + morePaid;
        };
        Users[who] = {
          stake: newUserStaked,
          rewards: [
            mkNewPaid(NET),
            mkNewPaid(TOK),
          ],
        };
        return StakeUpdate.fromObject({newUserStaked, newEveryoneStaked});
      };
    })
    .api_(Staker.stake, (amt) => {
      const now = thisConsensusTime();
      check(lastRewardsRefreshed < end, "can only stake before the end");
      // TODO: check now instead of lastRewardsRefreshed
      // check(now <= end, "can only stake before the end");
      check(amt > 0, "must stake more than 0");
      const rewardsPerShare_ = refresh(now);
      return [ [0, [amt, stakeToken]], (k) => {
        const SU = doStake(this, amt, rewardsPerShare_);
        k(SU);
        N.Stake(this, amt, SU);
        return [SU.newEveryoneStaked, remainingRewards, now, rewardsPerShare_];
      }];
    })
    .define(() => {
      const doWithdraw = (who, amt, to, rewardsPerShare_) => {
        const oldUserStaked = lookupStaked(who);
        const newEveryoneStaked = totalStaked - amt;
        const newUserStaked = oldUserStaked - amt;
        const currentPaid = lookupRewardsPaid(who);
        assert(oldUserStaked <= totalStaked);
        assert(amt <= oldUserStaked);
        assert(newUserStaked <= newEveryoneStaked);
        const lessPaid = (i) => muldivprec(amt, rewardsPerShare_[i]);
        // If lessPaid > currentPaid, the user is losing rewards
        const mkNewPaid = (i) => zsub(currentPaid[i], lessPaid(i), z256);
        transfer([[amt, stakeToken]]).to(to);
        Users[who] = {
          stake: newUserStaked,
          rewards: [
            mkNewPaid(NET),
            mkNewPaid(TOK),
          ],
        };
        return StakeUpdate.fromObject({newUserStaked, newEveryoneStaked});
      };
    })
    .api_(Staker.withdraw, (amt) => {
      const now = thisConsensusTime();
      check(amt <= lookupStaked(this), "can only withdraw if balance is sufficient");
      const rewardsPerShare_ = refresh(now);
      return [ [0, [0, stakeToken]], (k) => {
        const SU = doWithdraw(this, amt, this, rewardsPerShare_);
        k(SU);
        N.Withdraw(this, amt, SU, this);
        return [SU.newEveryoneStaked, remainingRewards, now, rewardsPerShare_];
      }];
    })
    .api_(Staker.emergencyWithdraw, () => {
      return [[0, [0, stakeToken]], k => {
        const userStaked = lookupStaked(this);
        const newEveryoneStaked = totalStaked - userStaked;
        const SU = StakeUpdate.fromObject({newUserStaked: 0, newEveryoneStaked});
        k(SU);
        transfer([[userStaked, stakeToken]]).to(this);
        Users[this] = {...lookupUserData(this), stake: 0};
        N.EmergencyWithdraw(this, userStaked, SU, this);
        return [newEveryoneStaked, remainingRewards, lastRewardsRefreshed, lastRewardsPerShare_];
      }];
    })
    .define(() => {
      const doHarvest = (who, to, rewardsPerShare_) => {
        const amts = lookupRewards(who, rewardsPerShare_);
        assert(amts[NET] <= remainingRewards[NET]);
        assert(amts[TOK] <= remainingRewards[TOK]);
        transfer([amts[NET], [amts[TOK], rewardToken1]]).to(to);
        const mkTotalRemaining = (i) => (remainingRewards[i] - amts[i]);
        const totalRemaining = [
          mkTotalRemaining(NET),
          mkTotalRemaining(TOK),
        ];
        const paid = lookupRewardsPaid(who);
        const mkNewPaid = (i) => paid[i] + UInt256(amts[i]);
        userUpdate(who, (old) => ({
          ...old,
          rewards: [
            mkNewPaid(NET),
            mkNewPaid(TOK),
          ],
        }));
        return RewardsUpdate.fromObject({userReceived: amts, totalRemaining});
      };
    })
    .api_(Staker.harvest, () => {
      const now = thisConsensusTime();
      const rewardsPerShare_ = refresh(now);
      return [ [0, [0, stakeToken]], (k) => {
        const RU = doHarvest(this, this, rewardsPerShare_);
        k(RU);
        N.Harvest(this, RU, this);
        return [totalStaked, RU.totalRemaining, now, rewardsPerShare_];
      }];
    })
    .api_(Staker.withdrawAndHarvest, (amt) => {
      const now = thisConsensusTime();
      check(amt <= lookupStaked(this), "can only withdraw if balance is sufficient");
      const rewardsPerShare_ = refresh(now);
      return [ [0, [0, stakeToken]], (k) => {
        const RU = doHarvest(this, this, rewardsPerShare_);
        const SU = doWithdraw(this, amt, this, rewardsPerShare_);
        k([SU, RU]);
        N.Harvest(this, RU, this);
        N.Withdraw(this, amt, SU, this);
        return [SU.newEveryoneStaked, RU.totalRemaining, now, rewardsPerShare_];
      }];
    });

  doAbort(); // Unreachable, but this would be the right thing to do if it were
});
