import { ComponentPropsWithRef } from 'react'
import styled from 'styled-components'
import { COLORS } from 'theme'
import { GridContainer } from './FlexContainer'
import Icon from './Icon'

type AlertProps = ComponentPropsWithRef<'div'> & { boldText?: boolean }
const AlertContainer = styled(GridContainer)`
  animation: bounce 300ms ease-out;
  color: ${({ theme }) => theme.colors.main};
  grid-template-columns: 32px calc(100% - 32px);
  margin: ${({ theme }) => theme.sizes.sm} 0;
  padding: ${({ theme }) => theme.sizes.sm};
  width: 100%;

  .material-icons {
    font-size: ${({ theme }) => theme.sizes.md};
  }
`
export const Notification = styled((props: AlertProps) => {
  const { children, ...rest } = props
  return (
    <AlertContainer {...rest}>
      <Icon iconType='info' />
      <div>{children}</div>
    </AlertContainer>
  )
})``

/**
 * Helper container for showing error text. This renders (optionally bold)
 * text in a `<div />` tag, and includes a left-to-right "shake" animation.
 */
const ErrorNotification = styled(Notification)`
  animation: shake 300ms ease-out;
  background-color: ${({ theme }) => theme.colors.error};
  color: ${COLORS.white};
  font-size: smaller;
  font-weight: ${({ boldText }) => (boldText ? 'bolder' : 'normal')};
  border-radius: 4px;
`

export default ErrorNotification
