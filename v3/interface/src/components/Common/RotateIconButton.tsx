import IconButtonWrapper from 'components/Common/IconButtonWrapper'
import styled from 'styled-components'
import { useTheme } from 'contexts/theme'
import { useMemo } from 'react'

export interface RotateIconButtonProps
  extends React.ComponentPropsWithRef<'button'> {
  onClick?: (e?: any) => void
  customIcon?: string
  styles?: Record<string, string>
  filter?: string
}

const IconImg = styled.img``

const RotateIconButton = ({
  onClick,
  disabled,
  customIcon,
  styles,
  filter,
}: RotateIconButtonProps) => {
  const { theme } = useTheme()
  const imgFilter = useMemo(() => {
    if (disabled === true) return 'disabled-filter'
    if (filter) return filter
    return theme === 'Dark' ? 'dark-mode-svg-filter' : 'light-mode-svg-filter'
  }, [theme, disabled, filter])

  return (
    <IconButtonWrapper onClick={onClick} disabled={disabled} style={styles}>
      <IconImg src={customIcon} className={imgFilter} />
    </IconButtonWrapper>
  )
}

export default RotateIconButton
