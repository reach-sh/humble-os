import { exec } from 'child_process'
import { loadStdlib } from '@reach-sh/stdlib'
import {
    stakingBackend,
    poolBackend,
    poolBackendN2NN,
    announcerBackend,
    farmAnnouncerBackend,
} from '@reach-sh/humble-sdk/lib/build/backend.js'

console.log('If you still see only this message after 5 seconds your devnet might not be active; CTRL + C to exit this command and run `npm run devnet` before retrying')
const stdlib = await loadStdlib({REACH_CONNECTOR_MODE: 'ALGO', REACH_NO_WARN: 'Y'})
let accCount = 5
const result = await Promise.all( Array.from({length: accCount}, () => stdlib.newTestAccount(stdlib.parseCurrency(300))) );
console.log('Begin Test Data Creation')
const [accAdmin, dumpAccount, triumA, triumB, triumC] = result
const accountPhrase = getMnemonic(accAdmin)
console.log(accountPhrase)


// create Triumvirate for testrun
const { triumvirateId, triumvirateAddress } = await createTriumvirate()

// create farm Announcer for testrun
const { farmAnnouncerId, ctcDeployer } = await createFarmAnnouncer()

const tokenALGO = {
    id: '0',
    sym: 'ALGO'
}
const [tokenKEEGANZ, tokenSP660, tokenVAR, tokenGAR, tokenSWAP662, tokenSWAP657, tokenSWAP821, tokenSWAP857, tokenSWAP896, tokenNoPool] = await Promise.all([
    stdlib.launchToken(accAdmin, `keeganz`, `KEEGANZ`),
    stdlib.launchToken(accAdmin, `sp660`, `SP660`),
    stdlib.launchToken(accAdmin, `var`, `VAR`),
    stdlib.launchToken(accAdmin, `gar`, `GAR`),
    stdlib.launchToken(accAdmin, `swap662`, `SWAP662`),
    stdlib.launchToken(accAdmin, `swap657`, `SWAP657`),
    stdlib.launchToken(accAdmin, `swap821`, `SWAP821`),
    stdlib.launchToken(accAdmin, `swap857`, `SWAP857`),
    stdlib.launchToken(accAdmin, `swap896`, `SWAP896`), // do not use this token for other tests; it needs to have a specific balance
    stdlib.launchToken(accAdmin, `nopool`, `NOPOOL`),
    stdlib.launchToken(accAdmin, `tpc1`, `TPC1`),
    stdlib.launchToken(accAdmin, `tpc2`, `TPC2`),
])

const [AlgoKeeganzPool, AlgoSp660Pool, KeeganzVarPool, AlgoGarPool, GarVarPool, AlgoSWAP662Pool, AlgoSWAP657Pool, AlgoSWAP821Pool, AlgoSWAP857Pool, AlgoSWAP896Pool] = await Promise.all([
    createPool(tokenALGO, tokenKEEGANZ, 10, 10), // create ALGO/KEEGANZ pool for poolCreation.spec.js
    createPool(tokenALGO, tokenSP660, 10, 10), // create ALGO/SP660 pool for stakingUnstaking.spec.js

    // // create Pools for swap tests
    createPool(tokenKEEGANZ, tokenVAR, 1000, 1000),
    createPool(tokenALGO, tokenGAR, 10, 10),
    createPool(tokenGAR, tokenVAR, 10, 10),

    createPool(tokenALGO, tokenSWAP662, 10, 10), // ALGO / SWAP662 for claimRewards.spec.js

    createPool(tokenALGO, tokenSWAP657, 10, 10), // create pool for liquidity deposit/withdraw tests

    createPool(tokenALGO, tokenSWAP821, 10, 10), // ALGO / SWAP821 for farmCreation.spec.js
    createPool(tokenALGO, tokenSWAP857, 100, 100), // duplicate pool testing
    createPool(tokenALGO, tokenSWAP896, 10, 10), // pool for balance testing
])

await createPool(tokenALGO, tokenSWAP857, 10, 10), // duplicate pool testing

await Promise.all([
    dumpAccount.tokenAccept(AlgoSWAP821Pool.poolTokenId),
    dumpAccount.tokenAccept(tokenKEEGANZ.id),
    dumpAccount.tokenAccept(tokenVAR.id),
    dumpAccount.tokenAccept(tokenNoPool.id)
])

