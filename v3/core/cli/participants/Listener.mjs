import * as announcerBackend from "../../build/announcer.main.mjs";
import * as poolBackend from "../../build/index.main.mjs";
import * as n2nnPoolBackend from "../../build/n2nn.main.mjs";
import { ask } from "../../util.mjs";
import {
  Bright,
  Dim,
  FgBlue,
  FgGreen,
  FgRed,
  FgYellow,
  exitWithMsgs,
  fmt,
  getAccountFromArgs,
  parseContractAddress,
  promptIsFunded,
  useReach,
} from "../automated.utils.mjs";

const reset = (...msgs) => {
  console.clear();
  console.log(Bright(FgRed(`👂 Announcer Listener (auto)\n`)), ...msgs);
};

export default async function runAnnouncerListener(args, announcerCtc, acc) {
  const fromArgs = () => {
    const flag = args.find((a) => a.startsWith("announcer=")) || "";
    return flag.replace("announcer=", "");
  };

  const info = announcerCtc || fromArgs();
  if (!info || parseInt(info) === 1) {
    const exitMsg = `
      ${Bright(FgBlue("📄 Announcer Listener"))}
      ${FgRed("⚠️ 'announcer' key is missing but required!")}
      ${FgRed("⚠️ Please rerun with an announcer contract provided:")}
  
      ${FgYellow("make listener ANNOUNCER=...")}
      `;
    return exitWithMsgs(exitMsg);
  }

  reset(`
    ${Bright(FgBlue("📄 Announcer Listener"))}
    ${Bright(FgBlue("📄 Contract:"))} ${info}

    ${Bright(FgRed(`⚠️ This creates a promise that will never resolve!`))}
    ${FgRed(`⚠️ Use`)} ${Bright("[ ctrl + c ]")} ${FgRed(
    `to force-exit when needed.`
  )}
    `);

  const stdlib = useReach();
  const listenerAcct = acc || (await getAccountFromArgs(args));
  if (Boolean(acc) || (await ask(promptIsFunded(listenerAcct))) === "y") {
    const ctc = listenerAcct.contract(announcerBackend, info);
    console.log(Bright(`Listening to ${info}...`), Dim(`[ ctrl + c ] to quit`));

    return new Promise(() =>
      ctc.participants.Listener({
        hear: async (poolInfo, usesNetworkToken) => {
          const info = parseContractAddress(poolInfo)
          await renderPoolInfo(listenerAcct, info, usesNetworkToken);
          console.log(Dim("Waiting for new publications ... "));
        },
      })
    );
  }

  return exitWithMsgs(Bright(FgRed("Please retry with a funded account")));
}

export async function renderPoolInfo(acct, poolAppId, usesNetwork) {
  const theBackend = usesNetwork ? n2nnPoolBackend : poolBackend;
  const ctcPool = acct.contract(theBackend, poolAppId);
  const { Tokens: TokensView } = ctcPool.views;
  const [tokA, tokB, aBal, bBal, mLPTok] = await Promise.all([
    TokensView.aTok(),
    TokensView.bTok(),
    TokensView.aBal(),
    TokensView.bBal(),
    TokensView.liquidityToken(),
  ]);

  if (tokB[0] == "None") {
    console.log(Dim(`⛔️ Pool ${poolAppId} does not have token info`));
    return;
  }

  const [resA, resB, resC] = await Promise.all([
    tokA[1] == null
      ? Promise.resolve(makeToken())
      : acct.tokenMetadata(tokA[1]),
    acct.tokenMetadata(tokB[1]),
    acct.tokenMetadata(mLPTok[1]),
  ]);
  const tokABal = aBal[0] == "None" ? 0 : aBal[1];
  const tokBBal = bBal[0] == "None" ? 0 : bBal[1];
  const mTokA = makeToken(tokA[1], resA);
  const mTokB = makeToken(tokB[1], resB);
  const lpTok = makeToken(mLPTok[1], resC);
  const info = {
    ctcPool,
    poolAddr: poolAppId,
    tokA: mTokA,
    tokB: mTokB,
    lpTok: lpTok,
  };
  const jsonInfo = {
    poolAddr: poolAppId,
    tokA: mTokA.id,
    tokB: mTokB.id,
    lpTok: lpTok.id,
  };

  const network = `(${Bright(usesNetwork ? "has" : "no")} network tokens)`;
  console.log(`
    ${Bright(FgGreen("Pool ID"))}: ${Dim(poolAppId)} ${network}
    ${Bright(FgYellow("Info"))}: ${Dim(JSON.stringify(jsonInfo))}
    ${describeToken(tokABal, resA.symbol, mTokA.supply)}
    ${describeToken(tokBBal, resB.symbol, mTokB.supply)}
  `);

  return info;
}

function describeToken(bal, tokSym, tokSupply) {
  const desc = `${Bright(fmt(bal))} ${Dim(FgYellow(tokSym))}`;
  return `${desc} ${Dim(`(${Bright("supply")}: ${tokSupply})`)}`;
}

function makeToken(id = null, data = {}) {
  const reach = useReach();
  const parseId = (v) => (reach.connector === "ALGO" ? parseInt(v) : v);
  const token = {
    name: data.name || reach.connector,
    symbol: data.symbol || reach.connector,
    supply: fmt(data.supply || 0),
    id: id && parseId(id),
  };

  return { id, ...token };
}
