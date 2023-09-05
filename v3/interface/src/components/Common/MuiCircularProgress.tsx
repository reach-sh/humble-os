import CircularProgress from '@mui/material/CircularProgress'
import styled from 'styled-components'
import Tooltip from './Tooltip'

const BgWrapper = styled.div<{
  bgColor?: string
  color?: string
  size?: number
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  background-color: ${({ bgColor }) => bgColor};
  border-radius: 8px;
  color: ${({ color }) => color};
`

const CircleProgressBar = ({
  progress,
  size,
  color,
  bgRect,
  tooltip,
  onClick,
}: {
  progress: number
  size: number
  color?: string
  bgRect: string
  tooltip?: string
  onClick?: () => void
}) => (
  <BgWrapper bgColor={bgRect} color={color} size={size + 16} onClick={onClick}>
    <Tooltip message={tooltip}>
      <CircularProgress
        variant='determinate'
        value={progress}
        color='inherit'
        size={size}
      />
    </Tooltip>
  </BgWrapper>
)

export default CircleProgressBar
