// eslint-disable-next-line import/no-extraneous-dependencies
import { makePaymentTxnWithSuggestedParams } from 'algosdk'
import { getAppEnvironment } from 'helpers/getAPIURL'
import { defaultDecimals } from 'helpers/getReach'
import { GlobalBlocktime, GlobalDex } from 'state/store'

/** Algorand Chain Genesis Id */
const getGenesisId = () =>
  `${getAppEnvironment() === 'mainnet' ? 'mainnet' : 'testnet'}-v1.0`

/** Algorand Chain Genesis Hash */
const getGenesisHash = () =>
  getAppEnvironment() === 'mainnet'
    ? 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=' // mainnet
    : 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=' // testnet

export type AlgoCommitmentOpts = {
  /** Governor address (the user that is signing up) */
  gov: string
  /** Governor address controller (optional address that can act on behalf of `gov`) */
  govController?: string
  /** Amount of Algo to commit to governance (ATOMIC!) */
  commitAlgo: number
  /** List of additional LP amounts to commit to governance (ATOMIC!) */
  commitLP?: [tokenId: string, commitment: number][]
}

/** Algorand XGov Escrow Account address */
export const XGOV_ESCROW = ''.padEnd(64, 'A')

/**
 * Create XGov commitment transaction object with a note containing commitment info:
 * `af/gov1:j{"com":1000000,"12345":20000,"67890":30000,"bnf":"XYZ","xGv":"ABC"}`
 *
 * where
 * - `"com":nnn` -- Algo commitment of atomic amount `nnn`
 * - `"mmm":nnn` -- commitment of amount `nnn` for LP-token with asset-ID `mmm`
 * - `"bnf":"XYZ"` -- the address `XYZ` is the recipient of rewards (`XYZ` must equal the xGov escrow)
 * - `"xGv":"ABC"` (optional) -- address "ABC" is the xGov-controller of this xGov account
 *
 * @returns [ARC-0005-compliant](https://github.com/reach-sh/ARCs/blob/reach-wallet/ARCs/arc-0005.md) `WalletTransaction` object
 */
export function xgovCommitTxn(raw: AlgoCommitmentOpts) {
  const opts = formatFormData(raw)
  const { gov: from, commitAlgo, govController, commitLP = [] } = opts
  let note: any = `af/gov1:j{"com":${commitAlgo}`

  // (OPTIONAL) Add LP commitments
  if (commitLP.length) {
    note = `${note},${commitLP.map(([id, amt]) => `"${id}":${amt}`).join(',')}`
  }

  // Specify xgov rewards beneficiary
  note = `${note},"bnf":"${XGOV_ESCROW}"`

  // (OPTIONAL) Add xGov Account controller
  if (govController) note = `${note},"xGv":"${govController}"`

  note = new TextEncoder().encode(`${note}}`) // close curly brace in string!
  const txn = makePaymentTxnWithSuggestedParams(
    from, // from
    from, // to
    0, // amount
    undefined, // close-to
    note, // encoded note (see above)
    getSuggestedParams(), // additional params (e.g. fee)
  ).toByte()

  return { txn: Buffer.from(txn).toString('base64') }
}

/** Format transaction units into atomic values */
export function formatFormData(d: AlgoCommitmentOpts): AlgoCommitmentOpts {
  const { tokenList } = GlobalDex.getState()
  const commitAlgo = d.commitAlgo * 10 ** defaultDecimals()
  const commitLP: [string, number][] = []
  d.commitLP?.forEach(([id, amt]) => {
    const tk = tokenList.find(({ id: i }) => i === id)
    if (!tk || Number.isNaN(amt) || amt === 0) return
    commitLP.push([id, amt * 10 ** tk.decimals])
  })

  return { ...d, commitAlgo, commitLP }
}

/** Algorand XGov commitment transaction params */
function getSuggestedParams() {
  const latestRound = GlobalBlocktime.getState().algorand
  return {
    fee: 0,
    genesisHash: getGenesisHash(),
    genesisID: getGenesisId(),
    firstRound: latestRound,
    lastRound: latestRound + 10, // allow up to 10 blocks (~30-40s) for confirmation
  }
}
