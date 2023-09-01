import { NETWORK_TOKEN_DEFAULT_ID } from 'constants/reach_constants'
import { Token } from 'types/shared'
import {
  fetchAllTokenBalances,
  formatSDKPool,
  formatTokenMetadata,
} from 'reach/utils'
import {
  subscribeToPoolStream,
  fetchLiquidityPool,
  ReachToken,
} from '@reach-sh/humble-sdk'
import cacheReducer from 'state/cacheReducer'
import { getTokenById } from 'helpers/pool'
import { fetchTokenForCache, tokenMetadata } from 'cache/shared'
import { FetchPoolOpts } from '@reach-sh/humble-sdk/lib/contracts/PoolAnnouncer'

const waitForPoolsStreamToEmpty = () => setTimeout(fetchAllTokenBalances, 1000)

const getMaybeCachedTokens = async (
  acc: any,
  tokA: string,
  tokB: string,
): Promise<[ReachToken, ReachToken, Token, Token]> => {
  let tokenA = getTokenById(tokA)
  if (tokenA === undefined)
    tokenA = formatTokenMetadata(tokA, await fetchTokenForCache(acc, tokA))
  let tokenB = getTokenById(tokB)
  if (tokenB === undefined)
    tokenB = formatTokenMetadata(tokB, await fetchTokenForCache(acc, tokB))

  // Create a formatted Reach token
  const fmtToken = (tk: Token): ReachToken => ({
    ...tk,
    id: tk.id || '0',
    supply: tk.supply || '0',
    url: `#${tk.id}`,
  })
  return [fmtToken(tokenA), fmtToken(tokenB), tokenA, tokenB]
}

/**
 * Listen to SDK Pool stream. It fetches EVERYTHING (including tokens),
 * so we only need to format the data for our cache and ... well, cache it
 */
const attachPoolListener = (accListener: any, seekNow = false) => {
  if (cacheReducer.subscriptions.pools) return

  let timeout: NodeJS.Timeout | undefined
  cacheReducer.subscriptions.pools = true

  subscribeToPoolStream(accListener, {
    includeTokens: true,
    seekNow,
    // optional handler
    // onPoolReceived ([ poolId, tokenAId, tokenBId ]) => ...
    async onPoolReceived(recData: any) {
      const [poolAddr, tokAId, tokBId] = recData
      // Temp patch: this token was deleted after someone created a pool with it.
      // Excluded until we bypass or refactor this fetching function, since it
      // crashes the app in development
      if (tokBId.toString() === '842581764') return
      const [fmtTokenA, fmtTokenB, tokenA, tokenB] = await getMaybeCachedTokens(
        accListener,
        tokAId.toString(),
        tokBId.toString(),
      )
      const fetchOpts: FetchPoolOpts = {
        poolAddress: poolAddr,
        n2nn: tokAId === NETWORK_TOKEN_DEFAULT_ID,
        includeTokens: false,
        tokens: [fmtTokenA, fmtTokenB],
      }

      const { succeeded, data } = await fetchLiquidityPool(
        accListener,
        fetchOpts,
      )

      if (timeout) clearTimeout(timeout)
      timeout = waitForPoolsStreamToEmpty()
      const { tradeable, pool, tokens } = data
      if (!succeeded || pool === null) return
      if (!tradeable) {
        cacheReducer.pools.delete(poolAddr)
        cacheReducer.lPools.delete(poolAddr)
        return
      }

      const formatted = formatSDKPool(pool, 0, tokens as [any, any])
      const lpToken =
        getTokenById(formatted.poolTokenId) ||
        (await tokenMetadata(formatted.poolTokenId || 0, accListener, false))

      if (formatted) {
        cacheReducer.pools.update(formatted)
        cacheReducer.tokens.updateMultiple([lpToken, tokenA, tokenB])
      }
    },
  })
}

export default attachPoolListener
