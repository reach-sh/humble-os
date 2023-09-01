/* eslint-disable max-len */
import styled from 'styled-components'
import { COLORS } from 'theme'

const StyledPath = styled.path<{ dark?: boolean }>`
  fill: ${({ dark }) => (dark ? COLORS.milk : COLORS.black)};
`

interface ChainProps {
  dark?: boolean
  height?: string
  viewBox?: string
  width?: string
}

const Chain = ({
  dark,
  height = '9',
  viewBox = '0 0 6 9',
  width = '6',
  ...props
}: ChainProps) => (
  <svg width={width} height={height} viewBox={viewBox} fill='none' {...props}>
    <StyledPath
      d='M0.941794 7.6309C0.698497 7.87419 0.698497 8.26866 0.941794 8.51196C1.18509 8.75525 1.57956 8.75525 1.82285 8.51196L0.941794 7.6309ZM4.70501 4.74874L5.14554 5.18927L5.58607 4.74874L5.14554 4.30821L4.70501 4.74874ZM1.82285 0.985529C1.57956 0.742231 1.18509 0.742231 0.941794 0.985529C0.698497 1.22883 0.698497 1.62329 0.941794 1.86659L1.82285 0.985529ZM1.82285 8.51196L5.14554 5.18927L4.26448 4.30821L0.941794 7.6309L1.82285 8.51196ZM5.14554 4.30821L1.82285 0.985529L0.941794 1.86659L4.26448 5.18927L5.14554 4.30821Z'
      dark={dark}
    />
  </svg>
)

export default Chain
