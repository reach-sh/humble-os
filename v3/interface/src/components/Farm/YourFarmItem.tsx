import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { blockConstants } from '@reach-sh/humble-sdk'
import SIZE from 'constants/screenSizes'
import { useTheme } from 'contexts/theme'
import { COLORS } from 'theme'
import { Farm } from 'types/shared'
import { condenseFarm } from 'utils/farm'
import { getLPTokensPrice } from 'prices'
import { GlobalDex } from 'state/reducers/dex'
import GlobalModal, { MODAL } from 'state/reducers/modals'
import { useReach } from 'helpers/getReach'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import { getFormattedRewards, getStakingBalance } from 'reach/api/staker'
import { NETWORK_TOKEN_DEFAULT_ID } from 'constants/reach_constants'
import Icon from 'components/Common/Icon'
import CryptoIcon from 'components/Common/CryptoIcon'
import Button from 'components/Common/Button'
import DisplayReward from 'components/Farm/Components/DisplayReward'
import useGlobalDex from 'hooks/useGlobalDex'
import useGlobalUser from 'hooks/useGlobalUser'
import { getFarmPoolTokens } from 'helpers/farm'
import ItemDetails from './ItemDetails'
import SymbolAndBadge from './SymbolAndBadge'

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background-color: ${({ theme }) => theme.colors.lighterBackground};
  border-radius: 8px;
  padding: 16px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const FarmItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`

const ExpandButtonCell = styled.div`
  align-self: flex-start;
  height: 52px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-content: flex-end;
  @media (max-width: ${SIZE.sm}) {
    height: 45px;
  }
`

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-content: flex-end;
  cursor: pointer;
`

const ItemTitle = styled.div`
  display: flex;
  gap: 6px;
`

const IconWrapper = styled.div`
  height: 20px;
`

const PairName = styled(ItemDetails)`
  flex-direction: row;
  overflow: visible;
`

const Icons = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin: 0 4px;
`

const ActionButton = styled(Button).attrs({ size: 'sm' })`
  background-color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  font-size: 12px;
  height: 22px;
  transition: opacity 0.1s;
  width: 80px;
  &.unstake {
    background-color: ${COLORS.black};
    color: ${COLORS.white};
  }
  @media (max-width: ${SIZE.sm}) {
    height: 32px;
    border-radius: 4px;
    width: 100%;
    &.claim {
      width: 100px;
    }
  }
`

const Box = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: space-between;
  @media (max-width: ${SIZE.sm}) {
    align-items: flex-start;
    flex-direction: column;
  }
`

const Line = styled.div`
  height: 40px;
  width: 1px;
  background-color: ${COLORS.lightGray};
  @media (max-width: ${SIZE.sm}) {
    display: none;
  }
`

const Amount = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  @media (max-width: ${SIZE.sm}) {
    align-items: center;
    justify-content: flex-start;
    flex-direction: row;
    gap: 8px;
  }
`

const Staked = styled.div`
  font-size: 16px;
  font-weight: 700;
  text-align: right;
  @media (max-width: ${SIZE.sm}) {
    margin-left: 6px;
  }
`

const StakedPrice = styled.div`
  font-size: 12px;
  font-weight: 400;
  text-align: right;
`

const SmallButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  @media (max-width: ${SIZE.sm}) {
    display: none;
  }
`

const ActionButtons = styled.div`
  display: none;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  @media (max-width: ${SIZE.sm}) {
    display: flex;
  }
`

const Dropdown = styled.div`
  display: flex;
  margin-top: 16px;
  align-items: center;
  @media (max-width: ${SIZE.sm}) {
    flex-direction: column;
    padding-left: 32px;
  }
`

const Text = styled.div`
  font-size: 9px;
  font-weight: 500;
  flex-shrink: 0;
`

const RewardsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  gap: 16px;
  width: 100%;
  border-top: 1px solid ${COLORS.lightGray};
`

const RewardsList = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: ${SIZE.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`

const RewardsContainer = styled.div`
  display: flex;
  flex-grow: 1;
`

const Rewards = styled.div<{ dark?: boolean }>`
  display: flex;
  gap: 8px;
  border-radius: 11px;
  padding: 0 4px 0 2px;
  background-color: ${({ dark }) =>
    dark ? COLORS.DMMidGray : COLORS.darkCream};
  @media (max-width: ${SIZE.sm}) {
    flex-direction: column;
    gap: 0;
  }
`

const RewardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px;
  font-size: 12px;
  font-weight: 400;
