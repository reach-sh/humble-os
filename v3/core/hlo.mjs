// reach compile index.rsh
// reach run hlo
import * as pr from './build/index.triumvirate.mjs';
import * as hs_tok_tok from './build/index.tok_tok.mjs';
import * as lo_tok_tok from './build/limitOrder.lo_tok_tok.mjs';
import * as hf_tok_tok from './build/hlo.hf_tok_tok.mjs';
import {loadStdlib} from '@reach-sh/stdlib';

const reach = loadStdlib({...process.env, REACH_NO_WARN: 'Y'});
const amt = reach.parseCurrency(100);
const [accAdmin, accHS, accLO, accHF] = await reach.newTestAccounts(4, amt);
const accs = [accHS, accLO, accHF];
const ctcPR = accAdmin.contract(pr);
const ctcHS = accHS.contract(hs_tok_tok);
const ctcLO = accLO.contract(lo_tok_tok);
const ctcHF = accHF.contract(hf_tok_tok);
const tokA_ = await reach.launchToken(accAdmin, 'A', 'A', {decimals: 0});
const tokB_ = await reach.launchToken(accAdmin, 'B', 'B', {decimals: 0});
const toks = [tokA_.id, tokB_.id];
const [tokA, tokB] = toks;
const amtA = 10;
const amtB = 100;
const poolAmtA = amtA * 1000;
const poolAmtB = amtB * 1000;
for (const acc of accs) {
  for (const tok of toks) {
    await acc.tokenAccept(tok);
  }
}
await tokA_.mint(accLO, amtA);
await tokA_.mint(accHS, poolAmtA)
await tokB_.mint(accHS, poolAmtB);
const balances = async () => {
  for (const acc of accs) {
    const [a, b] = await reach.balancesOf(acc, toks)
    const accStr = reach.formatAddress(acc).slice(0,8);
    console.log(`${accStr} has ${a.toString()} A and ${b.toString()} B`);
  }
};
await balances();
const dc = async (lab, ctc, part, args) => {
  await reach.withDisconnect(() => ctc.p[part]({
    ...args, disconnect: reach.disconnect,
  }));
  const info = await ctc.getInfo();
  console.log(`...launched ${lab}`);
  return info;
};
const infoPR = await dc('PR', ctcPR, 'Admin', {
  triumvirs: [accAdmin, accAdmin, accAdmin],
  ready: reach.disconnect,
});
let lpTok = null;
const infoHS = await dc('HS', ctcHS, 'Admin', {
  tokA,
  tokB,
  ltName: 'ltName',
  ltSymbol: 'ltSymbol',
  signalPoolCreation: (tok) => {
    lpTok = tok;
    reach.disconnect();
  },
  proto: infoPR,
});
const infoLO = await dc('LO', ctcLO, 'D', {opts: {
  tokA, tokB, amtA, amtB,
}});
const infoHF = await dc('HF', ctcHF, 'D', {opts: {
  tokA, tokB, pool: infoHS, a4b: true,
}});
await accHS.tokenAccept(lpTok);
await ctcHS.a.Provider.deposit({A: poolAmtA, B: poolAmtB});
await balances();
accHF.setGasLimit(5000000);
const ctc = accHF.contract(lo_tok_tok, infoLO);
await ctc.a.SwapVia(infoHF, infoHS);
console.log(`...swapped`);
await balances();
await ctcHF.a.Get();
console.log(`...got`);
await balances();
console.log('done');
