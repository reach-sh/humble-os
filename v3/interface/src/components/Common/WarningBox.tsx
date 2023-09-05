import styled from 'styled-components'
import { COLORS } from 'theme'
import FlexContainer from 'components/Common/FlexContainer'
import WarningIcon from 'components/Common/Icons/warning'

const StyledWarningBox = styled(FlexContainer)`
  background-color: ${COLORS.orange}1A;
  border-radius: 12px;
  color: ${COLORS.orange};
  justify-content: space-between;
  margin-top: 10px;
  padding: 8px 20px;
  gap: 10px;
  font-size: 12px;
  *:first-child {
    flex-shrink: 0;
  }
  div {
    flex-grow: 1;
  }
`

const Title = styled.div`
  font-weight: 600;
`

const Text = styled.div`
  font-weight: 400;
`

interface WarningBoxProps {
  title?: string
  text?: string
}

const WarningBox = ({ title, text }: WarningBoxProps) => (
  <StyledWarningBox>
    <WarningIcon />
    <div>
      {title && <Title>{title}</Title>}
      {text && <Text>{text}</Text>}
    </div>
  </StyledWarningBox>
)

export default WarningBox