`

const YourFarmItem = ({ farm }: { farm: Farm }) => {
  const { connector } = useReach()
  const { search } = useLocation()
  const { reachAccount } = useGlobalUser(['reachAccount'])
  const { pools, prices, tokenList } = useGlobalDex([
    'pools',
    'prices',
    'tokenList',
  ])
  const blockDuration = blockConstants().BLOCK_LENGTH * 1000
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const { isPoolFarm, stakeToken } = condenseFarm(farm)
  const [tokA, tokB] = useMemo(
    () => getFarmPoolTokens(farm, pools),
    [farm, tokenList, pools],
  )
  const ended = useMemo(() => farm.endBlock === '0', [farm])
  const [expanded, setExpanded] = useState(false)
  const [stakedAmt, setStakedAmt] = useState('')
  const [stakedAmtPrice, setStakedAmtPrice] = useState('')
  const [claimA, setClaimA] = useState('')
  const [claimB, setClaimB] = useState('')
  const [updatingStakedAmt, setUpdatingStakedAmt] = useState(false)
  const [checking, setChecking] = useState(false)

  const rewards = [
    {
      perBlock: farm.rewardsPerBlock.asDefaultNetworkToken,
      formatted: claimA,
      tokenId: NETWORK_TOKEN_DEFAULT_ID,
      symbol: connector,
    },
    {
      perBlock: farm.rewardsPerBlock.asRewardToken,
      formatted: claimB,
      tokenId: farm.rewardTokenId,
      symbol: farm.rewardTokenSymbol,
    },
  ]

  const checkClaims = async () => {
    if (checking) return
    setChecking(true)
    const [claimableA, claimableB] = await getFormattedRewards(farm.contractId)
    setClaimA(claimableA)
    setClaimB(claimableB)
    setChecking(false)
  }

  const loadingFarmDetail = useMemo(
    () => updatingStakedAmt && claimA === '' && claimB === '',
    [updatingStakedAmt, claimA, claimB],
  )

  const noRewards = useMemo(
    () => ['', '0'].includes(claimA) && ['', '0'].includes(claimB),
    [claimA, claimB],
  )

  useEffect(() => {
    setUserStake()
    if (!checking) checkClaims() // first load
    const timeout = setInterval(checkClaims, blockDuration)
    return () => clearInterval(timeout)
  }, [farm])

  useEffect(() => {
    const poolId = farm.stakedTokenPoolId
    const pool = pools.find((p) => p.poolAddr === poolId)
    if (pool) setStakedAmtPrice(getLPTokensPrice(stakedAmt, pool))
  }, [stakedAmt, prices])

  const setUserStake = async () => {
    if (updatingStakedAmt) return
    setUpdatingStakedAmt(true)
    setStakedAmt(await getStakingBalance(farm.contractId))
    setUpdatingStakedAmt(false)
  }

  const onClickStake = () => {
    sendGoogleTagEvent('FARMS-Launch_Stake-more', reachAccount, search)
    GlobalModal.active(MODAL.STAKE_FARM)
    GlobalDex.selectedStakeContractId(farm.contractId)
  }

  const onClickUnstake = () => {
    sendGoogleTagEvent('FARMS-Launch_Stake-Remove', reachAccount, search)
    GlobalModal.active(MODAL.UNSTAKE_FARM)
    GlobalDex.selectedStakeContractId(farm.contractId)
  }

  const onClickClaim = () => {
    sendGoogleTagEvent('FARMS-Launch_Reward-Claim', reachAccount, search)
    GlobalModal.active(MODAL.CLAIM_FARM)
    GlobalDex.selectedStakeContractId(farm.contractId)
  }

  return (
    <Container>
      <Content>
        <FarmItem>
          <Box>
            <ItemTitle>
              <Icons>
                {isPoolFarm ? (
                  [tokA, tokB].map((tok) => (
                    <IconWrapper key={tok.id}>
                      <CryptoIcon symbol={tok.symbol} id={tok.id} />
                    </IconWrapper>
                  ))
                ) : (
                  <IconWrapper>
                    <CryptoIcon symbol={stakeToken.symbol} id={stakeToken.id} />
                  </IconWrapper>
                )}
              </Icons>
              <PairName bold>
                <SymbolAndBadge
                  tokenAId={`${tokA?.id}` || farm.stakedTokenId}
                  tokenBId={`${tokB?.id}`}
                />
              </PairName>
            </ItemTitle>
            <Amount>
              <Staked>{stakedAmt}</Staked>
              {stakedAmt && stakedAmtPrice !== '' && (
                <StakedPrice>{`≈${stakedAmtPrice}`}</StakedPrice>
              )}
            </Amount>
          </Box>
          <Line />
          <SmallButtons>
            <ActionButton disabled={ended} onClick={onClickStake}>
              {t`Add more`}
            </ActionButton>
            <ActionButton
              className='unstake'
              onClick={onClickUnstake}
            >{t`Unstake`}</ActionButton>
          </SmallButtons>
        </FarmItem>
        {expanded && (
          <Dropdown>
            <ActionButtons>
              <ActionButton disabled={ended} onClick={onClickStake}>
                {t`Add more`}
              </ActionButton>
              <ActionButton
                className='unstake'
                onClick={onClickUnstake}
              >{t`Unstake`}</ActionButton>
            </ActionButtons>
            <RewardsWrapper>
              <RewardsList>
                <Text>{t`AVAILABLE REWARDS`}</Text>
                <RewardsContainer>
                  <Rewards dark={isDarkMode}>
                    {rewards.map((reward) => {
                      if (reward.perBlock === '0') return null
                      return (
                        <RewardItem key={`reward-${reward.tokenId}`}>
                          <CryptoIcon
                            size={16}
                            symbol={reward.symbol}
                            id={reward.tokenId}
                          />
                          <DisplayReward
                            loading={loadingFarmDetail}
                            connector={connector}
                            priceUnit={prices.displayUnit}
                            rewardTokenAmt={reward.formatted}
                            rewardTokenId={reward.tokenId}
                          />
                        </RewardItem>
                      )
                    })}
                  </Rewards>
                </RewardsContainer>
              </RewardsList>
              <ActionButton
                className='claim'
                onClick={onClickClaim}
                disabled={noRewards}
              >
                Claim
              </ActionButton>
            </RewardsWrapper>
          </Dropdown>
        )}
      </Content>
      <ExpandButtonCell>
        <IconContainer onClick={() => setExpanded(!expanded)}>
          <Icon iconType={`keyboard_arrow_${expanded ? 'up' : 'down'}`} />
        </IconContainer>
      </ExpandButtonCell>
    </Container>
  )
}

export default YourFarmItem
