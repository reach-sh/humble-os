import styled from 'styled-components'
import routes from 'App.routes'
import EllipsisIcon from 'components/Common/Icons/ellipsis'
import FlexContainer, {
  FlexColumnContainer,
} from 'components/Common/FlexContainer'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { COLORS } from 'theme'
import HLink from './NavLink'

const Container = styled(FlexColumnContainer)`
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 199;
`

const StyledMenu = styled.nav`
  align-items: center;
  background: ${({ theme }) => theme.colors.lighterBackground};
  border-bottom: 1px solid ${COLORS.black}33;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0;
  padding: 16px;
`

const OptionButton = styled(FlexContainer)`
  justify-content: center;
`

const StyledNavLink = styled(NavLink)`
  font-size: 16px;
  letter-spacing: 1px;
  margin-top: 6px;
  margin-right: ${({ theme }) => theme.sizes.xxs};
  min-width: max-content;
  padding: 6px 2rem;
  text-align: center;
  font-weight: 600;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.lighterBackground};
  color: ${({ theme }) => theme.colors.text};
  &:hover {
    background-color: ${({ theme }) => theme.colors.pageTabSelected};
  }
  &.active {
    color: ${COLORS.white};
    background-color: ${({ theme }) => theme.colors.pageTab};
  }
`

const DropUpContainer = styled(FlexColumnContainer)`
  align-self: flex-end;
  margin-top: 12px;
  width: auto;
  ${StyledNavLink} {
    border-bottom: 1px solid ${COLORS.black}33;
  }
`

const NavFooter = () => {
  const [showOptions, setShowOptions] = useState(false)
  const onOptionClick = () => {
    setShowOptions(!showOptions)
  }
  return (
    <Container>
      <StyledMenu>
        {routes.slice(0, 3).map((route) => (
          <HLink
            key={route.path}
            to={route.path}
            onClick={() => setShowOptions(false)}
          >
            {route.text}
          </HLink>
        ))}
        <OptionButton onClick={onOptionClick}>
          <EllipsisIcon />
        </OptionButton>
      </StyledMenu>

      {showOptions && (
        <DropUpContainer>
          {routes.slice(3, 4).map((route) => (
            <StyledNavLink
              key={route.path}
              to={route.path}
              onClick={() => {
                setShowOptions(false)
              }}
            >
              {route.text}
            </StyledNavLink>
          ))}
        </DropUpContainer>
      )}
    </Container>
  )
}

export default NavFooter
