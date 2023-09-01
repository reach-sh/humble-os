import { useEffect, useMemo, useState } from 'react'
import { t, Trans } from '@lingui/macro'
import { blockConstants } from '@reach-sh/humble-sdk'
import { SDKStakeUpdate } from '@reach-sh/humble-sdk/lib/utils/utils.staker'
import sortBy from 'lodash.sortby'
import { getCurrentNetwork, useReach } from 'helpers/getReach'
import { maybeOpenWallet, shouldConfirmMobileWallet } from 'helpers/user'
import styled from 'styled-components'
import { COLORS } from 'theme'
import { amountOfTokenDeposited } from 'reach/utils'
import Pagination from 'components/Common/Pagination'
import Tooltip from 'components/Common/Tooltip'
import QuestionIcon from 'assets/Icons/question-alt.svg'
import StakingLiquidity from 'components/Common/StakingLiquidity'
import ClaimRewards from 'components/ClaimRewards'
import GlobalModal, { clearGlobalModal, MODAL } from 'state/reducers/modals'
import { useTheme } from 'contexts/theme'
import {
  claimRewards,
  stakeAmount,
  unstakeAmount,
  getBalanceOfToken,
  getFormattedRewards,
  getStakingBalance,
} from 'reach/api/staker'
import { getPrice } from 'prices'
import { NETWORK_TOKEN_DEFAULT_ID } from 'constants/reach_constants'
import SuccessPoolModal from 'components/Modals/SuccessPoolModal'
import useToast from 'hooks/useToast'
import MobileWalletConfirmationModal from 'components/Modals/MobileWalletConfirmationModal'
import { Farm } from 'types/shared'
import handleContractError from 'helpers/error'
import emptyBoxLightMode from 'assets/empty_box_light_mode.svg'
import emptyBoxDarkMode from 'assets/empty_box_dark_mode.png'
import useGlobalUser from 'hooks/useGlobalUser'
import useGlobalDex from 'hooks/useGlobalDex'
import useGlobalModal from 'hooks/useGlobalModal'
import cacheReducer from 'state/cacheReducer'
import useIsMounted from 'hooks/useIsMounted'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import { useLocation, useNavigate } from 'react-router-dom'
import { cacheAndLoadFarm } from 'helpers/farm'
import SIZE from 'constants/screenSizes'
import { paths } from 'App.routes'
import FarmGrid from './FarmGrid'
import FarmTableItem from './FarmTableItem'
import FarmTableItemSkeleton from './FarmTableItemSkeleton'

const HEADINGS = [
  { title: t`Pair name` },
  {
    title: 'Rewards',
    desc: t`Combined price or token amount(s) of the remaining reward token(s)`,
  },
  {
    title: 'APR',
    desc: t`Expected percentage of return on investment at current rates`,
  },
  { title: 'TVL', desc: t`Total number of tokens staked in farm` },
  {},
]

const FarmTableContainer = styled.div`
  @media screen and (max-width: ${SIZE.sm}) {
    padding-top: 1rem;
  }
`
const ListHeadings = styled(FarmGrid)`
  padding: 1.2rem 0.5rem 0 0.5rem;
  grid-template-rows: 1fr;
  margin-bottom: 1rem;
  @media screen and (max-width: ${SIZE.sm}) {
    display: none;
  }
`
const HeadingItem = styled.div<{ first?: boolean }>`
  text-align: center;
  align-self: center;
  font-size: 12px;
  color: ${COLORS.midGray};
  display: flex;
  align-items: center;
  justify-content: center;
`
const List = styled.div``
const NoFarmsLabel = styled.div`
  color: ${COLORS.midGray};
  font-size: 18px;
  text-align: center;
  margin-top: 28px;
`
const NoFarmsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 50px;
  padding-bottom: 44px;
`
const NoFarmsMessage = styled.p`
  color: ${COLORS.midGray};
  font-size: 18px;
  text-align: center;
  margin-top: 28px;
`
const Image = styled.img`
  width: 170px;
  height: 170px;
