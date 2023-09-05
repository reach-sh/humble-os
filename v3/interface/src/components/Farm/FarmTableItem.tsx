import { Trans } from '@lingui/macro'
import { useTheme } from 'contexts/theme'
import CryptoIcon from 'components/Common/CryptoIcon'
import Icon from 'components/Common/Icon'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Farm, Pool } from 'types/shared'
import { formatNumberShort } from '@reach-sh/humble-sdk'
import {
  currencyDisplaySymbol,
  currencyDisplayUnit,
  getPoolTVLSort,
  getPrice,
} from 'prices'
import { NETWORK_TOKEN_DEFAULT_ID } from 'constants/reach_constants'
import { useReach } from 'helpers/getReach'
import { getBalanceOfToken } from 'reach/api/staker'
import { condenseFarm } from 'utils/farm'
import FarmROICalculator from 'components/ROICalculator'
import WalletIcon from 'assets/Icons/wallet.svg'
import WalletDarkIcon from 'assets/Icons/wallet-dark.svg'
import useGlobalDex from 'hooks/useGlobalDex'
import { formatCurrencyShort, truncateNum } from 'reach/utils'
import CalculatorIcon from 'assets/Icons/calculator.svg'
import CalculatorDarkIcon from 'assets/Icons/calculator-dark.svg'
import HumblePartnerCheckIcon from 'assets/Icons/humble-partner-check.svg'
import Tooltip from 'components/Common/Tooltip'
import useIsMounted from 'hooks/useIsMounted'
import FlexContainer from 'components/Common/FlexContainer'
import { getFarmPoolTokens } from 'helpers/farm'
import { getFarmById } from 'utils/getServerResource'
import { fromNow } from 'utils/date'
import FarmItemDropdown from './FarmItemDropdown'
import ItemDetails from './ItemDetails'
import SymbolAndBadge from './SymbolAndBadge'
import apr from './apr'
import {
  APRDetails,
  BalanceIcon,
  BalanceInfo,
  BalanceContainer,
  CalcIcon,
  CheckIcon,
  EndsInNDays,
  ExpandButtonCell,
  FarmItemContents,
  FarmItemWrapper,
  HiddenTitle,
  Icons,
  IconsAndName,
  IconWrapper,
  PairName,
  PartnerCheckDiv,
  Span,
  TotalReward,
  TotalStaked,
  TVLPrice,
} from './FarmTableItem.Containers'