// if low balances are needed to trigger certain conditions, dump extra tokens into the dump account
await Promise.all([
    stdlib.transfer(accAdmin, dumpAccount, stdlib.parseCurrency(10), AlgoSWAP821Pool.poolTokenId),
    stdlib.transfer(accAdmin, dumpAccount, stdlib.parseCurrency(18446744072000), tokenKEEGANZ.id),
    stdlib.transfer(accAdmin, dumpAccount, stdlib.parseCurrency(18446744072000), tokenVAR.id),
    stdlib.transfer(accAdmin, dumpAccount, stdlib.parseCurrency(18446744072000), tokenNoPool.id)
])

await Promise.all([
    createFarm(AlgoKeeganzPool, tokenKEEGANZ.id, tokenALGO, tokenKEEGANZ, 1), // create ended farm for stakingUnstaking.spec.js
    createFarm(AlgoKeeganzPool, tokenKEEGANZ.id, tokenALGO, tokenKEEGANZ), // create ALGO/KEEGANZ as example for other tests
    createFarm(AlgoSp660Pool, tokenSP660.id, tokenALGO, tokenSP660), // create ALGO/SP660 as example for stakingUnstaking.spec.js
    createFarm(AlgoSWAP662Pool, tokenSWAP662.id, tokenALGO, tokenSWAP662), 
    createFarm(AlgoSWAP657Pool, tokenSWAP657.id, tokenALGO, tokenSWAP657), 
])

const args = process.argv.slice(2);
let script = 'npm run test:e2e'
if (args.length > 0) {
    if (args[0] === 'recording') {
        script = 'react-app-rewired start'
    } else {
        script = `start-server-and-test 'react-app-rewired start' 3000 'cypress run --browser=chrome --spec=cypress/integration/${args[0]}.spec.js'`
    }
}

const command = `REACT_APP_SELECTED_NETWORK='ALGO-devnet' REACT_APP_FARM_ANNOUNCER=${farmAnnouncerId} REACT_APP_TRIUMVIRATE_ADDRESS='${triumvirateAddress}' REACT_APP_TRIUMVIRATE_ID=${triumvirateId} REACT_APP_TEST_ACCOUNT_PHRASE='${accountPhrase}' REACT_APP_RUNNING_TESTS=true ${script}`
console.log(command)
const execProcess = exec(command)
execProcess.stdout.on('data', (data) => {
    console.log(data)
})

execProcess.stdout.on('close', (code) => {
    console.log('Test Run Complete')
    process.exit(0)
});


async function createFarmAnnouncer() {
    const ctcDeployer = accAdmin.contract(farmAnnouncerBackend);

    await stdlib.withDisconnect(async () => {
        await ctcDeployer.p.Deployer({
            ready: stdlib.disconnect,
        });
    });

    const farmAnnouncerId = stdlib.bigNumberToNumber(await ctcDeployer.getInfo());
    console.log(`created farm announcer: ${farmAnnouncerId}`)
    return { farmAnnouncerId, ctcDeployer }
}

function tokenFormat(id) {
    if (id === 0 || id === '0') return ['None', null]
    if (id.length > 0) return ['Some', stdlib.bigNumberify(id)]
    return ['Some', stdlib.bigNumberify(0)]
}

