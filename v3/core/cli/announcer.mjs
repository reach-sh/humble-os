import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/announcer.main.mjs';
import * as poolBackend from './build/index.main.mjs';
import * as n2nnPoolBackend from './build/n2nn.main.mjs';
import { yesno } from '@reach-sh/stdlib/ask.mjs';
import { getTestNetAccount, ask } from './util.mjs';

export const runConstructor = async (useTestnet) => {
  const stdlib = await loadStdlib();
  let ctor;
  if (useTestnet) {
    stdlib.setProviderByName('TestNet');
    ctor = await getTestNetAccount(stdlib);
  } else {
    const startingBalance = stdlib.parseCurrency(100);
    ctor = await stdlib.newTestAccount(startingBalance);
  }

  if (stdlib.connector == 'ETH') {
    ctor.setGasLimit(5000000);
  }

  const ctcCtor = ctor.deploy(backend);

  const backendCtor = backend.Constructor(ctcCtor, {
    printInfo: async () => {
      const info = await ctcCtor.getInfo();
      console.log(`Announcer Contract Info: ${JSON.stringify(info)}`);
      console.log(`You can stop this process now.`);
    },
  });

  console.log(`Creating Announcer...`);
  await Promise.all([ backendCtor ]);
}

export const runManager = async (useTestnet) => {
  const stdlib = await loadStdlib();
  let manager;
  if (useTestnet) {
    stdlib.setProviderByName('TestNet');
    manager = await getTestNetAccount(stdlib);
  } else {
    const startingBalance = stdlib.parseCurrency(100);
    manager = await stdlib.newTestAccount(startingBalance);
  }

  if (stdlib.connector == 'ETH') {
    manager.setGasLimit(5000000);
  }

  const info = await ask(`Paste Announcer Contract Info:`);
  const ctcManager = manager.attach(backend, stdlib.connector == 'ALGO' ? parseInt(info) : info);
  const interacts = ctcManager.a.Manager

  let isCorrect = false;
  let poolAddr = undefined;
  while (!isCorrect) {
    poolAddr = await ask(`Enter new pool address:`);
    isCorrect = await ask(`Is ${poolAddr} correct? (y/n)`, yesno);
  }
  const usesNetwork = await ask(`Does ${poolAddr} use the network token? (y/n)`, yesno);
  await interacts.getPoolInfo(poolAddr.startsWith('0x') ? poolAddr.slice(2) : poolAddr, usesNetwork)
};

export const runListener = async (useTestnet) => {
  const stdlib = await loadStdlib();
  let accListener;
  if (useTestnet) {
    stdlib.setProviderByName('TestNet');
    accListener = await getTestNetAccount(stdlib);
  } else {
    const startingBalance = stdlib.parseCurrency(100);
    accListener = await stdlib.newTestAccount(startingBalance);
  }

  if (stdlib.connector == 'ETH') {
    accListener.setGasLimit(5000000);
  }
  const listenerInfo = await ask(`Paste Announcer Contract Info:`);

  await runListener_(stdlib, accListener, listenerInfo)();
}

export const runListener_ = (stdlib, accListener, listenerInfo) => async () => {
  const ctcListener = accListener.attach(backend, stdlib.connector == 'ALGO' ? parseInt(listenerInfo) : listenerInfo)
  const fmt = (x) => stdlib.formatCurrency(x, stdlib.connector == 'ALGO' ? 6 : 18);

  const backendListener = backend.Listener(ctcListener, {
    hear: async (poolInfo, usesNetwork) => {
      let ctcInfo;
      if (stdlib.connector == 'ALGO') {
        ctcInfo = parseInt(poolInfo);
      } else {
        let pit = poolInfo.toString().trim().replace(/\0.*$/g,'');
        ctcInfo = pit.startsWith('0x') ? pit : ('0x' + pit);
      }
      console.log(`\x1b[2m`, `Pool ID:`, ctcInfo, `Uses Network:`, usesNetwork, '\x1b[0m');
      const theBackend = usesNetwork ? n2nnPoolBackend : poolBackend;
      const ctcPool = await accListener.attach(theBackend, ctcInfo);
      const views = await ctcPool.getViews();
      const tokA = await views.Tokens.aTok();
      const tokB = await views.Tokens.bTok();
      let aBal = await views.Tokens.aBal();
      let bBal = await views.Tokens.bBal();
      if (tokB[0] == 'None') {
        console.log(`XXX: Pool ${ctcInfo} does not have token info`);
        return;
      }

      const resA = await (tokA[1] == null)
        ? { id: null, name: stdlib.connector, symbol: stdlib.connector }
        : (await accListener.tokenMetadata(tokA[1]));
      const tokASym = resA.symbol;
      const tokABal = (aBal[0] == 'None') ? 0 : aBal[1];
      console.log(`\x1b[2m`, `  *`, fmt(tokABal), tokASym, '\x1b[0m');

      const resB = await accListener.tokenMetadata(tokB[1]);
      const tokBSym = resB.symbol;
      const tokBBal = (bBal[0] == 'None') ? 0 : bBal[1];
      console.log(`\x1b[2m`, `  *`, fmt(tokBBal), tokBSym, '\x1b[0m');

      const info = {
        poolAddr: ctcInfo,
        tokA: {
          ...resA,
          id: tokA[1]
        },
        tokB: {
          ...resB,
          id: tokB[1]
        }
      };
      console.log(`\x1b[2m`, `  * Info: ${JSON.stringify(info)}`, '\x1b[0m')
    },
  });

  console.log(`Listening...`);
  return Promise.all([ backendListener ]);
}
