import { useState, useEffect, useMemo } from 'react'
import { t, Trans } from '@lingui/macro'
import styled from 'styled-components'
import { getTokenById } from 'helpers/pool'
import CryptoIcon from 'components/Common/CryptoIcon'
import Button from 'components/Common/Button'
import FlexContainer, {
  FlexColumnContainer,
  GridContainer,
} from 'components/Common/FlexContainer'
import { Farm } from 'types/shared'
import {
  NETWORK_TOKEN_DEFAULT_ID,
  STAKE_TRANSACTION_FEE,
} from 'constants/reach_constants'
import { getFormattedRewards, getStakingBalance } from 'reach/api/staker'
import ModalComponent from 'components/Modals/ModalComponent'
import { GlobalDex } from 'state/reducers/dex'
import { condenseFarm } from 'utils/farm'
import SIZE from 'constants/screenSizes'
import Tooltip from 'components/Common/Tooltip'
import VerifiedBadge from 'components/Common/VerifiedBadge'

const ClaimRewardsContainer = styled.div`
  padding: 14px 7px;
`
const SummaryContainer = styled(FlexColumnContainer)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
  border: 1px solid #9ca2aa;
  padding: 10px 0;
  margin-top: 18px;

  div:first-child,
  div:last-child {
    border: none;
    cursor: default;
  }

  div:hover {
    background: initial;
  }
`
const YourBalanceContainer = styled(FlexContainer)<{
  marginTop?: number
  bottomPadding?: number
}>`
  justify-content: space-between;
  margin-top: ${({ marginTop }) => marginTop || 0}px;
  padding: 0px 16px ${({ bottomPadding }) => bottomPadding || 8}px 24px;
`
const YourBalanceTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.grayText};
`
const AssetInfoContainer = styled(FlexColumnContainer)`
  align-items: flex-start;
  place-content: center;

  b {
    margin-left: ${({ theme }) => theme.sizes.xs};
  }
`
const SmallText = styled.div<{ bold?: boolean }>`
  display: inline-block;
  font-size: smaller;
  font-weight: ${({ bold }) => (bold ? 'bolder' : 'normal')};
  margin-left: ${({ theme }) => theme.sizes.xs};
  margin-right: ${({ theme }) => theme.sizes.xs};
`
const AssetName = styled(SmallText)`
  display: flex;
  gap: 4px;
  color: ${({ theme }) => theme.colors.nameText};
  font-size: 16px;
  font-style: normal;
  font-weight: bold;
  line-height: 19px;
  text-align: left;
`
const AssetBalance = styled(FlexColumnContainer)`
  align-items: end;
  flex-grow: 1;
  font-size: 16px;
  font-style: normal;
  font-weight: bold;
  line-height: 19px;
  overflow: hidden;
  place-content: end;
  text-align: right;
`
const AssetItemWrapper = styled(GridContainer)<{
  hideBorder?: boolean
  disabled?: boolean
}>`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  grid-template-columns: repeat(2, 50%);
  justify-content: space-between;
  padding: 5px 16px 5px 24px;
  transition: background 0.1s ease-out;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }

  ${AssetName} {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const TopAssetItemWrapper = styled(AssetItemWrapper)`
  grid-template-columns: 60% 30%;
`

const TooltipWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`
const ClaimButton = styled(Button)`
  margin-top: 32px;
  font-weight: 700;
  .big-font {
    font-size: 20px;
  }
  width: 100%;
  height: 54px;
`
const Icons = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin: 0 4px;
  @media (max-width: ${SIZE.sm}) {
    flex-direction: column;
  }
`

const IconWrapper = styled.div`
  height: 20px;
  margin-right: 5px;
  @media (max-width: ${SIZE.sm}) {
    transform: scale(0.8);
    margin-right: 0px;
  }
