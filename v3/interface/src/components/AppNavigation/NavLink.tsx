import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { COLORS } from 'theme'

type LinkProps = {
  children: React.ReactNode
  to: string
  onClick?: () => void
}

export const StyledNavLink = styled(NavLink)`
  font-size: 16px;
  letter-spacing: 1px;
  margin-right: ${({ theme }) => theme.sizes.xxs};
  min-width: max-content;
  padding: ${({ theme }) => theme.sizes.xs};
  text-align: center;
  font-weight: 600;
  border-radius: 16px;
  color: ${({ theme }) => theme.colors.text};
  &:hover {
    background-color: ${({ theme }) => theme.colors.pageTabSelected};
  }
  &.active {
    color: ${COLORS.white};
    background-color: ${({ theme }) => theme.colors.pageTab};
  }
  &:last-of-type {
    margin-right: 0;
  }
`

/**
 * Custom Nav Link component to allow for easy seemless customization across all navigation links
 */
const Link = ({ children, to, onClick }: LinkProps) => (
  <StyledNavLink to={to} onClick={onClick}>
    {children}
  </StyledNavLink>
)

export default Link