const FarmTableItem = ({
  farm,
  isPartnerFarm,
}: {
  farm: Farm
  isPartnerFarm: boolean
}) => {
  const { connector } = useReach()
  const [expanded, setExpanded] = useState(false)
  const [userTokenBalance, setUserTokenBalance] = useState<number | string>(0)
  const cFarm = condenseFarm(farm)
  const { isPoolFarm, stakeToken } = cFarm
  const unit = currencyDisplaySymbol(currencyDisplayUnit())
  const [showCalculator, setShowCalculator] = useState(false)
  const [dateDetails, setDateDetails] = useState({ start: '', end: '' })
  const { pools, prices, tokenList } = useGlobalDex([
    'pools',
    'prices',
    'tokenList',
  ])
  const isMounted = useIsMounted()
  const [tokA, tokB] = useMemo(
    () => getFarmPoolTokens(farm, pools),
    [farm, tokenList, pools],
  )

  useEffect(() => {
    if (!farm) return

    const getUserTokenBalance = async () => {
      const updatedToken = await getBalanceOfToken(farm.stakedTokenId)
      if (isMounted()) {
        setUserTokenBalance(updatedToken)
      }
    }

    const getFarm = async () => {
      const { data } = await getFarmById(farm.contractId)
      if (isMounted()) {
        setDateDetails({
          end: data?.endDate || '',
          start: data?.startDate || '',
        })
      }
    }

    getUserTokenBalance()
    getFarm()
  }, [farm])

  const rewardTokenPerBlock1 = Number(
    farm.rewardsPerBlock.asDefaultNetworkToken,
  )
  const valuePerRewardToken1 = Number(getPrice(NETWORK_TOKEN_DEFAULT_ID, 1))
  const [rewardTokenPerBlock2, valuePerRewardToken2, totalStaked] = useMemo(
    () => [
      Number(farm.rewardsPerBlock.asRewardToken),
      Number(getPrice(farm.rewardTokenId, 1000)) / 1000,
      Number(farm.totalStaked),
    ],
    [farm, pools, prices],
  )

  const stakedTokenPool = useMemo(
    () =>
      pools.find(
        ({ poolAddr }: Pool) => `${poolAddr}` === `${farm.stakedTokenPoolId}`,
      ),
    [farm, pools],
  )

  const stakedTokenUnitPrice = useMemo(() => {
    if (farm.stakedTokenPoolId === undefined) {
      const price = Number(getPrice(farm.stakedTokenId, 1, true))
      return price
    }
    if (!stakedTokenPool) return null
    const { stakedTokenTotalSupply, primaryStakeTokenBalance } = farm
    const poolTvl = getPoolTVLSort(stakedTokenPool)
    // Subtract amount of total supply from largest account holder to see
    // how many tokens are in circulation. Divide by poolTVL to get price.
    const subBalance =
      Number(stakedTokenTotalSupply) - Number(primaryStakeTokenBalance)
    return subBalance ? poolTvl / subBalance : null
  }, [pools, farm, prices])

  const tvlPrice = useMemo(() => {
    if (stakedTokenUnitPrice !== null) {
      const prod = (stakedTokenUnitPrice * totalStaked).toString()
      return `≈${unit} ${truncateNum(prod)}`
    }
    return `≈${unit} -`
  }, [farm, stakedTokenUnitPrice])

  const getDaysToEnd = useCallback(
    (f: Farm) => {
      if (f.startBlock !== '0')
        return `Starts: in ${
          dateDetails.start ? fromNow(dateDetails.start) : f.startBlock
        }`
      return f.endBlock === '0'
        ? 'Ended'
        : `Ends: in ${dateDetails.end ? fromNow(dateDetails.end) : f.endBlock}`
    },
    [dateDetails],
  )

  const [totalRewards, daysToEndFarm] = useMemo(() => {
    const rwToken = farm.rewardTokenSymbol
    const nRewards = formatCurrencyShort(Number(farm.remainingRewardA))
    const nnRewards = formatCurrencyShort(Number(farm.remainingRewardB))
    const rwLabel = `${nnRewards} ${rwToken}`
    const nLabel = `${nRewards} ${connector}`
    const tot = nRewards !== '0' ? `${nLabel} / ${rwLabel}` : `${rwLabel}`
    return [tot, getDaysToEnd(farm)]
  }, [farm, getDaysToEnd])

  const totalRewardValue = useMemo(() => {
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
    const total = Number(rewardTotal) + Number(defaultTotal)
    return total === 0 ? totalRewards : `${formatNumberShort(total, 5)} ${unit}`
  }, [farm, prices])

  const aprValue =
    valuePerRewardToken2 !== 0 && totalStaked !== 0
      ? apr(
          rewardTokenPerBlock1,
          valuePerRewardToken1,
          rewardTokenPerBlock2,
          valuePerRewardToken2,
          totalStaked,
          stakedTokenUnitPrice || 0,
        )
      : null

  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const darkOrLightIcon = isDarkMode ? WalletDarkIcon : WalletIcon
  const farmItemTestId =
    farm.pairTokenAId === ''
      ? `farm-item-${farm.stakedTokenSymbol}`
      : `farm-item-${farm.pairTokenASymbol}-${farm.pairTokenBSymbol}`

  const [friendlyBalance, showBalance] = useMemo(() => {
    const shouldShow = Boolean(tokA && tokB) && userTokenBalance > 0
    const [{ symbol: a }, { symbol: b }] = [tokA || {}, tokB || {}]
    const fBal = `${userTokenBalance} ${a}${b ? `/${b}` : ''}`
    return [fBal, shouldShow]
  }, [userTokenBalance, tokA, tokB])

  const renderTitleIcons = () => {
    if (!tokA && !tokB)
      return (
        <IconWrapper>
          <CryptoIcon symbol={stakeToken.symbol} id={stakeToken.id} />
        </IconWrapper>
      )

    return [tokA, tokB].map((t) => (
      <IconWrapper key={t.id}>
        <CryptoIcon size={24} symbol={t.symbol} id={t.id} />
      </IconWrapper>
    ))
  }
  const renderTitleText = () => (
    <SymbolAndBadge
      tokenAId={`${tokA?.id}` || farm.stakedTokenId}
      tokenBId={`${tokB?.id}`}
    />
  )

  const renderAPRDetails = () => (
    <>
      <HiddenTitle>APR</HiddenTitle>
      {aprValue === null ? (
        '-'
      ) : (
        <FlexContainer>
          {formatNumberShort(aprValue.toFixed(2))} %
          {daysToEndFarm !== 'Ended' && (
            <CalcIcon
              src={isDarkMode ? CalculatorDarkIcon : CalculatorIcon}
              alt='calculator icon'
              onClick={() => setShowCalculator(true)}
            />
          )}
        </FlexContainer>
      )}
    </>
  )

  return (
    <FarmItemWrapper
      data-testid='farm-item'
      isStakedFarm={farm.stakedTokenAmt !== '0'}
    >
      <FarmItemContents data-testid={farmItemTestId}>
        <IconsAndName>
          <Icons>{renderTitleIcons()}</Icons>
          <PairName bold data-testid={`${farmItemTestId}-name`}>
            {isPartnerFarm ? (
              <PartnerCheckDiv>
                {renderTitleText()}
                <Tooltip message='Created by Humble partner'>
                  <CheckIcon src={HumblePartnerCheckIcon} />
                </Tooltip>
              </PartnerCheckDiv>
            ) : (
              renderTitleText()
            )}
          </PairName>
        </IconsAndName>

        <EndsInNDays
          style={expanded ? { display: 'block' } : {}}
          data-testid={`${farmItemTestId}-ends-or-starts`}
        >
          {daysToEndFarm}
        </EndsInNDays>

        {/* Total reward */}
        <TotalReward>
          <Tooltip message={totalRewards}>
            <ItemDetails>{totalRewardValue}</ItemDetails>
          </Tooltip>
        </TotalReward>

        {/* Balance */}
        <BalanceContainer>
          {showBalance && (
            <Tooltip message={friendlyBalance}>
              <BalanceInfo dark={isDarkMode}>
                <BalanceIcon src={darkOrLightIcon} />
                <Span fontSize={12} fontWeight={400}>
                  <Trans>Balance</Trans>
                </Span>
              </BalanceInfo>
            </Tooltip>
          )}
        </BalanceContainer>

        {/* APR */}
        <APRDetails>{renderAPRDetails()}</APRDetails>

        {/* TVL */}
        <TotalStaked data-testid={`${farmItemTestId}-total-staked`}>
          <HiddenTitle>TVL</HiddenTitle>
          {truncateNum(totalStaked.toString())}
        </TotalStaked>
        {tvlPrice && <TVLPrice>{tvlPrice}</TVLPrice>}

        {/* Expand Button */}
        <ExpandButtonCell
          data-testid='farm-item-dropdown-icon'
          onClick={() => setExpanded(!expanded)}
        >
          <Icon iconType={`keyboard_arrow_${expanded ? 'up' : 'down'}`} />
        </ExpandButtonCell>
      </FarmItemContents>

      {expanded && (
        <FarmItemDropdown
          contractId={farm.contractId}
          isPoolFarm={isPoolFarm}
          connector={connector}
          farm={farm}
        />
      )}

      {showCalculator && (
        <FarmROICalculator
          farm={farm}
          balance={userTokenBalance}
          onClose={() => setShowCalculator(false)}
          open={showCalculator}
        />
      )}
    </FarmItemWrapper>
  )
}

export default FarmTableItem