`

interface Props {
  connector: string
  farm: Farm
  title: string
  open: boolean
  onClose: () => void
  onClaim: () => void
}

const ClaimRewards = ({
  connector,
  farm,
  title,
  open,
  onClose,
  onClaim,
}: Props) => {
  const [rewardABalance, setRewardABalance] = useState('Loading...')
  const [rewardBBalance, setRewardBBalance] = useState('Loading...')
  const [stakedAmt, setStakedAmt] = useState('Loading...')
  const cFarm = useMemo(() => condenseFarm(farm), [farm])

  useEffect(() => {
    const getRewards = async () => {
      const [rewardA, rewardB] = await getFormattedRewards(farm.contractId)

      setRewardABalance(rewardA)
      setRewardBBalance(rewardB)
      GlobalDex.selectedFarmAmounts({ a: rewardA, b: rewardB })
    }
    getRewards()
  }, [])

  useEffect(() => {
    const setUserStake = async () =>
      setStakedAmt(await getStakingBalance(farm.contractId))
    setUserStake()
  }, [farm])

  const rewardsLoaded =
    rewardABalance !== 'Loading...' && rewardBBalance !== 'Loading...'
  const rewardsSet =
    rewardsLoaded && (rewardABalance !== '0' || rewardBBalance !== '0')

  const networkToken = getTokenById(NETWORK_TOKEN_DEFAULT_ID)
  const minBalance = networkToken?.minBalance || 0
  const isEnoughBalance =
    Number(networkToken?.balance) > minBalance + STAKE_TRANSACTION_FEE

  const [condensedA, condensedB] = cFarm.poolTokens
    ? cFarm.poolTokens
    : [undefined, undefined]

  const [tokA, tokB, stakedToken, rewardToken] = useMemo(
    () => [
      condensedA?.id ? getTokenById(condensedA.id) : undefined,
      condensedB?.id ? getTokenById(condensedB.id) : undefined,
      getTokenById(cFarm.stakeToken.id),
      getTokenById(cFarm.rewardToken.id),
    ],
    [cFarm],
  )
  return (
    <ModalComponent
      modalTitle={title}
      onClose={onClose}
      open={open}
      sticky={false}
      width={420}
    >
      <ClaimRewardsContainer>
        <YourBalanceContainer marginTop={20} bottomPadding={16}>
          <YourBalanceTitle>{t`Your Deposits`}</YourBalanceTitle>
        </YourBalanceContainer>
        <TopAssetItemWrapper>
          <AssetInfoContainer>
            <FlexContainer>
              <Icons>
                {cFarm.isPoolFarm &&
                  cFarm.poolTokens?.map((pt) => (
                    <IconWrapper key={pt.id}>
                      <CryptoIcon symbol={pt.symbol} id={pt.id} />
                    </IconWrapper>
                  ))}

                {!cFarm.isPoolFarm && (
                  <IconWrapper>
                    <CryptoIcon
                      symbol={cFarm.stakeToken.symbol}
                      id={cFarm.stakeToken.id}
                    />
                  </IconWrapper>
                )}
              </Icons>
              <AssetName>
                {cFarm.isPoolFarm ? (
                  <>
                    {farm.pairTokenASymbol}{' '}
                    <VerifiedBadge verifyStatus={tokA?.verificationTier} />
                  </>
                ) : (
                  <>
                    {farm.stakedTokenSymbol}{' '}
                    <VerifiedBadge
                      verifyStatus={stakedToken?.verificationTier}
                    />
                  </>
                )}
                {farm.pairTokenBSymbol ? `/ ${farm.pairTokenBSymbol}` : ''}
                {farm.pairTokenBSymbol && (
                  <VerifiedBadge verifyStatus={tokB?.verificationTier} />
                )}
              </AssetName>
            </FlexContainer>
          </AssetInfoContainer>
          <AssetBalance>{stakedAmt}</AssetBalance>
        </TopAssetItemWrapper>
        <SummaryContainer>
          <YourBalanceContainer>
            <YourBalanceTitle>{t`Your Rewards`}</YourBalanceTitle>
          </YourBalanceContainer>
          {farm.rewardsPerBlock.asDefaultNetworkToken !== '0' && (
            <AssetItemWrapper>
              <AssetInfoContainer>
                <FlexContainer>
                  <CryptoIcon id='' symbol={connector} />
                  <AssetName>
                    ALGO <VerifiedBadge verifyStatus='trusted' />
                  </AssetName>
                </FlexContainer>
              </AssetInfoContainer>
              <AssetBalance>{rewardABalance}</AssetBalance>
            </AssetItemWrapper>
          )}
          {farm.rewardsPerBlock.asRewardToken !== '0' && (
            <AssetItemWrapper>
              <AssetInfoContainer>
                <FlexContainer>
                  <CryptoIcon id='' symbol={farm.pairTokenBSymbol} />
                  <AssetName>
                    {farm.rewardTokenSymbol}
                    <VerifiedBadge
                      verifyStatus={rewardToken?.verificationTier}
                    />
                  </AssetName>
                </FlexContainer>
              </AssetInfoContainer>
              <AssetBalance>{rewardBBalance}</AssetBalance>
            </AssetItemWrapper>
          )}
        </SummaryContainer>
        <ClaimButton
          disabled={!isEnoughBalance || !rewardsSet}
          onClick={onClaim}
        >
          {!isEnoughBalance ? (
            <TooltipWrapper>
              <div className='big-font'>
                <Trans>Not enough ALGO</Trans>
              </div>
              <Tooltip
                position='topLeft'
                message={t`Your account does not have enough ALGO to sign the transactions;
      please add more ALGO so that it is above your wallets minimum balance of ${networkToken?.minBalance} ALGO`}
              />
            </TooltipWrapper>
          ) : (
            <div className='big-font'>
              <Trans>Claim Rewards</Trans>
            </div>
          )}
        </ClaimButton>
      </ClaimRewardsContainer>
    </ModalComponent>
  )
}

export default ClaimRewards
