import { yesno } from "@reach-sh/stdlib/ask.mjs";
import { ask } from "../../util.mjs";
import {
  Bright,
  Dim,
  exitWithMsgs,
  fmt,
  FgBlue,
  FgGreen,
  FgRed,
  FgYellow,
  getAccountFromArgs,
  getBalances,
  parseContractAddress,
  parseIntOrExit,
  useReach,
} from "../automated.utils.mjs";
import { renderPoolInfo } from "./Listener.mjs";

export default async function runTrader(args, poolCtc, acc) {
  const reach = await useReach();
  const { connector } = reach;
  const accTrader = acc || (await getAccountFromArgs(args));

  await accTrader.setDebugLabel("Trader");
  console.log(`${Bright(Dim(`Setting account debug label ... `))}`);

  // Connect to announcer and list pools:
  const pool = poolCtc || (await ask(`Paste Pool Contract Info:`));
  const usesNetwork = await ask(
    `Does "${pool}" contain ${reach.connector}? (y/n)`,
    yesno
  );
  const { ctcPool, tokA, tokB, lpTok, poolAddr } = await renderPoolInfo(
    accTrader,
    parseContractAddress(pool),
    usesNetwork
  );

  if ((await ask("Accept pool tokens?")) === "y") {
    console.log(Bright(FgYellow("Accepting tokens ... ")));
    await Promise.all([
      accTrader.tokenAccept(tokA.id),
      accTrader.tokenAccept(tokB.id),
      accTrader.tokenAccept(lpTok.id),
    ]);
  }

  console.log(Bright(FgBlue("\t→ Trading Time™®")));
  const symbolA = tokA.symbol;
  const symbolB = tokB.symbol;
  const TraderAPI = ctcPool.apis.Trader;
  const myBals = await getBalances(accTrader, tokA, tokB);
  const inputTok = await ask(`
    ${Bright(FgYellow("What token are you putting in?"))}
    ${Dim(FgBlue(`${tokA.id} for ${symbolA} or ${tokB.id} for ${symbolB}`))}
    ${Dim(FgYellow(`My Balances: ${myBals}`))}
    ${Dim(`(Enter "0" to exit)`)}`);
  if (inputTok === "0") return exitWithMsgs(Bright(FgRed("Exiting ...")));

  const src = [tokA, tokB].find((t) => t.id === parseContractAddress(inputTok));
  const tgt = [tokA, tokB].find((t) => t.id !== parseContractAddress(inputTok));
  const swapAForB = src.id === tokA.id;
  const amtA = await ask(
    `${Bright(`How much ${src.symbol} do you want to swap?`)}
    ${Dim(FgYellow(`My Balances: ${myBals}`))}`,
    parseIntOrExit
  );

  console.log(
    Bright(FgYellow(`🔄 Swapping ${amtA} ${src.symbol} for ${tgt.symbol}`))
  );
  const res = swapAForB
    ? await TraderAPI.swapAForB({ amtA: reach.parseCurrency(amtA) })
    : await TraderAPI.swapBForA({ amtB: reach.parseCurrency(amtA) });
  const swappedAmt = fmt(res[0]);
  const gotAmt = fmt(res[1]);
  console.log(
    Bright(FgGreen(`🔄 Got ${gotAmt} ${tgt.symbol} for ${amtA} ${tgt.symbol}`))
  );
}
