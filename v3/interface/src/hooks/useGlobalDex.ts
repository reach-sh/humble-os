import { getFarmPoolTokens } from 'helpers/farm'
import { useEffect, useMemo, useState } from 'react'
import cacheReducer from 'state/cacheReducer'
import { GlobalDex, DexInstance, DexKeys } from 'state/reducers/dex'
import { LoadingFlags } from 'state/reducers/loading-flags'
import { Farm } from 'types/shared'

const defaultKeys = Object.keys(GlobalDex.getState()) as DexKeys[]

export default function useGlobalDex(keys = defaultKeys) {
  const dex = GlobalDex.getState()
  const { selectedStakeContractId, pools, stakingPools, tokenList } = dex
  const matchSelected = (f: Farm) => f.contractId === selectedStakeContractId
  const [internal, setInternal] = useState(
    keys.reduce((acc, k) => ({ ...acc, [k]: dex[k] }), {} as DexInstance),
  )

  // Selected farm
  const selectedStakingFarm = useMemo(
    () => stakingPools.find(matchSelected),
    [pools, stakingPools, selectedStakeContractId],
  )

  // Selected farm tokens
  const [tokA, tokB, rewardTok] = useMemo(
    () => getFarmPoolTokens(selectedStakingFarm, pools),
    [selectedStakingFarm, tokenList, pools],
  )

  const selectedFarmTitle = useMemo(() => {
    if (!selectedStakingFarm) return ''
    if (selectedStakingFarm.stakedTokenPoolId)
      return `${selectedStakingFarm.pairTokenASymbol}/${selectedStakingFarm.pairTokenBSymbol}`
    return selectedStakingFarm.stakedTokenSymbol
  }, [selectedStakingFarm, tokA, tokB])

  const [farmsLoading, setLoading] = useState(cacheReducer.loadingFlags.farms)
  useEffect(() => {
    // Listen to LoadingFlags changes
    const unsubscribeLoading = LoadingFlags.subscribeToKeys(
      ({ farms }) => farms !== undefined && setLoading(farms),
      ['farms'],
    )
    // Listen to GlobalDex changes
    const unsubscribeDex = GlobalDex.subscribeToKeys((dexUpdates) => {
      setInternal((old) => ({ ...old, ...dexUpdates }))
    }, keys)

    return () => {
      unsubscribeLoading()
      unsubscribeDex()
    }
  }, [])

  return {
    ...internal,
    farmsLoading,
    /** Selected staking farm (e.g. for modals) */
    selectedStakingFarm,
    /** Selected staking farm display name */
    selectedFarmTitle,
    /** Selected farm's `PoolTokenA`, `PoolTokenB`, `FarmRewardToken` from `tokensList` */
    selectedFarmTokens: [tokA, tokB, rewardTok],
  }
}