async function createFarm(stakedTokenPool, rewardTokenId, poolTokA, poolTokB, duration = 20160) {
    console.log('creating farm...')
    const start = Number(await stdlib.getNetworkTime())
    const ctcStakingPool = accAdmin.contract(stakingBackend)
    let resolveReadyForRewarder = null;
    const pReadyForRewarder = new Promise(r => resolveReadyForRewarder = r);
    let resolveReadyForStakers = null;
    const pReadyForStakers = new Promise(r => resolveReadyForStakers = r);

    stdlib.withDisconnect(() => ctcStakingPool.p.Deployer({
        opts: {
            rewardToken1: rewardTokenId,
            stakeToken: stakedTokenPool.poolTokenId,
            rewardsPerBlock: [1, 1],
            start: start,
            end: start + duration,
            Rewarder0: stdlib.formatAddress(accAdmin)
        },
        readyForRewarder: () => resolveReadyForRewarder(),
        readyForStakers: () => { resolveReadyForStakers(); stdlib.disconnect(); },
      }));

    const ctcID = await ctcStakingPool.getInfo()
    console.log(`staking pool address ${ctcID}`)
    await pReadyForRewarder
    await ctcStakingPool.a.Setup.fund()
    await pReadyForStakers
    console.log('farm created')
    const rewardTokenData = await accAdmin.tokenMetadata(rewardTokenId)
    const stakeTokenData = await accAdmin.tokenMetadata(stakedTokenPool.poolTokenId)
    const pairTokenAId = tokenFormat(poolTokA.id.toString())
    const farmData = {
        ctcInfo: ctcID,
        startBlock: start,
        endBlock: start + duration,
        rewardTokenId: stdlib.bigNumberify(rewardTokenId),
        rewardsPerBlock: [1, 1],
        stakedTokenId: stdlib.bigNumberify(stakedTokenPool.poolTokenId),
        pairTokenAId,
        pairTokenASymbol: poolTokA.sym,
        pairTokenBId: poolTokB.id,
        pairTokenBSymbol: poolTokB.sym,
        rewardTokenDecimals: rewardTokenData.decimals,
        rewardTokenSymbol: rewardTokenData.symbol,
        stakedTokenDecimals: stakeTokenData.decimals,
        stakedTokenPoolId: stdlib.bigNumberify(stakedTokenPool.poolId),
        stakedTokenSymbol: stakeTokenData.symbol.replace(/\0/g, ""),
        stakedTokenTotalSupply: stakeTokenData.supply,
      }
    const resp = await ctcDeployer.apis.announce(farmData);
    console.log('farm announced', resp)
    return ctcID
}

async function createPool(
    tokA,
    tokB,
    tokAAmt,
    tokBAmt,
    tokADecimals = 6,
    tokBDecimals = 6,
) {
    console.log('creating pool...')
    const tokenAId = tokA.id.toString()
    const backend = tokenAId === '0' ? poolBackendN2NN : poolBackend
    const ctcAdmin = accAdmin.contract(backend)
    const poolTokenId = await new Promise((resolve, reject) =>
        ctcAdmin.participants
            .Admin({
                tokA: tokenAId,
                tokB: tokB.id.toString(),
                ltName: `HUMBLE LP - ${tokA.sym}/${tokB.sym}`,
                ltSymbol: 'HMBL2LT',
                proto: triumvirateId,
                signalPoolCreation: resolve,
            })
            .catch(reject),
    )
    const poolAddress = (await ctcAdmin.getInfo()).toString()
    const ctc = accAdmin.contract(backend, poolAddress)
    const { Provider } = ctc.apis
    const lpTokenId = poolTokenId.toString()
    await accAdmin.tokenAccept(lpTokenId)
    console.log('funding pool...')
    await Provider.deposit({
        A: stdlib.parseCurrency(tokAAmt, tokADecimals),
        B: stdlib.parseCurrency(tokBAmt, tokBDecimals),
    })
    console.log('pool created and funded...')
    return { poolId: poolAddress, poolTokenId: lpTokenId }
}

function getMnemonic(acct) {
    const { algosdk } = stdlib;
    const { networkAccount } = acct;
    const mnm = algosdk.secretKeyToMnemonic(networkAccount.sk);
    return mnm
}

async function createTriumvirate() {
    console.log('creating triumvirate...')
    const ctcAdmin_tri = accAdmin.contract(announcerBackend)
    await stdlib.withDisconnect(() =>
        ctcAdmin_tri.p.Admin({
            ready: stdlib.disconnect,
            triumvirs: [
                triumA.networkAccount.addr,
                triumB.networkAccount.addr,
                triumC.networkAccount.addr,
            ],
        }),
    )
    const triumvirateId = stdlib.bigNumberToNumber(await ctcAdmin_tri.getInfo())

    const ctcView = accAdmin.contract(announcerBackend, triumvirateId).views
    const data = await ctcView.Info()

    const triumvirateAddress = stdlib.formatAddress(data[1].protoInfo.protoAddr)
    console.log(`triumvirate complete: ${triumvirateId}, ${triumvirateAddress}`)
    return {
        triumvirateId,
        triumvirateAddress,
    }
}
