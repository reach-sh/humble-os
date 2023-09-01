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

const BarChartIcon = ({
  height = '25',
  viewBox = '0 0 25 25',
  width = '25',
  className,
  ...props
}: LineChartProps) => (
  <svg width={width} height={height} viewBox={viewBox} fill='none' {...props}>
    <StyledPathFill
      containerClassName={className}
      d='M8.81201 10.5661L8.81201 16.9058'
    />
    <StyledPathFill
      containerClassName={className}
      d='M13.0381 12.6794V16.9058'
    />
    <StyledPathFill
      containerClassName={className}
      d='M17.2646 8.45291V16.9058'
    />
    <StyledPathRect
      containerClassName={className}
      x='3.52881'
      y='4.22646'
      width='19.019'
      height='16.9058'
      rx='2.11323'
      stroke-width='2.11323'
    />
  </svg>
)

export default BarChartIcon
