import warning from 'assets/Icons/warning.svg'
import styled from 'styled-components'
import { COLORS } from 'theme'
import FlexContainer from './FlexContainer'

const WarningIcon = styled.img.attrs({ src: warning })`
  margin-right: 10px;
  filter: invert(31%) sepia(90%) saturate(2652%) hue-rotate(343deg)
    brightness(87%) contrast(97%);
`
const Container = styled(FlexContainer).attrs({
  rounded: true,
  columns: 'min-content auto',
})`
  align-items: center;
  background: rgba(219, 54, 44, 0.1);
  border-radius: 12px;
  margin: 1.4rem auto 0;
  min-height: 50px;
  padding: 8px 11px;
  width: 100%;
`

const Text = styled.div`
  color: ${COLORS.errorRed};
  font-family: 'Lato';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 17px;
  text-align: left;
`

export const ErrorContainer = ({ text }: { text: string }) => (
  <Container>
    <WarningIcon />
    <Text>{text}</Text>
  </Container>
)

export default ErrorContainer
