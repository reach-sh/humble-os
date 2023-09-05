import { Trans } from '@lingui/macro'
import SwapVert from 'assets/Icons/arrow-up-down.svg'
import FlexContainer from 'components/Common/FlexContainer'
import Tooltip from 'components/Common/Tooltip'
import SIZE from 'constants/screenSizes'
import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from 'theme'
import { CellHeading, LimitOrderRateContainer } from './LimitOrders.Containers'

const RateText = styled.h4<{ green?: boolean }>`
  color: ${({ green = false, theme }) =>
    green ? COLORS.darkSage : theme.colors.text};
`
const SwapHorz = styled.img.attrs({
  src: SwapVert,
  width: 18,
  className: 'dark-sage-svg-filter',
})`
  cursor: pointer;
  margin: 0 0.2rem;
  transform: rotate(90deg);
`
const Symbols = styled(FlexContainer)`
  @media screen and (max-width: ${SIZE.md}) {
    padding-right: 1rem;
  }
`
type Props = {
  tokenASymbol: string
  tokenBSymbol: string
  amtA: string
  amtB: string
  favorableMarket?: boolean
}
const LimitOrderRate = (props: Props) => {
  const { tokenASymbol, tokenBSymbol, amtA, amtB, favorableMarket } = props
  const [{ A, B }, setAB] = useState({ A: amtA, B: amtB })
  const [orderAB, setOrderAB] = useState(true)
  const rateMessage = useMemo(
    () =>
      favorableMarket ? 'Can be filled at market rate' : 'Above market rate',
    [favorableMarket],
  )
  const toggleOrder = () => {
    const ordered = orderAB
    setOrderAB(!ordered)
    setAB({ A: ordered ? amtB : amtA, B: ordered ? amtA : amtB })
  }
  const [symbolA, symbolB] = useMemo(
    () =>
      orderAB ? [tokenASymbol, tokenBSymbol] : [tokenBSymbol, tokenASymbol],
    [orderAB],
  )
  const limitRate = useMemo(() => {
    if (B === '0') return '-'
    const r = (Number(A) / Number(B)).toFixed(3)
    return Number(r) === 0 ? '< 0.001' : r
  }, [A, B])

  return (
    <LimitOrderRateContainer>
      <CellHeading>
        <Trans>Order Rate</Trans>
      </CellHeading>

      <Symbols>
        {symbolA}
        <SwapHorz onClick={toggleOrder} />
        {symbolB}
      </Symbols>

      <Tooltip message={rateMessage} alignItems='flex-start' size='medium'>
        <RateText green={favorableMarket}>{limitRate}</RateText>
      </Tooltip>
    </LimitOrderRateContainer>
  )
}
export default LimitOrderRate
