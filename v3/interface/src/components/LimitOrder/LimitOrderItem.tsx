import { useMemo } from 'react'
import styled from 'styled-components'
import { calculateOtherAmount } from '@reach-sh/humble-sdk'
import { HSLimitOrder } from 'types/response'
import { LimitOrderAction } from 'types/shared'
import { getPoolForTokens, getTokenById } from 'helpers/pool'
import { MODAL, GlobalModal } from 'state/reducers/modals'
import { DexInstance, GlobalDex } from 'state/reducers/dex'
import { formatPoolForSDK } from 'reach/api/trader'
import { ListOrderItemContainer } from './LimitOrders.Containers'
import LimitOrderToken from './LimitOrderToken'
import LimitOrderStatusView from './LimitOrderStatusView'
import LimitOrderRate from './LimitOrderRate'
import LimitOrderItemMenu from './LimitOrderItemMenu'

const ItemContainer = styled(ListOrderItemContainer)`
  background-color: ${({ theme }) => theme.colors.lighterBackground};
  margin-bottom: 1rem;
`

export const LimitOrderItem = (props: HSLimitOrder) => {
  const { pools } = GlobalDex.getState()
  const { tokenA, tokenB, amtA, amtB, status } = props
  const [tokA, tokB, pool] = useMemo(
    () => [
      getTokenById(tokenA || '0'),
      getTokenById(tokenB || '0'),
      getPoolForTokens(tokenA || '0', tokenB || '0', pools),
    ],
    [tokenA, tokenB],
  )
  /** prevent fill when market rate is less than or matches expected-out */
  const unfavorableMarket = useMemo(() => {
    if (!pool) return true
    const sdkPool = formatPoolForSDK(pool)
    if (!sdkPool) return true
    const mktOut = calculateOtherAmount(Number(amtA), tokenA || '0', sdkPool)
    return Number(mktOut) <= Number(amtB)
  }, [pool])
  /** Select an order and make details globally available to app */
  const globalSetOrderDetails = (s: LimitOrderAction) => {
    const selectedLimitOrderInfo = { ...props, tokA, tokB }
    const $pageElem = document.getElementById('root')
    const updates: Partial<DexInstance> = { selectedLimitOrderInfo }
    updates.selectedLimitOrderAction = s

    switch (s) {
      // Cancel order
      case 'fill':
      case 'close':
        GlobalDex.multiple(updates)
        GlobalModal.active(MODAL.ORDER_DETAILS)
        break

      // Reopen order
      case 'copy':
      case 're-open':
        updates.tokenAId = tokenA || '0'
        updates.tokenBId = tokenB || '0'
        updates.reopenOrder = true
        GlobalDex.multiple(updates)

        // Scroll form into view
        $pageElem?.scrollIntoView()
        break

      default:
        break
    }
  }

  if (!tokA || !tokB || !amtA || !amtB) return <></>

  return (
    <ItemContainer data-testid={`order-${tokA.symbol}-${tokB.symbol}`}>
      <LimitOrderToken
        side='sell'
        amount={amtA}
        id={tokA.id}
        symbol={tokA.symbol}
      />

      <LimitOrderToken
        side='buy'
        amount={amtB}
        id={tokB.id}
        symbol={tokB.symbol}
      />

      <LimitOrderRate
        favorableMarket={!unfavorableMarket}
        tokenASymbol={tokA.symbol}
        tokenBSymbol={tokB.symbol}
        amtA={amtA}
        amtB={amtB}
      />
      <LimitOrderStatusView status={status} />
      <LimitOrderItemMenu
        disableFill={unfavorableMarket}
        status={status}
        onActionSelect={globalSetOrderDetails}
      />
    </ItemContainer>
  )
}

export default LimitOrderItem
