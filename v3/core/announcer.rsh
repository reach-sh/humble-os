'reach 0.1';
'use strict';

export const ann = (opts) => Reach.App(() => {
  const {name, Domain, Range, DomainPre, RangePost, pre, post, preChecks, postChecks} = opts;
  const Deployer = Participant('Deployer', {ready: Fun([], Null)});
  const RemoteI = {
    [name]: Fun(Domain, Range),
  };
  const A = API({
    // DomainPre must be a Struct which includes ["ctcInfo": Contract]
    announce: Fun([DomainPre], RangePost),
  });
  const N = Events({
    // Address is announcing DomainPre.ctcInfo.
    // This contract called a method on that contract,
    // with inputs based on DomainPre,
    // and got results which we turned into RangePost.
    Announce: [Address, DomainPre, RangePost],
  });
  init();
  Deployer.publish();
  Deployer.interact.ready();
  const [] = parallelReduce([])
    .while(true)
    .invariant(balance() == 0, 'zero balance')
    .api_(A.announce, (argsPre) => {
      const args = pre(argsPre);
      const sender = this;
      preChecks({argsPre, args, sender});
      return [0, (k) => {
        const ret = remote(argsPre.ctcInfo, RemoteI)[name](...args);
        const retPost = post(ret, argsPre);
        postChecks({argsPre, args, ret, retPost, sender});
        k(retPost);
        N.Announce(this, argsPre, retPost);
        return [];
      }];
    });
  commit();
});
