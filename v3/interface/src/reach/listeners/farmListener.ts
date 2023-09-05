import {
  ReachAccount,
  StaticFarmDataFormatted,
  subscribeToFarmStream,
  TransactionResult,
} from '@reach-sh/humble-sdk'
import cacheReducer from 'state/cacheReducer'
import fetchFarm from 'helpers/farm'

const waitForFarmsStreamToEmpty = (wait = 1800) =>
  setTimeout(() => {
    cacheReducer.loadingFlags.farms = false
  }, wait)

const attachFarmListener = (acc: ReachAccount) => {
  if (cacheReducer.subscriptions.farms) return

  cacheReducer.subscriptions.farms = true // subscription status (set once)
  cacheReducer.loadingFlags.farms = true // data-fetching status
  let timeout: NodeJS.Timeout = waitForFarmsStreamToEmpty(4000)
  const additional = { format: true, includePublicFarms: true }

  subscribeToFarmStream(acc, {
    ...additional,
    async onFarmFetched({ data }: TransactionResult<StaticFarmDataFormatted>) {
      fetchFarm(data).then((f) => {
        if (f) cacheReducer.farms.update(f)

        if (timeout) clearTimeout(timeout)
        timeout = waitForFarmsStreamToEmpty()
      })
    },
  })
}

export default attachFarmListener
