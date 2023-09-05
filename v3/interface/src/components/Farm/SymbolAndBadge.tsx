import FlexContainer from 'components/Common/FlexContainer'
import VerifiedBadge from 'components/Common/VerifiedBadge'
import { getTokenById } from 'helpers/pool'
import { useMemo } from 'react'
import styled from 'styled-components'
import { Token } from 'types/shared'

export const Container = styled(FlexContainer)`
  font-size: 0.8rem;
  gap: 4px;
`

type SymbolAndBadgeProps = {
  tokenAId: string
  tokenBId?: string
}

export const SymbolAndBadge = (props: SymbolAndBadgeProps) => {
  const { tokenAId, tokenBId } = props
  const [tokenA, tokenB] = useMemo(
    () => [getTokenById(tokenAId), tokenBId && getTokenById(tokenBId)],
    [tokenAId, tokenBId],
  )

  const make = ({ symbol, verificationTier }: Token, i = -1) => (
    <Container key={i >= 0 ? `${i}-${symbol}` : undefined}>
      <span>{symbol}</span>
      <VerifiedBadge verifyStatus={verificationTier} />
      {i === 0 && <span>/&nbsp;</span>}
    </Container>
  )

  if (tokenA && !tokenB) return make(tokenA)
  if (tokenB && !tokenA) return make(tokenB)
  if (tokenA && tokenB) return <>{[tokenA, tokenB].map(make)}</>
  return <></>
}

export default SymbolAndBadge
