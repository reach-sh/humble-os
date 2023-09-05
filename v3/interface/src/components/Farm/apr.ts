import { getCurrentNetwork } from 'helpers/getReach'
import { NETWORKS } from 'constants/reach_constants'
import { blockConstants } from '@reach-sh/humble-sdk'

const rvpsvpb = (
  rpb1: number,
  vr1: number,
  rpb2: number,
  vr2: number,
  ts: number,
  vs: number,
) => (rpb1 * vr1 + rpb2 * vr2) / (ts * vs)

const BLOCKS_PER_YEAR = (() =>
  Math.round(blockConstants(getCurrentNetwork()).BLOCKS_PER_DAY * 365))()

export const BLOCK_DURATION = (() => {
  const connector = getCurrentNetwork()
  const netw = NETWORKS[connector]
  return netw.blockDuration
})()

const apr = (
  rpb1: number,
  vr1: number,
  rpb2: number,
  vr2: number,
  ts: number,
  vs: number,
) =>
  BLOCKS_PER_YEAR
    ? rvpsvpb(rpb1, vr1, rpb2, vr2, ts, vs) * BLOCKS_PER_YEAR * 100
    : null

export default apr
