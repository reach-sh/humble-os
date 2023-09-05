import CryptoIcon from 'components/Common/CryptoIcon'
import Tooltip from 'components/Common/Tooltip'
import SymbolAndBadge from 'components/Farm/SymbolAndBadge'
import { useIsMobile } from 'hooks/useScreenSize'
import { currencyDisplaySymbol, currencyDisplayUnit, getPrice } from 'prices'
import { formatUnsafeInt } from 'reach/utils'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Token } from 'types/shared'
import {
  LimitOrderTokenAmount,
  LimitOrderTokenContainer,
  LimitOrderTokenPrice,
} from './LimitOrders.Containers'

export type LimitOrderTokenProps = {
  id: string
  amount: string
  side?: 'buy' | 'sell'
} & Pick<Token, 'symbol'>

const IconText = styled(SymbolAndBadge)`
  grid-area: icon;
`

const LimitOrderToken = (opts: LimitOrderTokenProps) => {
  const isMobile = useIsMobile()
  const { id, symbol, amount, side = 'buy' } = opts
  const [tm, setLocalTimeout] = useState<number>(-1)
  const [price, setPrice] = useState(getPrice(id, Number(amount)))
  const currency = currencyDisplaySymbol(currencyDisplayUnit())
  const nullify = (v: string) => (v === '0' ? '??' : v)
  const clearUpdate = () => {
    if (tm > -1) window.clearTimeout(tm)
  }
  const doUpdate = () => {
    clearUpdate()
    setPrice(getPrice(id, Number(amount)))
    setLocalTimeout(window.setTimeout(doUpdate, 3500))
  }

  useEffect(() => {
    doUpdate()
    return clearUpdate
  }, [])

  return (
    <LimitOrderTokenContainer side={side}>
      {isMobile && <span>You {side}</span>}
      <CryptoIcon id={id} color size={18} symbol={symbol} />
      <IconText tokenAId={id} />

      {/* Purchased or sold amount */}
      <LimitOrderTokenAmount>
        <Tooltip
          message={`${amount} ${symbol}`}
          alignItems='flex-start'
          size='medium'
        >
          <h4>{formatUnsafeInt(amount)}</h4>
        </Tooltip>
      </LimitOrderTokenAmount>

      {/* Token Price (user currency) */}
      <LimitOrderTokenPrice>
        {`≈${nullify(formatUnsafeInt(`${price}`, 4))} ${currency}`}
      </LimitOrderTokenPrice>
    </LimitOrderTokenContainer>
  )
}

export default LimitOrderToken
