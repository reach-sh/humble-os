import doublecheck from 'assets/Icons/double-check.svg'
import { t } from '@lingui/macro'
import styled from 'styled-components'
import { StyledProps } from 'types/shared'

const DoneCheck = ({ className }: StyledProps) => (
  <img src={doublecheck} className={className} />
)

const StyledCheck = styled(DoneCheck).attrs({
  className: 'done_check',
})`
  filter: invert(100%) sepia(100%) saturate(1%) hue-rotate(95deg)
    brightness(104%) contrast(101%);
  padding-right: 0.5625em;
`

const Done = ({ className }: StyledProps) => (
  <div className={className}>
    <StyledCheck />
    <p>{t`Done`}</p>
  </div>
)

export default styled(Done).attrs({
  className: 'done',
})`
  vertical-align: middle;
  display: flex;
  color: white;
  font-family: 'Lato', sans-serif;
  margin-left: 1em;
`
