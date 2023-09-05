import { getNetworkProvider } from '@reach-sh/humble-sdk'
import dotenv from 'dotenv'
import { join } from 'path'
import { initPools } from './listener.pools'
import { initFarms } from './listener.farms'
import logger from '../logger'
import { initReachService } from '../graphql/services/Reach.service'
import initLimitOrders from './listener.limit-orders'

const env = process.env.NODE_ENV || 'development'
const dotenvPath = join(__dirname, `../.env.${env}`)
dotenv.config({ path: dotenvPath })

export async function initReachModule() {
  // Start
  await initReachService()
  initPools()
  initFarms()
  initLimitOrders()

  // Log start
  const now = new Date().toUTCString()
  const prov = getNetworkProvider()
  const match = process.env.NETWORK_PROVIDER === prov
  const msg = `Started ${process.env.NETWORK_PROVIDER} HS server at ${now}\n`
  if (!match) {
    const envProv = process.env.NETWORK_PROVIDER
    const e = `Provider mismatch: server expects ${envProv} but SDK returned ${prov}`
    logger.error(e)
  } else logger.info(msg)
}
