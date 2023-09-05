/** `<Button />` component props */
import { DefaultTheme } from 'styled-components'
import { COLORS } from 'theme'

type baseFlexType = 'flex-start' | 'center' | 'flex-end'

type alignItemsType = baseFlexType | 'baseline' | 'stretch'

type justifyContentType =
  | baseFlexType
  | 'space-between'
  | 'space-around'
  | 'space-evenly'

export interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  active?: boolean
  icon?: string
  onClick?: (e?: any) => void
  outline?: boolean
  size?: 'tiny' | 'sm' | 'lg'
  style?: Record<string, unknown>
  variant?: 'accent' | 'link' | 'cancel' | 'wallet'
  wide?: boolean
  customIcon?: string
  subText?: string
  cryptoIcon?: string
  rightIcon?: string
  alignItems?: alignItemsType
  justifyContent?: justifyContentType
}

interface ThemedButtonProps extends ButtonProps {
  theme: DefaultTheme
}

// Shared Style Helpers
export const btnBgColor = ({
  disabled,
  active,
  theme,
  variant,
  outline,
}: ThemedButtonProps): string => {
  if (outline) return 'transparent'
  if (disabled) return theme.colors.disabledButton
  if (active) return btnHoverBgColor({ disabled, theme, variant })
  if (!variant) return COLORS.yellow
  if (variant === 'cancel') return theme.colors.cancelBtnBg
  if (variant === 'wallet') return COLORS.white

  return variant === 'accent' ? theme.colors.accent : 'transparent'
}

export const btnBorder = ({
  disabled,
  active,
  theme,
  variant,
  outline,
}: ThemedButtonProps): string => {
  if (!outline) return '0'
  if (disabled) return `1px solid ${theme.colors.disabledButton}`
  if (active)
    return `1px solid ${btnHoverBgColor({ disabled, theme, variant })}`
  if (!variant) return `1px solid ${COLORS.yellow}`
  if (variant === 'cancel') return `1px solid ${theme.colors.cancelBtnBg}`
  if (variant === 'wallet') return `1px solid ${COLORS.white}`

  return `1px solid ${theme.colors.accent}`
}

export const btnTextColor = ({
  disabled,
  theme,
  variant,
  outline,
}: ThemedButtonProps): string => {
  if (outline) {
    // if (disabled) return theme.colors.disabledButton
    if (disabled) return COLORS.lightGray
    if (variant === 'accent') return theme.colors.accent
    return COLORS.yellow
  }

  if (variant === 'cancel') return theme.colors.altButtonActiveText
  return COLORS.black
}

export const btnHoverBgColor = ({
  disabled,
  theme,
  variant,
}: ThemedButtonProps) => {
  if (disabled) return theme.colors.disabledButton
  if (!variant) return COLORS.orange
  // Accent colors
  const accents = [COLORS.darkSage, COLORS.sage]
  const bgColor = btnBgColor({ disabled, theme, variant, active: false })
  if (variant === 'accent') return accents[Number(bgColor === accents[0])]
  if (variant === 'cancel') return theme.colors.cancelBtnHover

  return ''
}

export const btnBorderRadius = ({ size }: ButtonProps) =>
  !size || size === 'lg' ? '16px' : '4px'

export const btnFontSize = ({ theme, size }: ThemedButtonProps) => {
  if (!size || size === 'lg') return theme.sizes.md
  if (size === 'sm') return 'smaller'
  if (size === 'tiny') return 'x-small'
  return theme.sizes.sm
}

export const btnHeight = ({ size }: ButtonProps) => {
  if (!size) return '40px'
  if (size === 'lg') return '56px'
  if (size === 'sm') return '30px'
  return 'auto'
}

export const btnPadding = ({ size }: ButtonProps) =>
  size === 'tiny' ? '2px 4px' : 0

export const btnTextTransform = ({ size }: ButtonProps) =>
  size === 'tiny' ? 'uppercase' : 'initial'

export const btnMinWidth = ({ size }: ButtonProps) => {
  if (!size) return '140px'
  return 0
}

export const btnWidth = ({ wide }: ButtonProps) => (wide ? '100%' : 'initial')
