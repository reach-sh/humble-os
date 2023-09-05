import createState from '@jackcom/raphsducks'
import {
  blockConstants,
  createReachAPI,
  getBlockchain,
} from '@reach-sh/humble-sdk'

/** Use to track latest block time on one or more networks */
export const GlobalBlocktime = createState({ algorand: 0 })

export type BlocktimeInstance = ReturnType<typeof GlobalBlocktime.getState>
export type BlocktimeKeys = keyof BlocktimeInstance

let timeout = 0
let updating = false

export function initBlockTimeRefresh() {
  if (updating) return
  updating = true
  updateBlockTime()
}

/** Get latest block time (currently defaults to Algorand) */
async function updateBlockTime() {
  if (timeout) window.clearTimeout(timeout)

  const blockDuration = blockConstants(getBlockchain()).BLOCK_LENGTH * 1000
  const { getNetworkTime, bigNumberToNumber } = createReachAPI()
  const updateTime = (time: any) => {
    // @TODO: determine the active blockchain and use it to select the right state key
    GlobalBlocktime.algorand(bigNumberToNumber(time))
    timeout = window.setTimeout(updateBlockTime, blockDuration)
  }

  getNetworkTime().then(updateTime).catch()
}
