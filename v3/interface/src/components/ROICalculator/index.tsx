import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { Farm, Pool } from 'types/shared'
import { getValueWithMaxDecimals } from 'utils/input'
import { getCurrentNetwork } from 'helpers/getReach'
import { NETWORKS, NETWORK_TOKEN_DEFAULT_ID } from 'constants/reach_constants'
import { FlexColumnContainer } from 'components/Common/FlexContainer'
import ModalComponent from 'components/Modals/ModalComponent'
import ArrowIcon from 'components/Common/Icons/arrow'
import calcFarmRewards, { calcPoolRewards } from 'helpers/calc'
import { getTokenById } from 'helpers/pool'
import { convertLPAmountToTokenAmounts, getPrice } from 'prices'
import PeriodSelector from './PeriodSelector'
import AmountSelector from './AmountSelector'
import { AmountBox, RewardsBox, DetailsBox } from './Boxes'

const ModalContent = styled(FlexColumnContainer)`
  padding: 12px 48px 36px;
`

const Subtitle = styled.div`
  color: ${({ theme }) => theme.colors.textAlt2};
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
  margin-top: 10px;
`

const ArrowContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  margin-top: 30px;
`
interface BaseCalculatorProps {
  onClose: () => void
  open: boolean
}

interface FarmROICalculatorProps extends BaseCalculatorProps {
  farm: Farm
  balance: string | number
}

interface PoolROICalculatorProps extends BaseCalculatorProps {
  pool: Pool
}

export const PoolROICalculator = ({
  pool,
  onClose,
  open,
}: PoolROICalculatorProps) => {
  const { apr, tokAId, tokBId, poolTokenId } = pool

  const poolTok = getTokenById(poolTokenId)
  const liquidityAmount = poolTok?.balance || 0

  const [amount, setAmount] = useState(
    liquidityAmount ? liquidityAmount.toString() : '',
  )

  const [amountTokA, amountTokB] = useMemo(
    () => convertLPAmountToTokenAmounts(amount, pool),
    [amount, pool],
  )

  // NOTE: tuple of reward amount / reward amount in user's default currency
  const [rewardA, setRewardA] = useState(['', ''])
  const [rewardB, setRewardB] = useState(['', ''])

  const [periodSelected, setPeriodSelected] = useState(1)

  useEffect(() => {
    const rewardsNetworkTok = calcPoolRewards(
      amountTokA,
      periodSelected,
      apr || 0,
    )
    setRewardA([
      getValueWithMaxDecimals(rewardsNetworkTok.toString()),
      getPrice(tokAId, rewardsNetworkTok).toString(),
    ])

    const rewards2 = calcPoolRewards(amountTokB, periodSelected, apr || 0)

    setRewardB([
      getValueWithMaxDecimals(rewards2.toString()),
      getPrice(tokBId, rewards2).toString(),
    ])
  }, [amount, periodSelected])

  const tokA = getTokenById(tokAId)
  const tokB = getTokenById(tokBId)
  const symbol = `${tokA?.symbol}/${tokB?.symbol}`

  return (
    <ModalComponent
      modalTitle={t`ROI Calculator`}
      onClose={onClose}
      open={open}
      sticky={false}
      width={420}
    >
      <ModalContent>
        <Subtitle>{`${tokA?.symbol}/${tokB?.symbol} Pool Tokens`}</Subtitle>
        <AmountBox
          amount={amount}
          onInputChange={(e) => setAmount(e.target.value)}
          symbol={symbol}
        />
        <AmountSelector
          balance={Number(liquidityAmount || 0)}
          onSelect={(p) => setAmount(p.toString())}
          selected={Number(amount)}
        />
        <Subtitle>{t`Staked for`}</Subtitle>
        <PeriodSelector
          farmEndDate='1000 (days)'
          onChange={(p) => setPeriodSelected(p)}
          value={periodSelected}
        />
        {amount && Number(amount) !== 0 && periodSelected !== 0 && (
          <>
            <ArrowContainer>
              <ArrowIcon />
            </ArrowContainer>
            <Subtitle>{t`ROI AT Current Rates`}</Subtitle>
            <RewardsBox
              rewards={[rewardA, rewardB]}
              symbols={[tokA?.symbol || '', tokB?.symbol || '']}
            />
          </>
        )}
      </ModalContent>
    </ModalComponent>
  )
}

const FarmROICalculator = ({
  balance,
  farm,
  onClose,
  open,
}: FarmROICalculatorProps) => {
  const {
    endBlock,
    rewardTokenSymbol,
    rewardTokenId,
    stakedTokenSymbol,
    pairTokenASymbol,
    pairTokenBSymbol,
  } = farm
  const connector = getCurrentNetwork()
  const netw = NETWORKS[connector]
  const [amount, setAmount] = useState(
    balance && balance !== '0' ? String(balance) : '',
  )

  // NOTE: tuple of reward amount / reward amount in user's default currency
  const [rewardNetwTok, setRewardNetwTok] = useState(['', ''])
  const [rewardTok, setRewardTok] = useState(['', ''])

  const [periodSelected, setPeriodSelected] = useState(1)

  useEffect(() => {
    const calculatedRewardsNetworkTok = calcFarmRewards(
      periodSelected,
      farm.rewardsPerBlock.asDefaultNetworkToken,
      amount,
      farm.totalStaked,
    )
    const calculatedRewardTok = calcFarmRewards(
      periodSelected,
      farm.rewardsPerBlock.asRewardToken,
      amount,
      farm.totalStaked,
    )

    setRewardNetwTok([
      getValueWithMaxDecimals(calculatedRewardsNetworkTok.toString()),
      getPrice(
        NETWORK_TOKEN_DEFAULT_ID,
        calculatedRewardsNetworkTok,
      ).toString(),
    ])
    setRewardTok([
      getValueWithMaxDecimals(
        calculatedRewardTok.toString(),
        farm.rewardTokenDecimals,
      ),
      getPrice(rewardTokenId, calculatedRewardTok, true).toString(),
    ])
  }, [amount, periodSelected, rewardTokenId])

  const tokenLabel = pairTokenBSymbol ? t`Pool Tokens` : t`Token`
  const symbol =
    pairTokenASymbol && pairTokenBSymbol
      ? `${pairTokenASymbol}/${pairTokenBSymbol}`
      : stakedTokenSymbol
  return (
    <ModalComponent
      modalTitle={t`ROI Calculator`}
      onClose={onClose}
      open={open}
      sticky={false}
      width={420}
    >
      <ModalContent>
        <Subtitle>{`${pairTokenASymbol}${
          pairTokenBSymbol ? `/${pairTokenBSymbol}` : ''
        } ${tokenLabel}`}</Subtitle>
        <AmountBox
          amount={amount}
          onInputChange={(e) => setAmount(e.target.value)}
          symbol={symbol}
        />
        <AmountSelector
          balance={Number(balance)}
          onSelect={(p) => setAmount(p.toString())}
          selected={Number(amount)}
          showFarmTooltip
        />
        <Subtitle>{t`Staked for`}</Subtitle>
        <PeriodSelector
          farmEndDate={endBlock}
          onChange={(p) => setPeriodSelected(p)}
          value={periodSelected}
        />
        {amount && Number(amount) !== 0 && periodSelected !== 0 && (
          <>
            <ArrowContainer>
              <ArrowIcon />
            </ArrowContainer>
            <Subtitle>{t`ROI AT Current Rates`}</Subtitle>
            <RewardsBox
              rewards={[rewardNetwTok, rewardTok]}
              symbols={[netw.abbr, rewardTokenSymbol]}
            />
            <DetailsBox />
          </>
        )}
      </ModalContent>
    </ModalComponent>
  )
}

export default FarmROICalculator
