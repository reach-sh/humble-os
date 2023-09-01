/* eslint-disable max-len */
import styled from 'styled-components'

export const StyledPathFill = styled.path<{ containerClassName?: string }>`
  stroke: ${({ theme }) => theme.colors.text};
`

export interface LineChartProps {
  className?: string
  height?: string
  viewBox?: string
  width?: string
}

const LineUpChart = ({
  height = '25',
  viewBox = '0 0 25 25',
  width = '25',
  ...props
}: LineChartProps) => (
  <svg {...{ width, height }} viewBox={viewBox} fill='none' {...props}>
    <StyledPathFill d='M24.5 22.75H3.5V5.25' />
    <StyledPathFill d='M22.7502 7L14.0002 15.75L10.5002 12.25L3.50024 19.25' />
    <StyledPathFill d='M22.7502 11.375V7H18.3752' />
  </svg>
)

export default LineUpChart
