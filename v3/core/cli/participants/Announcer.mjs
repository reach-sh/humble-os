import algosdk from "algosdk";
import { yesno } from "@reach-sh/stdlib/ask.mjs";
import * as announcerBackend from "../../build/announcer.main.mjs";
import { runTokens } from "../../tokens.mjs";
import { getTestNetAccount, ask, bold } from "../../util.mjs";
import {
  Bright,
  Dim,
  FgGreen,
  FgBlue,
  FgRed,
  FgYellow,
  createAlgoAccount,
  exitNoMnemonic,
  exitWithMsgs,
  getAccountFromArgs,
  promptIsFunded,
  useReach,
  parseContractAddress,
} from "../automated.utils.mjs";
import runTokenFunder from "./TokenFunder.mjs";
import runAnnouncerListener from "./Listener.mjs";
import runLiquidityProvider from "./LiquidityProvider.mjs";
import runPoolAdmin from "./PoolAdmin.mjs";

const reset = (...msgs) => {
  console.clear();
  console.log(Bright(FgRed(`📄 Announcer Contract (auto)\n`)), ...msgs);
};

async function createAnnouncerContract(acct) {
  if (!acct) throw new Error("No account supplied!");
  console.log(Bright(FgYellow("📄 Creating Announcer contract ...")));

  const ctc = acct.contract(announcerBackend);
  return new Promise((resolve) =>
    ctc.participants.Constructor({
      printInfo: async () => {
        const info = await ctc.getInfo();
        resolve(JSON.stringify(info));
      },
    })
  );
}

function makeToken(id = null, metadata) {
  const { connector } = useReach();
  const data = metadata || { name: connector, symbol: connector };
  return { ...data, id };
}

export default async function initAnnouncerContract(args) {
  const flag = args.find((a) => a.startsWith("announcer=")) || "";
  const val = flag.replace("announcer=", "");
  if (!val) {
    const invalid = Bright(FgRed(`⛔️ Invalid 'announcer' "${val}"`));
    return exitWithMsgs(invalid, { flag });
  } else if (val !== "1") {
    return await (args.find((a) => a.startsWith("listener="))
      ? runAnnouncerListener(args, val) // Announcer-Listener
      : runNextParticipant(args, val)); // Announcer-Manager (possibly)
  }

  reset(Bright(FgBlue("📄 Announcer Constructor")));
  // Announcer-Constructor
  const reach = useReach();
  const acct = await getAccountFromArgs(args);
  if (!(await ask(Bright(FgYellow(promptIsFunded(acct))), yesno))) {
    return exitWithMsgs(Bright(FgRed("🏛 Exiting ... ")));
  }

  const announcerCtc = await createAnnouncerContract(acct);
  const msg = Bright(FgGreen(`📄 Announcer Contract:`));
  console.log(msg, announcerCtc, `\n`);

  await runNextParticipant(args, announcerCtc, acct);

  return announcerCtc;
}

export async function runAnnouncerManager(args, info, acc) {
  reset(`
    ${Bright(FgBlue("📄 Announcer Manager"))}
    ${Bright(FgBlue("📄 Contract:"))} ${info}
    `);
  if (parseInt(info) === 1) {
    return exitWithMsgs(
      Bright(FgRed("⚠️ A valid announcer contract is required.\n\n"))
    );
  }
  const reach = useReach();
  const managerAcct = acc || (await getAccountFromArgs(args));
  const managerFunded = `Is the Manager account funded and ready?
  ${Dim("('y' / any key to exit)")}`;
  if ((await ask(Bright(managerFunded))) !== "y") {
    const exitMsg = "👋 Understandable; have a good day";
    return exitWithMsgs(Bright(FgRed(exitMsg)));
  }

  const publish = async () => {
    const poolAddr = await ask(Bright(FgYellow(`Enter new pool address:`)));
    const usesNetwork = await ask(`
      ${Bright(FgYellow(`Does ${poolAddr} use the network token?`))}
      ${Dim('[ (y/n) OR "0" to exit ]')}
    `);

    if (!["y", "n"].includes(usesNetwork))
      return exitWithMsgs(Bright(FgRed("Canceling ... ")));

    const api = managerAcct.contract(announcerBackend, parseContractAddress(info)).a.Manager;
    await api.getPoolInfo(
      poolAddr.startsWith("0x") ? poolAddr.slice(2) : poolAddr,
      usesNetwork === "y"
    );

    console.log(Bright(FgGreen(`Successfully announced "${poolAddr}"\n`)));

    const shouldContinue = await ask(Bright(`Keep publishing? (y/n)`));
    if (shouldContinue === "y") return publish();
  };

  await publish();

  console.log(Bright(FgBlue("✅ Announcer Manager complete!")));
}

/** Run the next `Participant` after creating an `Announcer` contract */
async function runNextParticipant(args, announcerCtc, acc) {
  console.log(Bright(FgBlue("⚙️ Run Next Participant")));
  const nextLabels = [
    { name: "Announcer Manager", action: runAnnouncerManager },
    { name: "Listener", action: runAnnouncerListener },
    { name: "Token Funder", action: runTokenFunder },
    { name: "Pool Admin", action: runPoolAdmin },
    { name: "Liquidity Provider", action: runLiquidityProvider },
  ];
  const nextPrompt = [
    `${Bright(FgYellow("Select a Participant to continue:"))}\n`,
    ...nextLabels.map((l, i) => `${i + 1}. ${Bright(l.name)}`),
    "\n(Any key to exit)",
  ].join("\n");
  const answer = await ask(nextPrompt, parseInt);
  const isValid = !isNaN(answer) && answer > 0 && answer <= nextLabels.length;

  if (!isValid) {
    console.log(Bright(FgRed("No Participant selected. Exiting ...")));
    return null;
  }

  const { action } = nextLabels[answer-1];
  await action(args, announcerCtc, acc);
}
