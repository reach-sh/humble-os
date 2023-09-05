import { yesno } from "@reach-sh/stdlib/ask.mjs";
import * as poolBackend from "../../build/index.main.mjs";
import * as n2nnPoolBackend from "../../build/n2nn.main.mjs";
import { ask } from "../../util.mjs";
import {
  Bright,
  Dim,
  FgYellow,
  FgBlue,
  FgGreen,
  FgRed,
  exitWithMsgs,
  fmt,
  getAccountFromArgs,
  getBalances,
  parseContractAddress,
  parseBoolOrExit,
  parseIntOrExit,
  parseOrExit,
  promptIsFunded,
  useReach,
} from "../automated.utils.mjs";
import runAnnouncerListener, { renderPoolInfo } from "./Listener.mjs";

const reset = (...msgs) => {
  console.log(Bright(FgRed(`🏦 Liquidity Provider (auto)\n`)), ...msgs);
};
// 44145849
export default async function runLiquidityProvider(args, announcerCtc, acc) {
  if (!announcerCtc || announcerCtc === "1") {
    return exitWithMsgs(
      FgRed(`⚠️ Invalid`),
      Bright(FgRed("announcer contract")),
      FgRed(`supplied!\n\n`)
    );
  }

  reset(`
    ${Bright(FgBlue("📄 Liquidity Provider"))}
    ${Bright(FgBlue("📄 Contract:"))} ${announcerCtc}
    `);

  const reach = useReach();
  const accProvider = acc || (await getAccountFromArgs(args));
  if ((await ask(promptIsFunded(accProvider))) !== "y") {
    const cmd = Bright(FgBlue('make [ cmd ] KEY="your mnemonic here"'));
    return exitWithMsgs(`Please rerun with a funded account:\n\n\t${cmd}\n\n`);
  }

  console.log(Dim("⚙️ Setting account debug label ... "));
  await accProvider.setDebugLabel("Provider");

  // (optional) Run Listener in parallel since it will *NEVER* resolve.
  const listenerPrompt = `
  ${Bright(FgYellow("👂 Would you like to run a Listener?"))}
  ${Dim("+ This will announce any existing or newly-created pools.")}
  ${Dim("+ It is useful if you don't have a pool address on hand")}
  ${FgYellow("[ 'y' / any key to skip ]")}`;
  if ((await ask(listenerPrompt)) === "y") {
    runAnnouncerListener(args, announcerCtc, accProvider);
  }

  const poolAddrPrompt = `
  ${Bright(FgYellow("🪙 / 🪙 Enter Pool Address when ready:"))}
  ${Dim(FgYellow(`Format: "XXX..."`))}
  ${Dim("[ '0' to exit ]")}\n`;
  const poolAddr =
    (args.find((a) => a.startsWith("pool=")) || "").replace("pool=", "") ||
    (await ask(poolAddrPrompt, (a) =>
      a === "0" ? exitWithMsgs(Bright(FgRed("Exiting ..."))) : a
    ));

  const usesNetwork =
    args.find((a) => a.startsWith("is-network-pool")) === "1" ||
    (await ask(
      Bright(FgYellow(`Does pool "${poolAddr}" use network tokens?`)),
      parseBoolOrExit
    ));

  // Fetch Pool Data
  console.log(`${Bright(Dim("🪙 / 🪙 Fetching Pool metadata ... "))}\n`);
  const { tokA, tokB, lpTok, ctcPool } = await renderPoolInfo(
    accProvider,
    parseContractAddress(poolAddr),
    usesNetwork
  ).catch(console.log);

  // (Optional) Token opt-in
  const optInPrompt = Bright(FgYellow("🪙 / 🪙 Opt in to LP token? (y/n)"));
  if ((await ask(optInPrompt)) === "y") {
    console.log(`${Bright(FgYellow("🪙 Opting in to all Pool Tokens ... "))}\n`);
    const promises = [
      accProvider.tokenAccept(tokB.id),
      accProvider.tokenAccept(lpTok.id),
    ];

    if (!usesNetwork) promises.unshift(accProvider.tokenAccept(tokA.id));

    await Promise.all(promises);
  }

  //   Add/Withdraw Liquidity
  const symbolA = tokA.symbol;
  const symbolB = tokB.symbol;
  const promptAction = [
    Bright(FgYellow("Select an option:")),
    `\t1. ${Bright("Add Liquidity")}
     \t   ${Dim("+ Deposit tokens into Pool")}`,
    `\t2. ${Bright("Withdraw Liquidity")}
     \t   ${Dim("+ Withdraw tokens from Pool")}`,
    `${Dim(`\n\nOr Use any key to Exit`)}`,
  ].join("\n");
  const next = await ask(promptAction, parseIntOrExit);
  const ProviderAPI = ctcPool.apis.Provider;

  switch (next) {
    //   Add Liquidity
    case 1: {
      console.log(Bright(FgBlue("\t→ Add Liquidity")));
      const myBals = await getBalances(accProvider, tokA, tokB);
      const getAmt = async (symbol) =>
        ask(
          `${Bright(`How much ${symbol} do you want to deposit?`)}
        ${Dim(`(Bal: ${myBals})`)}`,
          parseIntOrExit
        );
      const amtA = await getAmt(symbolA);
      const amtB = await getAmt(symbolB);
      const deposit = {
        amtA: reach.parseCurrency(amtA),
        amtB: reach.parseCurrency(amtB),
      };

      console.log(Bright(FgYellow("Adding Liquidity ... ")));
      const [a, b, mintedTokens] = await ProviderAPI.deposit(
        deposit
      ).catch((e) => exitWithMsgs(Bright(FgRed(e.message || e))));

      const success = `Deposited ${fmt(a)} ${symbolA} and ${fmt(b)} ${symbolB}`;
      return console.log(Bright(FgGreen(success)));
    }

    //   Withdraw Liquidity
    case 2: {
      console.log(Bright(FgBlue("→ Add Liquidity")));
      const promptAmt = Bright(FgYellow(`Withdraw how much?`));
      const amt = await ask(promptAmt, reach.parseCurrency);

      console.log(Bright(FgYellow("Withdrawing liquidity ... ")));
      const [[a, b]] = await ProviderAPI.withdraw(amt);

      const msg = `I got ${fmt(a)} ${symbolA} & ${fmt(b)} ${symbolB}`;
      console.log(Bright(FgGreen(msg)));

      return null;
    }
  }

  await Promise.all([backendProvider]);
}
