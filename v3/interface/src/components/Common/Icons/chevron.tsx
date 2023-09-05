/* eslint-disable max-len */
import styled from 'styled-components'

const StyledPath = styled.path<{
  colorMode: 'normal' | 'contrast'
}>`
  fill: ${({ theme, colorMode }) =>
    colorMode === 'contrast' ? theme.colors.svg : theme.colors.arrowColor};
`

interface ChevronProps {
  className?: string
  colorMode?: 'normal' | 'contrast'
  height?: string
  viewBox?: string
  width?: string
}

const Chevron = ({
  className,
  colorMode = 'normal',
  height = '7',
  viewBox = '0 0 13 7',
  width = '13',
  ...props
}: ChevronProps) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox={viewBox}
    fill='none'
    {...props}
  >
    <StyledPath
      d='M1.46501 0.226638C1.20795 -0.00186676 0.814312 0.0212882 0.585807 0.278356C0.357302 0.535424 0.380457 0.929058 0.637525 1.15756L1.46501 0.226638ZM6.65618 5.67424L6.24244 6.13971L6.65618 6.50748L7.06992 6.13971L6.65618 5.67424ZM12.6748 1.15756C12.9319 0.929058 12.9551 0.535424 12.7266 0.278356C12.498 0.0212882 12.1044 -0.00186676 11.8473 0.226638L12.6748 1.15756ZM0.637525 1.15756L6.24244 6.13971L7.06992 5.20878L1.46501 0.226638L0.637525 1.15756ZM7.06992 6.13971L12.6748 1.15756L11.8473 0.226638L6.24244 5.20878L7.06992 6.13971Z'
      colorMode={colorMode}
    />
  </svg>
)

export default Chevron
