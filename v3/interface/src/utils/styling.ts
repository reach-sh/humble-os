/**
 *
 * @param color Chosen color in hex
 * @param opacity The specified opacity percentage out of 100 ie 60 = 60%
 * @returns the color and opacity as one hex value.
 */

import { DefaultTheme } from 'styled-components'

/* eslint-disable import/prefer-default-export */
export function colorAndOpacityToHex(color: string, opacity: number) {
  let calculatedOpacity: number
  if (opacity < 0) calculatedOpacity = 0
  else if (opacity > 100) calculatedOpacity = 100

  calculatedOpacity = Math.round(opacity * 2.55)

  const colorString = color.startsWith('#') ? color : `#${color}`

  return (
    colorString + calculatedOpacity.toString(16).toUpperCase().padStart(2, '0')
  )
}

// NOTE: This version is the correct implementation. Our current designs are
// approved with the 'wrong' implementation above. When new designs come in we should replace it.
/**
 *
 * @param color Chosen color in hex
 * @param opacity The specified opacity percentage out of 100 ie 60 = 60%
 * @returns the color and opacity as one hex value.
 */
/* eslint-disable import/prefer-default-export */
export function colorOpacityToHex(color: string, opacity: number) {
  let calculatedOpacity: number
  if (opacity < 0) calculatedOpacity = 0
  else if (opacity > 100) calculatedOpacity = 100

  calculatedOpacity = Math.round(opacity * 2.55)

  const colorString = color.startsWith('#') ? color.slice(1) : color

  return `#${calculatedOpacity
    .toString(16)
    .toUpperCase()
    .padStart(2, '0')}${colorString}`
}

export function inputBorderColor({
  error,
  theme,
  active,
}: {
  error: boolean
  theme: DefaultTheme
  active?: boolean
}) {
  if (error) return theme.colors.inputErrorBorder
  if (active) return theme.colors.inputActiveBorder
  return theme.colors.inputInactiveBorder
}

export function inputBgColor({
  error,
  theme,
  active,
}: {
  error: boolean
  theme: DefaultTheme
  active?: boolean
}) {
  return error
    ? `${theme.colors.inputErrorBg}`
    : active
    ? `${theme.colors.inputActiveBg}`
    : `${theme.colors.inputInactiveBg}`
}
