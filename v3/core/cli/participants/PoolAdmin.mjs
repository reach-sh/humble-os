import { yesno } from "@reach-sh/stdlib/ask.mjs";
import * as backend from "../../build/index.main.mjs";
import * as n2nnBackend from "../../build/n2nn.main.mjs";
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
  parseOrExit,
  promptIsFunded,
  useReach,
} from "../automated.utils.mjs";

export default async function runPoolAdmin(args, announcerCtc, acc) {
  console.log(`
    ${Bright(FgBlue("🏧 Pool Admin"))}
    ${Bright(FgBlue("📄 Contract:"))} ${announcerCtc}
  `);

  if (!announcerCtc || announcerCtc === "1") {
    return exitWithMsgs(
      FgRed(`⚠️ Invalid`),
      Bright(FgRed("announcer contract")),
      FgRed(`key supplied!\n\n`)
    );
  }

  const reach = useReach();
  const accAdmin = acc || (await getAccountFromArgs(args));

  console.log(`${Bright(Dim(`Setting account debug label`))}`);
  await accAdmin.setDebugLabel("Admin");

  const answer = await ask(promptIsFunded(accAdmin), yesno);

  if (!answer) {
    return exitWithMsgs(Bright(FgRed("Please retry with a funded account")));
  }

  const pairPrompt = `
  ${Bright(FgYellow("Enter token info:"))}
  ${Dim("(Format: { tokA: 'XXX...', tokB: 'XXX...' })")}
  `;
  const res = await ask(pairPrompt, parseOrExit);
  const { tokA, tokB } = res;
  const usesNetwork = !tokA;

  if (!usesNetwork) {
    console.log(`${Bright(FgYellow("🪙 Opting in to Tokens A and B"))}\n`);
    await Promise.all([accAdmin.tokenAccept(tokA), accAdmin.tokenAccept(tokB)]);
  } else {
    console.log(`${Bright(FgYellow("🪙 Opting in to Token B"))}\n`);
    await accAdmin.tokenAccept(tokB);
  }

  // Deploy contract
  const poolBackend = usesNetwork ? n2nnBackend : backend;
  const ctcAdmin = accAdmin.contract(poolBackend);
  console.log(Bright(FgYellow("🪙/🪙 Creating Pool ...")));

  return new Promise((resolve) =>
    // Admin backend
    ctcAdmin.participants.Admin({
      ltName: 'HUMBLE LP - ALGO/TEST',
      ltSymbol: 'HMBL1LT',
      tokA,
      tokB,
      conUnit: reach.connector == "ALGO" ? 1000000 : 1000000000000000000,
      signalPoolCreation: async (token) => {
        console.log(Bright(FgGreen("🪙/🪙 Fetching Pool info ... ")));
        const paddr = await ctcAdmin.getInfo();
        console.log(`${Bright(FgGreen("🪙/🪙 Pool addr:"))} ${paddr}`);
        const tokenId =
          reach.connector === "ALGO" ? reach.bigNumberToNumber(token) : token;
        console.log(`${Bright(FgGreen("🪙/🪙 Pool LP Token:"))} ${tokenId}`);
        resolve(paddr);
      },
    })
  ).catch((e) => {
    exitWithMsgs(Bright(FgRed("Could not create pool!")), e);
  });
}
