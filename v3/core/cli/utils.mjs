import algosdk from "algosdk";
import { loadStdlib } from "@reach-sh/stdlib";
import { yesno } from "@reach-sh/stdlib/ask.mjs";
import { getTestNetAccount, ask, bold } from "../util.mjs";
import { runAnnouncerManager } from "./participants/Announcer.mjs";
import runAnnouncerListener from "./participants/Listener.mjs";

let reach;

export function useReach() {
  if (!reach) {
    const connectorModeArg = process.argv.find((a) =>
      a.startsWith("REACH_CONNECTOR_MODE=")
    );
    const REACH_CONNECTOR_MODE = connectorModeArg
      ? connectorModeArg.replace("REACH_CONNECTOR_MODE=", "")
      : "ALGO";
    reach = loadStdlib({ REACH_CONNECTOR_MODE });
    reach.setProviderByName("TestNet");
  }

  return reach;
}

export const maybeTok = (tokA) =>
  !tokA.id ? ["None", null] : ["Some", tokA.id];

export const isAOrB = (a, b) => (ans) => {
  const lowerAns = ans.toLowerCase();
  const validAnswers = [a.toLowerCase(), b.toLowerCase()];

  if (!validAnswers.includes(lowerAns)) {
    throw Error(`Only "${a}" or "${b}" are valid answers.`);
  } else return lowerAns === validAnswers[0] ? a : b;
};

const ResetClr = `\x1b[0m`;
export const Bright = (s) => `\x1b[1m${s}${ResetClr}`;
export const Dim = (s) => `\x1b[2m${s}${ResetClr}`;
export const Underscore = (s) => `\x1b[4m${s}${ResetClr}`;
export const Blink = (s) => `\x1b[5m${s}${ResetClr}`;
export const FgRed = (s) => `\x1b[31m${s}${ResetClr}`;
export const FgGreen = (s) => `\x1b[32m${s}${ResetClr}`;
export const FgYellow = (s) => `\x1b[33m${s}${ResetClr}`;
export const FgBlue = (s) => `\x1b[34m${s}${ResetClr}`;
export const fmt = (x) => {
  const stdlib = useReach();
  return stdlib.formatCurrency(x, stdlib.connector == "ALGO" ? 6 : 18);
};

export async function createAlgoAccount(secret) {
  const reach = useReach();
  const acct = await getAccountFromMnemonic(secret);
  const { networkAccount } = acct;
  const mnm = algosdk.secretKeyToMnemonic(networkAccount.sk);
  const BASE_FAUCET_URL = "https://bank.testnet.algorand.network/";
  console.log(
    Bright(FgGreen("\t 💰 Created account:\n")),
    `\t 💰 ${mnm}\n\n`,
    Bright(FgGreen("\t 💰 Fund the account here:\n")),
    `\t 💰 ${BASE_FAUCET_URL}?account=${networkAccount.addr}\n\n`,
    Bright(FgGreen("\t 💰 then return to continue\n"))
  );

  return [mnm, networkAccount.addr, acct];
}

export function exitWithMsgs(...msgs) {
  console.log(...msgs);
  process.exit();
}

export function exitNoMnemonic(...msgs) {
  const chain = useReach().connector;
  const err = FgRed(`🔑 Cannot reveal new mnemonic for ${chain}.\n`);
  const cmd = Bright('make [ cmd ] KEY="your mnemonic here"');

  return exitWithMsgs(
    Bright(err),
    `Please run the last command with a mnemonic:\n\n${cmd}`
  );
}

export async function getAccountFromArgs(args) {
  const reach = useReach();
  const mnemonic = getMnemonicFromArgs(args);
  let acct;

  if (!mnemonic) {
    console.log(Bright(FgRed("🔑 No Mnemonic found!")));
    if (reach.connector !== "ALGO") return exitNoMnemonic();

    const prompt = Bright(FgYellow("🏛 Create new account? (y/n)"));
    if (await ask(prompt, yesno)) {
      const [_m, _a, newAcc] = await createAlgoAccount();
      acct = newAcc;
    } else {
      const cmd = Bright(FgBlue('make [ cmd ] KEY="your mnemonic here"'));
      exitWithMsgs(`Please rerun with a mnemonic:\n\n\t${cmd}\n\n`);
    }
  } else {
    console.log(Bright(FgGreen("\n🔑 Found Mnemonic!")));
    acct = await getAccountFromMnemonic(mnemonic);
  }
  if (reach.connector == "ETH") acct.setGasLimit(5000000);

  return acct;
}

export async function getAccountFromMnemonic(secret) {
  const stdlib = useReach();
  if (!secret) return await stdlib.createAccount();

  const isAlgo = stdlib.connector == "ALGO";
  return await (isAlgo
    ? stdlib.newAccountFromMnemonic(secret)
    : stdlib.newAccountFromSecret(secret));
}

export function getMnemonicFromArgs(args) {
  console.log(Bright(FgYellow("🔑 Getting Mnemonic ...")));
  const isKey = new RegExp(/^key=/);
  const key = args.find((a) => a.startsWith("key=")) || "key=";
  return key.replace("key=", "");
}

export function parseContractAddress(addr) {
  let ctcInfo = parseInt(addr);
  if (useReach().connector !== "ALGO") {
    let pit = addr.toString().trim().replace(/\0.*$/g, "");
    ctcInfo = pit.startsWith("0x") ? pit : "0x" + pit;
  }
  return ctcInfo;
}

export function parseBoolOrExit(a) {
  if (typeof a === "boolean") return a;
  if (["y", "n"].includes(a)) return yesno(a);
  return exitWithMsgs(Bright(FgRed("Invalid answer: Exiting ... ")));
}

export function parseIntOrExit(a) {
  if (a && !isNaN(a)) return Number(a);
  return exitWithMsgs(Bright(FgRed("Invalid answer: Exiting ... ")));
}

export function parseOrExit(a) {
  if (a) return JSON.parse(a);
  return exitWithMsgs(Bright(FgRed("Invalid answer: Exiting ... ")));
}

export function promptIsFunded(acct) {
  const reach = useReach();
  return `
    ⛓ Chain: ${Bright(reach.connector)}
    💳 Account: ${Bright(reach.formatAddress(acct.getAddress()))}
    💰 ${Bright(FgYellow("Is the new account funded?"))}
    ("y" / "n" to exit):
    `;
}

export async function getBalance(tokenX, who) {
  const reach = useReach();
  let tokId = tokenX.id;
  if (reach.connector == "ALGO") {
    tokId = !isNaN(tokId) && parseInt(tokId);
  }

  const amt = await reach.balanceOf(who, tokId);
  return `${fmt(amt)} ${tokenX.symbol || tokenX}`;
}

export async function getBalances(who, tokA, tokB) {
  const [balA, balB] = await Promise.all([
    getBalance(tokA, who),
    getBalance(tokB, who),
  ]);

  return `${balA} & ${balB}`;
}

// True: token is tokA, False: token is tokB
export function compareTokens(token, tokenId) {
  return token[0] == "None" || stdlib.connector == "ALGO"
    ? token[1].eq(tokenId || 0)
    : token[1] == tokenId;
}
