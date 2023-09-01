import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import Tooltip from './Tooltip'

const BgWrapper = styled.div<{ bgColor?: string; width?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ width }) => `${width}px`};
  height: ${({ width }) => `${width}px`};
  background-color: ${({ bgColor }) => bgColor};
  border-radius: 8px;
  cursor: pointer;
`

const ProgressSvg = styled.svg`
  display: block;
  margin: 8px;
  max-width: 100%;
`

const Circle = styled.circle`
  fill: none;
`

const CircleProgressBar = ({
  size,
  progress,
  strokeWidth,
  circleOneStroke,
  circleTwoStroke,
  bgRect,
  tooltip,
  onClick,
}: {
  size: number
  progress: number
  strokeWidth: number
  circleOneStroke?: string
  circleTwoStroke?: string
  bgRect: string
  tooltip?: string
  onClick?: () => void
}) => {
  const [offset, setOffset] = useState(-90)
  const circleRef = useRef<SVGCircleElement>(null)

  const center = size / 2
  const radius = size / 2 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const progressOffset = ((100 - progress) / 100) * circumference
    setOffset(progressOffset)

    circleRef.current?.setAttribute(
      'style',
      'transition: stroke-dashoffset 200ms ease-in-out',
    )
  }, [setOffset, progress, circumference, offset])

  return (
    <BgWrapper bgColor={bgRect} width={size + 16} onClick={onClick}>
      <Tooltip position='topLeft' message={tooltip}>
        <ProgressSvg width={size} height={size}>
          <Circle
            stroke={circleOneStroke}
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            ref={circleRef}
            stroke={circleTwoStroke}
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </ProgressSvg>
      </Tooltip>
    </BgWrapper>
  )
}

export default CircleProgressBar
