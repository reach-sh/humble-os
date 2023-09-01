import { useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/macro'
import { Link, useLocation } from 'react-router-dom'
import { getFormattedRewards, getStakingBalance } from 'reach/api/staker'
import { blockConstants } from '@reach-sh/humble-sdk'
import useGlobalDex from 'hooks/useGlobalDex'
import { truncateText, copyToClipboard } from 'utils/input'
import { GlobalUser } from 'state/reducers/user'
import { MODAL, GlobalModal } from 'state/reducers/modals'
import { GlobalDex } from 'state/reducers/dex'
import { Farm, Token } from 'types/shared'
import CryptoIcon from 'components/Common/CryptoIcon'
import PopoutIcon from 'components/Common/PopoutIcon'
import ChainIcon from 'components/Common/Icons/chain'
import {
  CURRENT_PROVIDER,
  NETWORK_TOKEN_DEFAULT_ID,
  PROVIDERS,
} from 'constants/reach_constants'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import DisplayReward from 'components/Farm/Components/DisplayReward'
import { getFarmPoolTokens } from 'helpers/farm'
import {
  ListItemDropdown,
  DropdownLinks,
  ExtLink,
  CopyButtonContainer,
  CopyButton,
  DropdownDetails,
  AvailableRewards,
  TitleLabel,
  RewardsLayout,
  RewardText,
  ButtonLayout,
  ClaimButton,
  StakedAmount,
  StakedDetails,
  StakeButton,
  NoteMsg,
  StakedDetailsLoading,
} from './FarmItemDropdown.Containers'

type FarmItemDropdownProps = {
  connector: string
  farm: Farm
  isPoolFarm: boolean
  contractId: string | number
}

export default function FarmItemDropdown(props: FarmItemDropdownProps) {
  const { reachAccount } = GlobalUser.getState()
  const { connector, farm, isPoolFarm, contractId } = props
  const depositPath = () => {
    if (!isPoolFarm) return ''
    return `/pool/add/${farm.stakedTokenPoolId}?returnTo=farm`
  }
  const [stakedAmt, setStakedAmt] = useState('')
  const [claimA, setClaimA] = useState('')
  const [claimB, setClaimB] = useState('')
  const [checking, setChecking] = useState(false)
  const [updatingStakedAmt, setUpdatingStakedAmt] = useState(false)
  const [copied, setCopied] = useState(false)
  const ended = useMemo(() => farm.endBlock === '0', [farm])
  const emptyVals = ['', '0']
  const noRewards = useMemo(
    () => emptyVals.includes(claimA) && emptyVals.includes(claimB),
    [claimA, claimB],
  )
  const { search } = useLocation()
  const { pools, prices } = useGlobalDex(['prices', 'pools'])
  const blockDuration = blockConstants().BLOCK_LENGTH * 1000
  const displayName = useMemo(() => {
    if (!isPoolFarm) return farm.stakedTokenSymbol

    const { pairTokenASymbol, pairTokenBSymbol } = farm
    const hasPool = pairTokenASymbol && pairTokenBSymbol
    if (hasPool) return `${pairTokenASymbol}/${pairTokenBSymbol}`

    const [a, b] = getFarmPoolTokens(farm, pools)
    return `${a?.symbol}/${b?.symbol}`
  }, [farm, pools])

  const loadingFarmDetail = useMemo(
    () => updatingStakedAmt && claimA === '' && claimB === '',
    [updatingStakedAmt, claimA, claimB],
  )
  const setUserStake = async () => {
    if (updatingStakedAmt) return
    setUpdatingStakedAmt(true)
    setStakedAmt(await getStakingBalance(farm.contractId))
    setUpdatingStakedAmt(false)
  }

  // Check whether current user has rewards to claim
  const checkClaims = async () => {
    if (checking) return
    setChecking(true)
    const [claimableA, claimableB] = await getFormattedRewards(farm.contractId)
    setClaimA(claimableA)
    setClaimB(claimableB)
    setChecking(false)
  }

  const onClickClaim = () => {
    sendGoogleTagEvent('FARMS-Launch_Reward-Claim', reachAccount, search)
    GlobalModal.active(MODAL.CLAIM_FARM)
    GlobalDex.selectedStakeContractId(contractId)
  }

  const onClickStake = () => {
    const evt = emptyVals.includes(stakedAmt)
      ? 'FARMS-Launch_Stake-New'
      : 'FARMS-Launch_Stake-more'
    sendGoogleTagEvent(evt, reachAccount, search)
    GlobalModal.active(MODAL.STAKE_FARM)
    GlobalDex.selectedStakeContractId(contractId)
  }

  const onClickUnstake = () => {
    sendGoogleTagEvent('FARMS-Launch_Stake-Remove', reachAccount, search)
    GlobalModal.active(MODAL.UNSTAKE_FARM)
    GlobalDex.selectedStakeContractId(contractId)
  }

  const handleCopyLink = () => {
    setCopied(true)
    copyToClipboard(`${window.location.origin}/farm?id=${farm.contractId}`)
    setTimeout(() => setCopied(false), 3000)
  }

  const [netRewards, tokenRewards, noRewardsAvailable] = useMemo(() => {
    const { asDefaultNetworkToken, asRewardToken } = farm.rewardsPerBlock
    const falsy = (v: any) => [undefined, '0'].includes(v)
    const nr = falsy(asDefaultNetworkToken) && falsy(asRewardToken)
    return [asDefaultNetworkToken || '0', asRewardToken || '0', nr]
  }, [])

  useEffect(() => {
    setUserStake()
    if (!checking) checkClaims() // first load
    const timeout = setInterval(checkClaims, blockDuration)
    return () => clearInterval(timeout)
  }, [contractId, farm])

  return (
    <ListItemDropdown data-testid='farm-item-dropdown'>
      <DropdownLinks>
        {isPoolFarm && (
          <Link to={depositPath()}>
            {truncateText(`Get ${displayName}`, 16)}
          </Link>
        )}
        <ExtLink
          data-testid='view-contract-link'
          href={getIndexerContractURL(farm.contractId)}
        >
          View Contract <PopoutIcon />
        </ExtLink>

        {isPoolFarm && (
          <ExtLink
            href='#'
            onClick={(e) =>
              launchAssetURLs(e, farm.pairTokenAId, farm.pairTokenBId)
            }
          >
            See Pair Info <PopoutIcon />
          </ExtLink>
        )}
        <CopyButtonContainer>
          <CopyButton
            data-testid='copy-farm-id'
            onClick={() => handleCopyLink()}
          >
            <ChainIcon />
            {copied ? t`Copied!` : t`Copy link`}
          </CopyButton>
        </CopyButtonContainer>
      </DropdownLinks>

      <DropdownDetails>
        <AvailableRewards>
          <TitleLabel>{t`Available Rewards`}</TitleLabel>
          <RewardsLayout>
            {netRewards !== '0' && (
              <RewardText>
                <CryptoIcon symbol={connector} id='0' />{' '}
                <DisplayReward
                  loading={loadingFarmDetail}
                  connector={connector}
                  priceUnit={prices.displayUnit}
                  rewardTokenAmt={claimA}
                  rewardTokenId={NETWORK_TOKEN_DEFAULT_ID}
                />
              </RewardText>
            )}
            {(tokenRewards !== '0' || noRewardsAvailable) && (
              <RewardText>
                <CryptoIcon
                  symbol={farm.rewardTokenSymbol}
                  id={farm.rewardTokenId}
                />{' '}
                <DisplayReward
                  loading={loadingFarmDetail}
                  connector={connector}
                  priceUnit={prices.displayUnit}
                  rewardTokenAmt={claimB}
                  rewardTokenId={farm.rewardTokenId}
                />
              </RewardText>
            )}
          </RewardsLayout>
          <ButtonLayout>
            <ClaimButton
              disabled={noRewards}
              data-testid='claim-btn'
              onClick={onClickClaim}
            >
              Claim
            </ClaimButton>
          </ButtonLayout>
        </AvailableRewards>

        <StakedAmount>
          <TitleLabel>{t`Staked`}</TitleLabel>
          <StakedDetailsLoading
            loading={loadingFarmDetail}
            width={60}
            borderRadius={9}
          >
            <StakedDetails data-testid='farm-item-detail' wrapText bold>
              {truncateText(stakedAmt.toString(), 10)}
            </StakedDetails>
          </StakedDetailsLoading>
          <ButtonLayout>
            <StakeButton
              variant='accent'
              data-testid='stake-btn'
              disabled={ended}
              onClick={onClickStake}
            >
              {emptyVals.includes(stakedAmt) ? 'Stake' : 'Add more'}
            </StakeButton>
            {!emptyVals.includes(stakedAmt) && (
              <StakeButton data-testid='unstake-btn' onClick={onClickUnstake}>
                Unstake
              </StakeButton>
            )}
          </ButtonLayout>
          {!emptyVals.includes(stakedAmt) && (
            <NoteMsg>{t`Note: Unstaking also claims your current rewards`}</NoteMsg>
          )}
        </StakedAmount>
      </DropdownDetails>
    </ListItemDropdown>
  )
}

/** View all pool assets on Algoexplorer (or other indexer) */
function launchAssetURLs(e: any, tokA: Token['id'], tokB: Token['id']) {
  e.preventDefault()
  e.stopPropagation()

  const api = `${getIndexerBaseURL()}/asset`
  const tokens = [tokA, tokB]
  tokens.forEach((tok) => {
    if (tok !== '0') window.open(`${api}/${tok}`)
  })
}

/** Algoexplorer (or other indexer) base URL */
function getIndexerBaseURL() {
  const base =
    CURRENT_PROVIDER === PROVIDERS.TESTNET
      ? 'testnet.algoexplorer'
      : 'algoexplorer'
  return `https://${base}.io`
}

/** Algoexplorer (or other indexer) URL for viewing contract */
function getIndexerContractURL(appId: string | number) {
  const url = `${getIndexerBaseURL()}/application/${appId}`
  return url
}
