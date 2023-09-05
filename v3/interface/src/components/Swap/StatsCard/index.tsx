import { useMemo } from 'react'
import { t } from '@lingui/macro'
import { FlexColumnContainer } from 'components/Common/FlexContainer'
import styled from 'styled-components'
import { SwapInfo, Token } from 'types/shared'
import useGlobalDex from 'hooks/useGlobalDex'
import { minimumReceived } from 'reach/utils'
import { defaultDecimals } from 'helpers/getReach'
import { getValueWithMaxDecimals } from 'utils/input'
import { getPoolForTokens } from 'helpers/pool'
import { HUMBLE_SWAP_MINIMUM_RECEIVED, HUMBLE_SWAP_FEES } from 'constants/links'
import { TOTAL_FEE_FLOAT } from 'constants/reach_constants'
import { getPoolTVL } from 'prices'
import useGlobalUser from 'hooks/useGlobalUser'
import StatRow from './StatRow'
import WarningCard from './WarningCard'

const StatsCardContainer = styled(FlexColumnContainer)``

const StatsCard = ({ amtA, amtB, tokB, tokA }: SwapInfo) => {
  const { slippageTolerance } = useGlobalUser()
  const { pools } = useGlobalDex(['pools'])
  const liquidityProviderFee = getValueWithMaxDecimals(
    (Number(amtA) * TOTAL_FEE_FLOAT).toString(),
    defaultDecimals(tokA?.decimals),
  )
  const minReceived = getValueWithMaxDecimals(
    minimumReceived(amtB).toString(),
    defaultDecimals(tokB?.decimals),
  )
  const priceImpact = useMemo(() => {
    const fmtAmtA = Number(amtA)
    const pool = getPoolForTokens(tokA?.id, tokB?.id, pools)
    const bal = (pt: Token | undefined) => {
      if (!pool || !pt) return 0
      return pool.tokAId === pt.id ? pool.tokABalance : pool.tokBBalance
    }
    const idealAmtOut = bal(tokA) !== 0 ? (bal(tokB) / bal(tokA)) * fmtAmtA : 0
    const amtOutWithPriceImpact =
      bal(tokA) + fmtAmtA !== 0
        ? bal(tokB) - (bal(tokA) / (bal(tokA) + fmtAmtA)) * bal(tokB)
        : 0
    const impct = (idealAmtOut / amtOutWithPriceImpact - 1) * 100
    return impct.toFixed(2)
  }, [pools])
  const calculateLiquidityAmountInPool = () => {
    const pool = getPoolForTokens(tokA?.id, tokB?.id, pools)
    if (!pool) return 0
    const { tokABalance, tokBBalance, tokAId } = pool
    const getBalanceFor = (token?: Token): string =>
      token?.id.toString() === tokAId.toString()
        ? tokABalance.toFixed(2)
        : tokBBalance.toFixed(2)

    return {
      value: `
        ${getBalanceFor(tokA)} 
        ${tokA?.symbol.toUpperCase()} 
        / 
        ${getBalanceFor(tokB)} 
        ${tokB?.symbol.toUpperCase()}
      `,
      tvl: getPoolTVL(pool),
    }
  }
  const liquidityAmount = calculateLiquidityAmountInPool()

  return (
    <StatsCardContainer rounded>
      <StatRow
        name={t`Swap fee`}
        tooltip={t`0.25% of swap will be paid to Liquidity Providers.`}
        tooltipLink={t`Learn more about liquidity providing.`}
        link={HUMBLE_SWAP_FEES}
        value={`${liquidityProviderFee} `}
        symbol={tokA?.symbol.toUpperCase()}
      />

      <StatRow
        name={t`Minimum received`}
        tooltip={t`The least amount of tokens you will receive based on your slippage
        tolerance.`}
        tooltipLink={t`Learn more about the minimum received.`}
        link={HUMBLE_SWAP_MINIMUM_RECEIVED}
        value={minReceived}
        symbol={tokB?.symbol.toUpperCase()}
      />

      {liquidityAmount && (
        <StatRow
          name={t`Pool Liquidity`}
          tooltip={t`The balance of this pair in the pool at the moment.`}
          value={liquidityAmount.value}
          tvl={liquidityAmount.tvl}
        />
      )}

      <WarningCard
        priceImpact={priceImpact}
        slippageTolerance={slippageTolerance}
      />
    </StatsCardContainer>
  )
}

export default StatsCard
