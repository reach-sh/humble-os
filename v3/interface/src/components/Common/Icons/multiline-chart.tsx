/* eslint-disable max-len */
import styled from 'styled-components'
import { COLORS } from 'theme'

export const StyledPathFill = styled.path<{ containerClassName?: string }>`
  stroke: ${({ containerClassName }) => {
    if (containerClassName === 'selected') return COLORS.darkSage
    return COLORS.sage
  }};
`

export const StyledPathRect = styled.rect<{ containerClassName?: string }>`
  stroke: ${({ containerClassName }) => {
    if (containerClassName === 'selected') return COLORS.darkSage
    return COLORS.sage
  }};
`

export interface LineChartProps {
  className?: string
  height?: string
  viewBox?: string
  width?: string
}

const MultiLineChartIcon = ({
  height = '25',
  viewBox = '0 0 25 25',
  width = '25',
  className,
  ...props
}: LineChartProps) => (
  <svg width={width} height={height} viewBox={viewBox} fill='none' {...props}>
    <StyledPathFill
      containerClassName={className}
      d='M6.71729 17L11.2173 16L13.2173 13L17.7173 12L19.7173 9M7.21729 13.5L9.71729 14.5L14.2173 17L16.2173 15.5L19.7173 16'
    />
    <StyledPathRect
      containerClassName={className}
      x='3.71729'
      y='5'
      width='19'
      height='16'
      rx='2.11323'
      stroke-width='2.11323'
    />
  </svg>
)

export default MultiLineChartIcon
