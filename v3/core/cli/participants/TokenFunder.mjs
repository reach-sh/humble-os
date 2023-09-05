import { yesno } from "@reach-sh/stdlib/ask.mjs";
import { loadStdlib } from "@reach-sh/stdlib";
import launchToken from "@reach-sh/stdlib/launchToken.mjs";
import { ask } from "../../util.mjs";
import {
  Bright,
  Dim,
  FgBlue,
  FgGreen,
  FgRed,
  FgYellow,
  exitWithMsgs,
  getAccountFromArgs,
  promptIsFunded,
  useReach,
} from "../automated.utils.mjs";

const getTokenInfo = async () => {
  const prompt = `
  ${Bright(FgYellow("🪙 Enter a 3-8 character Token symbol:"))}
  ${Dim("(Enter '0' to exit)")}
  `;
  const tokSym = await ask(prompt);
  if (tokSym === '0') return exitWithMsgs(Bright(FgRed("Exiting ...")))
  if (!tokSym.length || tokSym.length > 8) {
    const er = "❌ Invalid entry: Token symbol must be 3-8 characters";
    console.log(Bright(FgRed(er)));
    return getTokenInfo();
  }

  const tokName = `${tokSym.toUpperCase()} Token`;
  return [tokSym.toUpperCase(), tokName];
};

const tryMint = async (tok, acc) => {
  const reach = useReach();
  const toMint = reach.parseCurrency(1000000);
  const minted = reach.formatCurrency(toMint, 6);
  const addr = acc.networkAccount.addr || acc.networkAccount.address;
  const success = `🪙 Minted ${minted} ${tok.name} (${tok.sym}) for ${addr}.`;
  const err = `
  🪙 Could not mint for ${addr}.
  🪙 This is expected if you're funding an Admin who created a network to non-network pool.`;

  console.log(Bright(FgYellow(`🪙 Minting Tokens for ${addr} ...`)));

  await tok
    .mint(acc, toMint)
    .then(() => console.log(Bright(FgGreen(success))))
    .catch(() => console.log(Bright(FgRed(err))));
};

export default async function runTokenFunder(args, ctc, acc) {
  console.log(`
    ${Bright(FgBlue("💰 Token Funder"))}
    ${Bright(FgBlue("📄 Contract:"))} ${ctc || "(None)"}
    `);
  const reach = useReach();
  const accCreator = acc || (await getAccountFromArgs(args));

  if (!(await ask(promptIsFunded(accCreator), yesno))) {
    return exitWithMsgs(Bright(FgRed("Please retry with a funded account")));
  }

  console.log(`💰 First Token:`);
  const [symA, nameA] = await getTokenInfo();

  console.log(`💰 Second Token:`);
  const [symB, nameB] = await getTokenInfo();

  console.log(Bright(FgYellow(`🪙 Creating Tokens ${symA} / ${symB} ...`)));
  const [tokA, tokB] = await Promise.all([
    launchToken(reach, accCreator, nameA, symA),
    launchToken(reach, accCreator, nameB, symB),
  ]);

  const tokenPair = JSON.stringify({ tokA: tokA.id, tokB: tokB.id });
  console.log(`
    ${Bright(FgGreen(`🪙 Token Pair:`))} ${Dim(tokenPair)}

    Ready To Transfer 1000 ${symA} & 1000 ${symB}
  `);

  const creator = reach.formatAddress(accCreator.getAddress());
  const key = reach.connector === "ALGO" ? "addr" : "address";
  const prompt = `
  ${Bright(FgYellow(`🧧 Recipient Address:`))}
  ${Dim(`(Leave blank for current user [ ${creator} ])`)}
  ${Dim(`(Enter '0' to exit)`)}
  `;
  let keepSending = true;
  while (keepSending) {
    const addr = (await ask(prompt)) || creator;
    keepSending = addr !== "0";

    if (!keepSending) {
      return exitWithMsgs(Bright(FgBlue("💰 Token Funder complete!")));
    }

    const target = { networkAccount: { [key]: addr } };
    await Promise.all([tryMint(tokA, target), tryMint(tokB, target)]);
  }
}
