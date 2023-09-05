/* eslint-disable max-len */
import styled from 'styled-components'
import { COLORS } from 'theme'

export const StyledPathFill = styled.path<{ containerClassName?: string }>`
  fill: ${({ theme, containerClassName }) => {
    if (containerClassName === 'rotate-reverse') return COLORS.darkSage
    if (containerClassName === 'rotate') return COLORS.orange
    return theme.colors.text
  }};
`

export const StyledPathStroke = styled.path<{ containerClassName?: string }>`
  stroke: ${({ theme, containerClassName }) => {
    if (containerClassName === 'rotate-reverse') return COLORS.darkSage
    if (containerClassName === 'rotate') return COLORS.orange
    return theme.colors.text
  }};
`

export interface ArrowProps {
  className?: string
  height?: string | number
  viewBox?: string
  width?: string | number
}

const Arrow = ({
  height = '22',
  viewBox = '0 0 22 22',
  width = '22',
  ...props
}: ArrowProps) => (
  <svg width={width} height={height} viewBox={viewBox} fill='none' {...props}>
    <StyledPathFill d='M6.31837 12.7777C5.92316 12.3825 5.2824 12.3825 4.88719 12.7777C4.49198 13.1729 4.49198 13.8137 4.88719 14.2089L6.31837 12.7777ZM11.0001 18.8906L10.2845 19.6062L11.0001 20.3218L11.7157 19.6062L11.0001 18.8906ZM17.113 14.2089C17.5082 13.8137 17.5082 13.1729 17.113 12.7777C16.7178 12.3825 16.077 12.3825 15.6818 12.7777L17.113 14.2089ZM4.88719 14.2089L10.2845 19.6062L11.7157 18.175L6.31837 12.7777L4.88719 14.2089ZM11.7157 19.6062L17.113 14.2089L15.6818 12.7777L10.2845 18.175L11.7157 19.6062Z' />
    <StyledPathStroke
      d='M11 18.8906L11 2.69866'
      strokeWidth='2.024'
      strokeLinecap='round'
    />
  </svg>
)

export default Arrow
