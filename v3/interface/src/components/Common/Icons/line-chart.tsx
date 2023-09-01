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

const LineChartIcon = ({
  height = '25',
  viewBox = '0 0 25 25',
  width = '25',
  className,
  ...props
}: LineChartProps) => (
  <svg width={width} height={height} viewBox={viewBox} fill='none' {...props}>
    <StyledPathFill
      containerClassName={className}
      d='M17.9624 9.50952L14.7459 14.3343C14.2959 15.0093 13.2845 14.9463 12.9217 14.2207L12.437 13.2513C12.0742 12.5256 11.0628 12.4627 10.6128 13.1377L7.39627 17.9624'
    />
    <StyledPathRect
      containerClassName={className}
      x='3'
      y='5'
      width='19.019'
      height='16.9058'
      rx='2.11323'
      stroke-width='2.11323'
    />
  </svg>
)

export default LineChartIcon
