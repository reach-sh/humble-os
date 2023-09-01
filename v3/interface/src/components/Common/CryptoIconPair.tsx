import styled from 'styled-components'
import { IconWrapper } from 'components/Common/Icon'
import CryptoIcon from 'components/Common/CryptoIcon'
import SIZE from 'constants/screenSizes'
import SymbolAndBadge from 'components/Farm/SymbolAndBadge'
import { GridContainer } from './FlexContainer'

const Container = styled(GridContainer)`
  gap: 0.25rem;
  grid-column: 1 / 2;
  grid-template-columns: 40px repeat(2, auto);
  place-content: start;
  margin: 0 4px 0 0;

  ${IconWrapper} img:last-of-type {
    margin-left: -0.15rem;
  }

  @media (max-width: ${SIZE.sm}) {
    grid-column: 1;
    grid-row: 1;
  }
`

const Text = styled(SymbolAndBadge)`
  margin-left: 1rem;
`

type CryptoIconPairProps = {
  firstTokId?: string
  firstTokSymbol?: string
  secondTokId?: string
  secondTokSymbol?: string
  showText?: boolean
  size?: number
}

/** A pair of tokens  */
const CryptoIconPair = styled((props: CryptoIconPairProps) => {
  const {
    size,
    firstTokId,
    firstTokSymbol,
    secondTokId,
    secondTokSymbol,
    showText = false,
  } = props
  if (!firstTokId || !firstTokSymbol || !secondTokId || !secondTokSymbol)
    return null

  return (
    <Container>
      <IconWrapper>
        <CryptoIcon symbol={firstTokSymbol} size={size} id={firstTokId} />
        <CryptoIcon symbol={secondTokSymbol} size={size} id={secondTokId} />
      </IconWrapper>

      {showText && <Text tokenAId={firstTokId} tokenBId={secondTokId} />}
    </Container>
  )
})``

export default CryptoIconPair
