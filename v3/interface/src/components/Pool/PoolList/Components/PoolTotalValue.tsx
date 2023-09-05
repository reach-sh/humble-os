import { getBlockchain } from '@reach-sh/humble-sdk'
import FlexContainer from 'components/Common/FlexContainer'
import { currencyDisplaySymbol, getPoolTVL, tokenBalancesFull } from 'prices'
import { useMemo } from 'react'
import styled from 'styled-components'
import { Pool, PoolCore } from 'types/shared'
import Tooltip from 'components/Common/Tooltip'
import useGlobalDex from 'hooks/useGlobalDex'

const DisplaySymbol = styled.b`
  opacity: 0.8;
  order: 0;
`

export const Value = styled.div`
  cursor: pointer;
  margin: 0 ${({ theme }) => theme.sizes.xxs};
  order: 1;
  font-size: 12px;
  .border-bottom {
    border-bottom: 1px dotted ${({ theme }) => theme.colors.accent};
  }

  &.reverse ${DisplaySymbol} {
    order: 10;
  }
`
const Container = styled(FlexContainer)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  line-height: 14px;
`

type Props = PoolCore & Pick<Pool, 'poolAddr' | 'lastUpdated'>

const PoolTotalValue = function _PoolTotalValue(props: Props) {
  const { poolAddr, tokABalance, tokBBalance, lastUpdated } = props
  const connector = getBlockchain()
  const { prices } = useGlobalDex(['prices'])
  const [tvl, displaySymbol] = useMemo(
    () => [getPoolTVL(props), currencyDisplaySymbol(prices.displayUnit)],
    [poolAddr, tokABalance, tokBBalance, lastUpdated, prices],
  )

  return (
    <Container className={displaySymbol === connector ? 'reverse' : undefined}>
      <Value>
        <Tooltip message={tokenBalancesFull(props)}>
          <span className='border-bottom'>{tvl}</span>
        </Tooltip>
      </Value>
    </Container>
  )
}

export default PoolTotalValue
