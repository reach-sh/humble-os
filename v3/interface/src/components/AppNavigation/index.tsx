import styled from 'styled-components'
import routes from 'App.routes'
import SIZE from 'constants/screenSizes'
import Link from './NavLink'

const StyledMenu = styled.nav`
  align-items: center;
  border-radius: 6px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  padding: 6px;

  @media screen and (max-width: ${SIZE.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`

function AppNavigation(): JSX.Element {
  return (
    <StyledMenu>
      {routes.slice(0, 4).map((route) => (
        <Link key={route.path} to={route.path}>
          {route.text}
        </Link>
      ))}
    </StyledMenu>
  )
}

export default AppNavigation