`
enum VIEWSTATE {
  IDLE = 0,
  FETCHING = 1,
  EMPTY = 2,
}

interface Props {
  partnerFarmsOnly: boolean
  myFarmsOnly: boolean
  liveFarms: boolean
  query: string
  queryId: string
}

type StakeAction = 'claiming' | 'staking' | 'unstaking'

const FarmTable = ({
  partnerFarmsOnly,
  myFarmsOnly,
  liveFarms,
  query,
  queryId,
}: Props) => {
  const network = getCurrentNetwork()
  const { launchToast, removeToasts } = useToast()
  const { modal } = useGlobalModal()
  const { reachAccount: account, connected, connecting } = useGlobalUser()
  const {
    pools,
    tokenList,
    stakingPools,
    farmsLoading,
    selectedFarmAmounts,
    selectedStakingFarm,
    selectedFarmTokens,
    selectedFarmTitle,
    prices,
  } = useGlobalDex()
  const [tokA, tokB, rewardTok] = selectedFarmTokens
  const [currentPage, setCurrentPage] = useState(0)
  // TODO: create a cypress command that goes through the pages looking for an element instead of just extending the list size
  const [pageSize] = useState(
    process.env.REACT_APP_RUNNING_TESTS === 'true' ? 20 : 5,
  )
  const [confirmationActionType, setConfirmationActionType] =
    useState<StakeAction | null>(null)
  const { theme } = useTheme()
  const isDarkTheme = theme === 'Dark'
  const emptyImage = isDarkTheme ? emptyBoxDarkMode : emptyBoxLightMode
  const showPeraConfirmation = shouldConfirmMobileWallet()
  const [selectedFarmRewards, setSelectedFarmRewards] = useState<string[]>([])
  const isMounted = useIsMounted()
  const { search } = useLocation()
  const navigate = useNavigate()
  const checkForUpdatedFarm = (farm: Farm) => {
    // check if the pool that corresponds to the farm has loaded,
    // if so, and the farm still has the HMBL3LT display name, update the farm
    const {
      stakedTokenSymbol: staked,
      pairTokenASymbol: farmA,
      pairTokenBSymbol: farmB,
    } = farm
    const ready = staked === 'HMBL3LT' && Boolean(farmA && farmB)
    if (ready) return

    const pool = pools.find(
      ({ poolTokenId }) =>
        poolTokenId.toString() === farm.stakedTokenId.toString(),
    )
    if (!pool) return

    const [A, B] = [
      tokenList.find((tok) => tok.id === pool.tokAId),
      tokenList.find((tok) => tok.id === pool.tokBId),
    ]
    if (!A || !B) return

    const update = {
      ...farm,
      pairTokenAId: A.id,
      pairTokenASymbol: A.symbol,
      pairTokenBId: B.id,
      pairTokenBSymbol: B.symbol,
      stakedTokenPoolId: pool.poolAddr.toString(),
    }

    cacheReducer.farms.update(update)
  }

  const onPageClick = (newPage: number) => setCurrentPage(newPage)
  const matchQuery = (farm: Farm) => {
    const userStakedHere = farm.stakedTokenAmt !== '0'
    const { isPartnerFarm } = farm
    // Match to query string
    if (query) {
      const lowQ = query.toLowerCase()
      const match = [
        farm.stakedTokenSymbol?.toLowerCase(),
        farm.rewardTokenSymbol?.toLowerCase(),
        farm.pairTokenASymbol?.toLowerCase(),
        farm.pairTokenBSymbol?.toLowerCase(),
      ].some((v) => (v || '').includes(lowQ))
      return (
        match &&
        (myFarmsOnly ? userStakedHere : partnerFarmsOnly ? isPartnerFarm : true)
      )
    }

    if (myFarmsOnly) return userStakedHere
    return partnerFarmsOnly ? isPartnerFarm : true
  }

  // Filter and sort farms for live or ended (and update view state)
  const farms = useMemo(() => {
    if (queryId) {
      return stakingPools.filter(({ contractId }) => contractId === queryId)
    }
    const matchQueryPool = (fm?: Farm) => {
      if (!fm) return false
      const { endBlock } = fm
      const live = liveFarms ? endBlock !== '0' : endBlock === '0'
      return live && matchQuery(fm)
    }
    const sortTVL = (farm: Farm) => {
      const rewardTotal = getPrice(
        farm.rewardTokenId,
        farm.remainingRewardB,
        true,
      )
      const defaultTotal = getPrice(
        NETWORK_TOKEN_DEFAULT_ID,
        farm.remainingRewardA,
        true,
      )
      return Number(rewardTotal) + Number(defaultTotal)
    }
    const sort = (a: Farm[]) => sortBy(a, sortTVL).reverse()
    const partnerFarms: Farm[] = []
    const publicFarms: Farm[] = []
    stakingPools.forEach((farm) => {
      if (!matchQueryPool(farm)) return
      if (farm.isPartnerFarm) partnerFarms.push(farm)
      else publicFarms.push(farm)
    })

    return [
      ...sort(partnerFarms),
      ...(partnerFarmsOnly ? [] : sort(publicFarms)),
    ]
  }, [
    stakingPools,
    pools,
    partnerFarmsOnly,
    myFarmsOnly,
    liveFarms,
    query,
    queryId,
    prices,
  ])

  useEffect(() => {
    setCurrentPage(0)
  }, [partnerFarmsOnly, myFarmsOnly, liveFarms, query])

  const shouldUpdate = useMemo(
    () =>
      farms.reduce((needsUpdate, f) => {
        if (needsUpdate) return needsUpdate

        const {
          stakedTokenSymbol: staked,
          pairTokenASymbol: farmA,
          pairTokenBSymbol: farmB,
        } = f
        return staked === 'HMBL3LT' && (!farmA || !farmB)
      }, false),
    [farms, pools],
  )

  const view = useMemo(() => {
    // If the website has farms, set viewstate to idle so they can be displayed
    if (farms.length > 0) return VIEWSTATE.IDLE
    // If the user has not connected or is possibly fetching the farms, then show the fetching states
    if (!connected || farmsLoading) return VIEWSTATE.FETCHING
    // If there are no farms, the user is connected, and farms have already been fetched then there are probably no farms to display
    return VIEWSTATE.EMPTY
  }, [farms, connected, farmsLoading])

  const [lastCheck, setLastCheck] = useState(0)
  const refreshRewards = useMemo(() => {
    const { BLOCK_LENGTH } = blockConstants()
    return lastCheck === 0 || new Date().getTime() - lastCheck >= BLOCK_LENGTH
  }, [lastCheck, selectedStakingFarm])

  const stakeTokenBalance = () => {
    if (!selectedStakingFarm) return Promise.resolve('0')
    return getBalanceOfToken(selectedStakingFarm?.stakedTokenId)
  }

  const userStakedBalance = () => {
    if (!selectedStakingFarm) return Promise.resolve('0')
    return getStakingBalance(selectedStakingFarm.contractId)
  }

  const getRewards = async () => {
    if (!selectedStakingFarm || !refreshRewards) return
    const rewards = await getFormattedRewards(selectedStakingFarm.contractId)
    setSelectedFarmRewards(rewards)
    setLastCheck(new Date().getTime())
  }

  /* Asynchronous requests */
  const { stakedTokenId, contractId: farmId } = selectedStakingFarm || {}
  useEffect(() => {
    if (!selectedStakingFarm) return
    getRewards()
  }, [stakedTokenId, farmId])

  useEffect(() => {
    if (shouldUpdate) farms.forEach(checkForUpdatedFarm)
  }, [farms, pools])

  const fetchFromURL = async () => {
    if (cacheReducer.loadingFlags.farms) return
    cacheReducer.loadingFlags.farms = true
    await cacheAndLoadFarm(account, queryId)
    cacheReducer.loadingFlags.farms = false
  }

  useEffect(() => {
    if (queryId && account) fetchFromURL()
  }, [])

  const initTransactionUIFlow = (operationType: StakeAction) => {
    maybeOpenWallet()
    setConfirmationActionType(operationType)
    const m = showPeraConfirmation ? MODAL.MOBILE_CONFIRM : MODAL.NONE
    GlobalModal.active(m)
  }

  const setToast = async (
    operationType: StakeAction,
    stakingFarm: Farm,
    amount?: number,
  ) => {
    if (operationType === 'claiming' && !amount) {
      const { contractId, rewardTokenSymbol, rewardsPerBlock } = stakingFarm
      const [rewardA, rewardB] = await getFormattedRewards(contractId)
      setSelectedFarmRewards([rewardA, rewardB])
      const amt =
        rewardsPerBlock.asDefaultNetworkToken !== '0'
          ? `${rewardA} ${network} + `
          : ''
      const message = `${t`Claiming`} ${amt}${rewardB} ${rewardTokenSymbol}`
      const toastId = launchToast('progress', { message }, undefined, {
        autoClose: false,
      })
      return [contractId, toastId]
    }

    const label = operationType === 'staking' ? t`Staking` : t`Unstaking`
    const message = `${label} ${amount} ${selectedFarmTitle}`
    const toastId = launchToast('progress', { message }, undefined, {
      autoClose: false,
    })

    return [stakingFarm.contractId, toastId]
  }

  const endTransactionUIFlow = (toastId: string) => {
    removeToasts(toastId)
    GlobalModal.active(MODAL.FARM_SUCCESS)
  }

  const failedTransactionUIFlow = (
    e: any,
    operation: string,
    toastId?: string,
  ) => {
    if (shouldConfirmMobileWallet()) clearGlobalModal()

    const label = `API.Trader.Perform ${operation}`
    handleContractError(label, e, undefined, toastId)
  }

  const updateFarmData = (updates: SDKStakeUpdate) => {
    if (!selectedStakingFarm) return
    const updatedFarm = {
      ...selectedStakingFarm,
      stakedTokenAmt: updates.amountStaked,
      totalStaked: updates.newTotalStaked,
    }
    cacheReducer.farms.update(updatedFarm)
  }

  const onCancelStake = () => {
    clearGlobalModal()
    sendGoogleTagEvent('FARMS-Cancel_Stake', account, search)
  }

  const handleStake = async (amount: number) => {
    if (!selectedStakingFarm) return
    initTransactionUIFlow('staking')
    const [contractId, toastId] = await setToast(
      'staking',
      selectedStakingFarm,
      amount,
    )
    try {
      sendGoogleTagEvent('FARMS-Begin_Stake', account, search)
      const resultStake = await stakeAmount(
        contractId,
        amount,
        selectedStakingFarm.rewardTokenId,
        selectedStakingFarm.stakedTokenId,
      )
      endTransactionUIFlow(toastId)
      if (process.env.REACT_APP_RUNNING_TESTS === 'true')
        await useReach().wait(1)
      if (!resultStake) return
      sendGoogleTagEvent('FARMS-Complete_Stake', account, search)
      updateFarmData(resultStake)
    } catch (e) {
      sendGoogleTagEvent('FARMS-ERROR_Add_Stake', account, search)
      failedTransactionUIFlow(e, 'Stake', toastId)
    }
  }

  const onCancelUnstake = () => {
    clearGlobalModal()
    sendGoogleTagEvent('FARMS-Cancel_Remove_Stake', account, search)
  }

  const handleUnstake = async (amount: number) => {
    if (!selectedStakingFarm) return
    initTransactionUIFlow('unstaking')
    const [contractId, toastId] = await setToast(
      'unstaking',
      selectedStakingFarm,
      amount,
    )
    try {
      sendGoogleTagEvent('FARMS-Begin_Remove_Stake', account, search)
      const resultUnstake = await unstakeAmount(
        contractId,
        amount,
        selectedStakingFarm.stakedTokenId,
        selectedStakingFarm.rewardTokenId,
      )
      endTransactionUIFlow(toastId)

      if (!resultUnstake) return
      sendGoogleTagEvent('FARMS-Complete_Remove_Stake', account, search)
      updateFarmData(resultUnstake)
    } catch (e) {
      sendGoogleTagEvent('FARMS-ERROR_Remove_Stake', account, search)
      failedTransactionUIFlow(e, 'Unstake', toastId)
    }
  }

  const onCancelClaimRewards = () => {
    sendGoogleTagEvent('FARMS-Cancel_Reward-Claim', account, search)
    clearGlobalModal()
  }

  const handleClaimRewards = async () => {
    if (!selectedStakingFarm) return
    sendGoogleTagEvent('FARMS-Begin_Reward-Claim', account, search)
    initTransactionUIFlow('claiming')
    const [contractId, toastId] = await setToast(
      'claiming',
      selectedStakingFarm,
    )
    try {
      const resultClaim = await claimRewards(
        contractId,
        selectedStakingFarm.rewardTokenId,
      )
      endTransactionUIFlow(toastId)
      if (!resultClaim) return
      if (isMounted()) {
        setSelectedFarmRewards(resultClaim.userReceived)
      }
      const update = {
        ...selectedStakingFarm,
        remainingRewardA: resultClaim.totalRemaining[0],
        remainingRewardB: resultClaim.totalRemaining[1],
      }
      cacheReducer.farms.update(update)
      sendGoogleTagEvent('FARMS-Complete_Reward-Claim', account, search)
    } catch (e) {
      sendGoogleTagEvent('FARMS-ERROR_Reward-Claim', account, search)
      failedTransactionUIFlow(e, 'Claim Rewards', toastId)
    }
  }

  const ConfirmTitles = {
    staking: t`You staked liquidity`,
    unstaking: t`You unstaked liquidity`,
    claiming: t`You claimed your rewards!`,
  }

  const noFarmsMessage = () => {
    if (queryId) return `${t`No farm with id`} ${queryId} ${t`found`}`
    return query || myFarmsOnly || partnerFarmsOnly
      ? t`No farms match these filters`
      : liveFarms
      ? t`There are no live farms`
      : t`There are no ended farms`
  }

  const paginatedFarms = farms.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize,
  )

  const calcStakedTokensDetails = (amt: string) => {
    if (confirmationActionType !== 'staking' || !selectedStakingFarm || !amt)
      return ''
    const poolId = selectedStakingFarm.stakedTokenPoolId
    const pool = pools.find((p) => p.poolAddr === poolId)
    if (!pool) return ''
    return `${parseFloat(
      amountOfTokenDeposited(amt, pool, true).toFixed(5),
    ).toString()} ${tokA.symbol} +
    ${parseFloat(
      amountOfTokenDeposited(amt, pool, false).toFixed(5),
    ).toString()}
    ${tokB.symbol}`
  }
  const goToRemoveLiquidity = () => {
    navigate(paths.pool.remove(selectedStakingFarm?.stakedTokenPoolId))
  }
  return (
    <FarmTableContainer data-testid='farm-table'>
      <>
        <ListHeadings>
          {HEADINGS.map((heading, index) => {
            const gridColumn = `${index + 1}/${index + 2}`
            return (
              <HeadingItem
                style={{ gridColumn }}
                first={index === 0}
                key={`${index}-${heading.title ?? ''}`}
              >
                {heading.title}
                {heading.desc && (
                  <Tooltip icon={QuestionIcon} message={heading.desc} />
                )}
              </HeadingItem>
            )
          })}
        </ListHeadings>

        {/* Empty or loading state */}
        <List data-testid='farm-list'>
          {view === VIEWSTATE.FETCHING && (
            <>
              {connecting || (farmsLoading && !paginatedFarms.length)
                ? ['0', '1', '2'].map((i) => <FarmTableItemSkeleton key={i} />)
                : !connected && (
                    <NoFarmsLabel>
                      <Trans>Connect Wallet</Trans>
                    </NoFarmsLabel>
                  )}
            </>
          )}

          {/* List | VIEWSTATE.IDLE when items to display */}
          {view === VIEWSTATE.IDLE &&
            paginatedFarms.map((farm) => (
              <FarmTableItem
                farm={farm}
                key={farm.contractId}
                isPartnerFarm={farm.isPartnerFarm || false}
              />
            ))}

          {/* List | VIEWSTATE.EMPTY when disconnected OR no filtered items to display */}
          {view === VIEWSTATE.EMPTY && (
            <NoFarmsContainer>
              {connected ? (
                <>
                  <Image src={emptyImage} />
                  <NoFarmsMessage>{noFarmsMessage()}</NoFarmsMessage>
                </>
              ) : (
                <NoFarmsMessage>
                  <Trans>Connect Wallet</Trans>
                </NoFarmsMessage>
              )}
            </NoFarmsContainer>
          )}
        </List>

        <Pagination
          pagesLength={farms.length}
          onPageClick={onPageClick}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </>

      {selectedStakingFarm && modal === MODAL.STAKE_FARM && tokA && (
        <StakingLiquidity
          open={modal === MODAL.STAKE_FARM}
          onClose={onCancelStake}
          onConfirm={handleStake}
          title={t`Stake Liquidity`}
          buttonText={t`Stake`}
          tokenA={tokA}
          tokenB={tokB}
          totalStaked={selectedStakingFarm.totalStaked}
          rewardToken={rewardTok}
          fetchBalance={stakeTokenBalance}
          stakedTokenDecimals={selectedStakingFarm.stakedTokenDecimals}
          showFarmWarning={!selectedStakingFarm.isPartnerFarm}
          showInfo
          stakedTokenPoolId={selectedStakingFarm.stakedTokenPoolId}
        />
      )}
      {selectedStakingFarm && modal === MODAL.UNSTAKE_FARM && tokA && (
        <StakingLiquidity
          open={modal === MODAL.UNSTAKE_FARM}
          onClose={onCancelUnstake}
          onConfirm={handleUnstake}
          title={t`Unstake Liquidity`}
          buttonText={t`Unstake`}
          tokenA={tokA}
          tokenB={tokB}
          rewardToken={rewardTok}
          fetchBalance={userStakedBalance}
          stakedTokenDecimals={selectedStakingFarm.stakedTokenDecimals}
        />
      )}
      {selectedStakingFarm && modal === MODAL.CLAIM_FARM && (
        <ClaimRewards
          connector={network}
          title='Your Rewards'
          farm={selectedStakingFarm}
          open={modal === MODAL.CLAIM_FARM}
          onClose={onCancelClaimRewards}
          onClaim={handleClaimRewards}
        />
      )}
      {confirmationActionType !== null && modal === MODAL.FARM_SUCCESS && (
        <SuccessPoolModal
          additionalInfo={calcStakedTokensDetails(selectedFarmAmounts.a ?? '')}
          amount={selectedFarmAmounts.a ?? ''}
          image={
            ['staking', 'claiming'].includes(confirmationActionType)
              ? 'add'
              : 'remove'
          }
          mode={
            ['staking', 'unstaking'].includes(confirmationActionType)
              ? 'stake'
              : confirmationActionType === 'claiming'
              ? 'claim'
              : 'liquidity'
          }
          showRemoveLiquidityButton={
            confirmationActionType === 'unstaking' &&
            selectedStakingFarm?.stakedTokenPoolId !== undefined
          }
          onClose={() => {
            setConfirmationActionType(null)
          }}
          onClickRemoveLiquidity={() =>
            confirmationActionType === 'unstaking' && goToRemoveLiquidity()
          }
          open={confirmationActionType !== null && modal === MODAL.FARM_SUCCESS}
          rewardGovTokenAmt={Number(selectedFarmRewards[0])}
          rewardTokenAmt={Number(selectedFarmRewards[1])}
          rewardTokenSymbol={selectedStakingFarm?.rewardTokenSymbol}
          title={ConfirmTitles[confirmationActionType] || ''}
          tokenA={tokA ?? { name: '', symbol: '', decimals: 4 }}
          tokenAAmount={Number(selectedFarmAmounts.a ?? '')}
          tokenB={tokB}
        />
      )}
      {showPeraConfirmation &&
        selectedStakingFarm &&
        confirmationActionType &&
        tokA?.symbol && (
          <MobileWalletConfirmationModal
            open={modal === MODAL.MOBILE_CONFIRM}
            onClose={() => {
              if (showPeraConfirmation) removeToasts()
              clearGlobalModal()
            }}
            action={confirmationActionType}
            tokenAAmt={
              confirmationActionType === 'claiming'
                ? selectedFarmRewards[0]
                : selectedFarmAmounts.a || '0'
            }
            tokenASymbol={
              confirmationActionType === 'claiming'
                ? network
                : selectedFarmAmounts.b
                ? tokA.symbol
                : selectedFarmTitle
            }
            tokenBAmt={
              confirmationActionType === 'claiming'
                ? selectedFarmRewards[1]
                : selectedFarmAmounts.b
                ? selectedFarmAmounts.b
                : undefined
            }
            tokenBSymbol={
              confirmationActionType === 'claiming'
                ? selectedStakingFarm.rewardTokenSymbol
                : tokB?.symbol
            }
          />
        )}
    </FarmTableContainer>
  )
}

export default FarmTable
