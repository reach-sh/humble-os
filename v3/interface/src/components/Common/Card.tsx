import styled from 'styled-components'
import SIZE from 'constants/screenSizes'

const CardContainer = styled.div`
  @media (max-width: ${SIZE.lg}) {
    width: 100%;
  }
`

const CardTitle = styled.h2`
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`
// The content container of the card
// ...this is the ACTUAL card
const CardContent = styled.div<{ padded?: boolean }>`
  background: #fff;
  border: 0.01rem solid #e7e7e744;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ padded }) => (padded ? '1.5rem' : '')};
  @media (max-width: ${SIZE.sm}) {
    margin: 10px auto;
    padding: 10px;
  }
`

export const SwapContainer = styled(CardContent)`
  background: ${({ theme }) => theme.colors.body};
  border: 0.01rem solid #e7e7e744;
  border-radius: 16px;
  margin: 0 auto;
  padding: 3rem;
  p {
    color: ${({ theme }) => theme.colors.text};
  }

  @media screen and (max-width: ${SIZE.md}) {
    padding: 1.5rem;
  }
`

type CardProps = {
  children: React.ReactNode
  padded?: boolean
  title?: string
  className?: string
  style?: Record<string, unknown>
}

const Card = (props: CardProps) => {
  const { children, style = {}, title, padded, className } = props
  return (
    <CardContainer className={className}>
      <CardContent padded={padded} style={{ ...style }}>
        {title && <CardTitle>{title}</CardTitle>}
        {children}
      </CardContent>
    </CardContainer>
  )
}

export default Card
