import { currencyDisplaySymbol, getPrice } from 'prices'
import { useMemo } from 'react'
import useGlobalDex from 'hooks/useGlobalDex'
import styled from 'styled-components'
import { useReach } from 'helpers/getReach'
import FlexContainer from '../FlexContainer'

const DisplaySymbol = styled.b`
  opacity: 0.8;
  order: 0;
`
const Value = styled.span`
  margin: 0 ${({ theme }) => theme.sizes.xxs};
  order: 1;
`
const Container = styled(FlexContainer)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  line-height: 14px;

  &.reverse ${DisplaySymbol} {
    order: 10;
  }
`

type Props = {
  tokenAmt?: string | number
  tokenId: string | number
}

export const TokenPrice = styled((props: Props) => {
  const { connector } = useReach()
  const { tokenId, tokenAmt = 1 } = props
  const { prices } = useGlobalDex(['prices'])

  const price = useMemo(
    () => getPrice(tokenId, tokenAmt),
    [tokenId, tokenAmt, prices],
  )

  const displaySymbol = useMemo(
    () => currencyDisplaySymbol(prices.displayUnit),
    [prices],
  )
  if (!price) return <></>

  return (
    <Container className={displaySymbol === connector ? 'reverse' : undefined}>
      <span>≈</span>
      <DisplaySymbol>{displaySymbol}</DisplaySymbol>
      <Value>{price}</Value>
    </Container>
  )
})``

export default TokenPrice
