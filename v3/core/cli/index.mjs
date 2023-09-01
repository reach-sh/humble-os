import algosdk from "algosdk";
import { yesno } from "@reach-sh/stdlib/ask.mjs";
import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from "../build/index.main.mjs";
import * as n2nnBackend from "../build/n2nn.main.mjs";
import { ask } from "../util.mjs";
import {
  Bright,
  Dim,
  FgRed,
  exitWithMsgs,
  getAccountFromArgs,
  parseContractAddress,
  promptIsFunded,
} from "./utils.mjs";
import initAnnouncerContract, {
  runAnnouncerManager,
} from "./participants/Announcer.mjs";
import runTokenFunder from "./participants/TokenFunder.mjs";
import runPoolAdmin from "./participants/PoolAdmin.mjs";
import runAnnouncerListener from "./participants/Listener.mjs";
import runLiquidityProvider from "./participants/LiquidityProvider.mjs";
import runTrader from "./participants/Trader.mjs";

const runDuoSwapTrader = async (useTestnet) => {};

const options = [
  `1: ${Bright(`DuoSwap Announcer Constructor`)}
      ${Dim(`+ Creates an Announcer contract`)}
  `,
  `2: ${Bright(`DuoSwap Announcer Manager`)}
      ${Dim(`+ Announces all the available pool addresses`)}
  `,
  `3: ${Bright(`DuoSwap Announcer Listener`)}
      ${Dim(`+ Listens for all the available pool addresses`)}
  `,
  `4: ${Bright(`DuoSwap Token Funder`)}
      ${Dim(`+ Mint a token pair and fund an address you specify`)}
  `,
  `5: ${Bright(`DuoSwap Pool Admin`)}
      ${Dim(`+ Create a pool for a pair of tokens`)}
  `,
  `6: ${Bright(`DuoSwap Liquidity Provider`)}
      ${Dim(`+ Receive liquidity tokens by depositing tokens into a pool`)}
     ${Dim(`+ Withdraw liquidity from a pool`)}\n`,
  `7: ${Bright(`DuoSwap Trader`)}
      ${Dim(`+ Trade one token for another in available pools`)}
    `,
  `8: ${Bright(`Exit`)}
      ${Dim(`+ You are confused, enraged, and/or have made an error.`)}
  `,
].join("\n");

export async function runInteractive(args) {
  const acc = await getAccountFromArgs(args);
  if ((await ask(promptIsFunded(acc))) !== "y")
    return exitWithMsgs(Bright(FgRed("Exiting: retry with funded account")));

  const answer = await ask(`Who are you?\n${options}`, parseInt);
  if (isNaN(answer) || answer === 0 || answer > 7) {
    return exitWithMsgs(FgRed("Invalid entry. Exiting ... "));
  }

  const announcerCtc =
    validateAnnouncerFlag(args) ||
    (await ask(
      `Do you have an announcer contract address?`,
      parseContractAddress
    ));

  switch (answer) {
    case 1: // Announcer Constructor
      return initAnnouncerContract(args);

    case 2: // Announcer Manager
      return runAnnouncerManager(args, announcerCtc, acc);

    case 3: // Listener
      return runAnnouncerListener(args, announcerCtc, acc);

    case 4: // Token Funder
      return runTokenFunder(args, null, acc);

    case 5: // Pool Admin
      // Creates a pool and sends info to announcer/cache
      return runPoolAdmin(args, announcerCtc, acc);

    case 6: // Liquidity Provider
      return runLiquidityProvider(args, announcerCtc, acc);

    case 7: // Trader
      const pool = validatePoolFlag(args);
      if (!pool)
        return exitWithMsgs(
          Bright(FgRed("⚠️ Pool Address is missing but required!"))
        );
      return runTrader(args, pool, acc);

    default:
      console.log(FgRed("Is that how it is? FINE! EXITING!"));
      return;
  }
}

const maxs = [10000000, 1000000, 100000, 10000, 100].reverse();

/* Command Handler */
(async () => {
  const args = process.argv.slice(2);
  console.clear();
  console.log(Bright(FgRed(`⚙️ Automate.mjs™`)));
  const requiresAnnouncer =
    args.findIndex(
      (a) =>
        a.startsWith("pool-admin=") ||
        a.startsWith("manager=") ||
        a.startsWith("listener=") ||
        a.startsWith("liquidity-provider=")
    ) > -1;

  if (requiresAnnouncer) {
    const info = validateAnnouncerFlag(args);

    if (!info || parseInt(info) === 1) {
      console.log(FgRed("⚠️ 'announcer' key is missing but required!"));
      return process.exit();
    }

    switch (true) {
      // Announcer Manager (requires Announcer contract info)
      case Boolean(args.find((a) => a.startsWith("manager="))): {
        await runAnnouncerManager(args, info);
        return process.exit();
      }

      // Pool Admin (requires Announcer contract info)
      case Boolean(args.find((a) => a.startsWith("pool-admin="))): {
        await runPoolAdmin(args, info);
        return process.exit();
      }

      // Listener (requires Announcer contract info)
      case Boolean(args.find((a) => a.startsWith("listener="))): {
        await runAnnouncerListener(args, info);
        return process.exit();
      }

      // Listener (requires Announcer contract info)
      case Boolean(args.find((a) => a.startsWith("liquidity-provider="))): {
        await runLiquidityProvider(args, info);
        return process.exit();
      }
    }

    return exitWithMsgs(FgRed("⚠️ No valid Participants found. Exiting ... "));
  }

  let action = async () => {
    // "options" menu if no Participant flags in command
    console.log(Bright(FgRed("⚙️ Starting 'run automated'...")));
    return runInteractive(args);
  };

  // Token Funder (requires Announcer contract info)
  if (args.find((a) => a.startsWith("trader=1"))) {
    const pool = validatePoolFlag(args);
    action = async () => runTrader(args, pool);
  } else if (args.find((a) => a.startsWith("token-funder="))) {
    // Token Funder (requires Announcer contract info)
    action = async () => runTokenFunder(args);
  } else if (args.find((a) => a.startsWith("announcer="))) {
    // Pool Announcer
    action = async () => initAnnouncerContract(args);
  }

  await action();
  process.exit();
})();

function validateAnnouncerFlag(args) {
  const flag = args.find((a) => a.startsWith("announcer=")) || "";
  const info = flag.replace("announcer=", "");
  return info || null;
}

function validatePoolFlag(args) {
  const flag = args.find((a) => a.startsWith("pool=")) || "";
  const info = flag.replace("pool=", "");
  return info || null;
}
