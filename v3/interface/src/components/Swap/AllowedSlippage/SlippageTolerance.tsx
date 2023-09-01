import styled from 'styled-components'
import Icon from 'components/Common/Icon'

const Container = styled.b<{ slippageTolerance: number }>`
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
  display: flex;
  justify-content: center;
  color: ${({ slippageTolerance, theme }) =>
    slippageTolerance > 1 ? theme.colors.error : theme.colors.text};

  :hover {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.accent};
  }
`

type Props = {
  open: boolean
  slippageTolerance: number
  onClick: () => void
}

export default function SlippageTolerance({
  open,
  slippageTolerance,
  onClick,
}: Props) {
  return (
    <Container slippageTolerance={slippageTolerance} onClick={onClick}>
      <span>{slippageTolerance.toFixed(2)}%</span>
      <Icon iconType={`expand_${open ? 'less' : 'more'}`} />
    </Container>
  )
}
