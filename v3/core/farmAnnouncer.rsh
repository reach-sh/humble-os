'reach 0.1';
'use strict';
import {ann} from './announcer.rsh';

// const enf_compat = enforce // use this if newer reach
const enf_compat = (..._) => null; // use this if older reach, bleh

const Rewards = Tuple(UInt, UInt);

const RewardsUpdate = Struct([
  ["userReceived", Rewards],
  ["totalRemaining", Rewards],
]);

const Opts = Struct([
  ["rewardToken1", Token],
  ["stakeToken", Token],
  ["rewardsPerBlock", Rewards],
  ["start", UInt],
  ["end", UInt],
  ["Rewarder0", Address],
]);

const Info = Struct([
  ['opts', Opts],
  ['totalStaked', UInt],
  ['remainingRewards', Rewards],
]);

const smallFields = [["ctcInfo", Contract]];

const smallOpts = {
  name: 'Info',
  Domain: [],
  Range: Info,
  DomainPre: Struct(smallFields),
  RangePost: Null,
  preChecks: (..._) => {},
  postChecks: (..._) => {},
  pre: (_) => [],
  post: (..._) => null,
};
export const small = ann(smallOpts);

// Medium ===============================
const MToken = Maybe(Token);
const mediumFields = [
  ...smallFields,
  ['startBlock', UInt],
  ['endBlock', UInt],
  ['rewardTokenId', Token],
  ['rewardsPerBlock', Rewards],
  ['stakedTokenId', Token],
];

const mediumOpts = {
  ...smallOpts,
  DomainPre: Struct(mediumFields),
  postChecks: ({argsPre, args, ret, retPost, sender}) => {
    void sender;
    assert(args == []);
    assert(retPost == null);
    const enforceOpt2 = ([f1, f2]) => enf_compat(argsPre[f1] == ret.opts[f2], f1);
    enforceOpt2(['rewardsPerBlock', 'rewardsPerBlock']);
    enforceOpt2(['startBlock',      'start']);
    enforceOpt2(['endBlock',        'end']);
    enforceOpt2(['rewardTokenId',   'rewardToken1']);
    enforceOpt2(['stakedTokenId',   'stakeToken']);
  },
};
export const medium = ann(mediumOpts);

// Large ========================================
const largeFields = [
  ...mediumFields,
  ['pairTokenAId', MToken],
  ['pairTokenASymbol', Bytes(8)],
  ['pairTokenBId', Token],
  ['pairTokenBSymbol', Bytes(8)],
  ['rewardTokenDecimals', UInt],
  ['rewardTokenSymbol', Bytes(8)],
  ['stakedTokenDecimals', UInt],
  ['stakedTokenPoolId', Token],
  ['stakedTokenSymbol', Bytes(8)],
  ['stakedTokenTotalSupply', UInt],
];

const largeOpts = {
  ...mediumOpts,
  DomainPre: Struct(largeFields),
  postChecks: (data) => {
    mediumOpts.postChecks(data);
    // TODO: more checks
  },
};
export const large = ann(largeOpts);
