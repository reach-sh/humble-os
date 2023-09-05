import { useMemo } from 'react'
import { t, Trans } from '@lingui/macro'
import styled from 'styled-components'
import { LimitOrderCore } from 'types/shared'
import FlexContainer from 'components/Common/FlexContainer'
import { getValueWithMaxDecimals } from 'utils/input'
import { defaultDecimals } from 'helpers/getReach'
import { COLORS } from 'theme'
import { HUMBLE_SWAP_EXCHANGE_RATE } from 'constants/links'
import { formatUnsafeInt } from 'reach/utils'
import Tooltip from './Tooltip'
import ArrowFromTo from './Icons/arrow-from-to'

const PriceCard = styled(FlexContainer).attrs({ rounded: true })`
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
  *::selection {
    background-color: transparent;
  }
`
const PriceCardValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
  margin-top: 15px;
  text-align: right;
  flex-grow: 1;

  > div:last-of-type {
    font-size: 12px;
    font-weight: bold;
    line-height: 14px;
    color: ${COLORS.darkSage};
  }
`

const LimitRatePriceCardValue = styled(PriceCardValue)`
  margin: 0;
  > div:last-of-type {
    font-weight: 400;
    color: ${({ theme }) => theme.colors.text};
  }
`

type RateDelta = 'positive' | 'negative' | 'neutral'
const rateTextColor = (dt: RateDelta) => {
  if (dt === 'neutral') return COLORS.midGray
  return dt === 'negative' ? COLORS.darkSage : COLORS.orange
}

const LimitRate = styled(LimitRatePriceCardValue)<{ delta: RateDelta }>`
  text-align: left;
  > div:last-of-type {
    color: ${({ delta }) => rateTextColor(delta)};
  }
`

// B-to-A, A-to-B conversions
export const getConversions = ({
  tokA,
  tokB,
  amtA,
  amtB,
  feeFactor = 1,
}: LimitOrderCore & { feeFactor?: number }) => [
  {
    primaryToken: tokA?.symbol,
    secondaryToken: tokB?.symbol,
    secondaryTokenConversion: getValueWithMaxDecimals(
      ((amtB / amtA) * feeFactor).toString(),
      defaultDecimals(tokB?.decimals),
    ),
  },
  {
    primaryToken: tokB?.symbol,
    secondaryToken: tokA?.symbol,
    secondaryTokenConversion: getValueWithMaxDecimals(
      ((amtA / amtB) * feeFactor).toString(),
      defaultDecimals(tokA?.decimals),
    ),
  },
]

const ExchangeRate = ({ tokA, tokB, amtA, amtB }: LimitOrderCore) => {
  const conversions = getConversions({ tokA, tokB, amtA, amtB })

  return (
    <PriceCard className='slide-down-fade-in'>
      <Trans>
        Exchange Rate
        <Tooltip
          message={t`The current market face value of the asset.`}
          linkMessage={t`Learn more about exchange rate.`}
          link={HUMBLE_SWAP_EXCHANGE_RATE}
        />
      </Trans>
      <PriceCardValue>
        {conversions.map((data, index) => (
          <div key={index}>
            <span>{'1 '}</span>
            <b>{` ${data.primaryToken} `}</b>
            <span> ≈ {`${data.secondaryTokenConversion} `}</span>
            <b>{`${data.secondaryToken} `}</b>
          </div>
        ))}
      </PriceCardValue>
    </PriceCard>
  )
}

export default ExchangeRate

export const ExchangeRateLimitOrder = ({
  tokA,
  tokB,
  amtA,
  amtB,
  delta,
}: LimitOrderCore) => {
  const conversions = getConversions({ tokA, tokB, amtA, amtB })
  const [rateDelta, arrowFromToClass, deltaValue] = useMemo((): [
    RateDelta,
    string,
    string,
  ] => {
    if (!delta) return ['neutral', 'rotate', '--']

    let rateDt: RateDelta = 'neutral'
    const rDelta = Math.round(Number(delta))
    if (rDelta !== 0) rateDt = rDelta > 0 ? 'positive' : 'negative'
    return [
      rateDt,
      rDelta > 0 ? 'rotate' : 'rotate-reverse',
      rateDt === 'neutral' ? '-.-' : `${formatUnsafeInt(delta, 3)}%`,
    ]
  }, [delta])

  return (
    <FlexContainer>
      <LimitRate delta={rateDelta}>
        <div>
          <Trans>Limit Rate</Trans>
        </div>

        <FlexContainer>
          <span>{deltaValue}</span>
          {rateDelta !== 'neutral' && (
            <ArrowFromTo className={arrowFromToClass} />
          )}
        </FlexContainer>
      </LimitRate>
      <LimitRatePriceCardValue>
        {conversions.map((data, index) => (
          <div key={index}>
            <span>{'1 '}</span>
            <span>{` ${data.primaryToken} `}</span>
            <span> ≈ {`${data.secondaryTokenConversion} `}</span>
            <span>{`${data.secondaryToken} `}</span>
          </div>
        ))}
      </LimitRatePriceCardValue>
    </FlexContainer>
  )
}
