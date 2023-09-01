import { useTheme, ThemeEnum } from 'contexts/theme'
import styled from 'styled-components'
import MoonIcon from 'assets/moon-icon.svg'
import SunIcon from 'assets/sun-icon.svg'

const ThemeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
`

const ToggleContainer = styled.div`
  width: 62px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 2px 3px;
  border-radius: 40px;
`

const IconContainer = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    cursor: pointer;
  }
`
const IconImage = styled.img`
  filter: invert(96%) sepia(4%) saturate(260%) hue-rotate(172deg)
    brightness(95%) contrast(90%);
  height: auto;
  &.active {
    filter: invert(100%) sepia(0%) saturate(4228%) hue-rotate(70deg)
      brightness(108%);
  }
`

const Icon = ({
  onClick,
  icon,
  active,
  width = '16px',
}: {
  onClick: () => void
  icon: any
  active?: boolean
  width?: string
}) => {
  const bgColor = icon === SunIcon ? '#FFBE1D' : 'black'
  const containerStyles = {
    background: active ? bgColor : '',
  }
  return (
    <IconContainer style={containerStyles}>
      <IconImage
        width={width}
        alt='icon'
        onClick={onClick}
        src={icon}
        className={active ? 'active' : ''}
      />
    </IconContainer>
  )
}

const ThemeSelect = () => {
  const { theme, setTheme } = useTheme()

  const changeToLightTheme = () => setTheme(ThemeEnum.Light)
  const changeToDarkTheme = () => setTheme(ThemeEnum.Dark)

  const isDarkMode = theme === 'Dark'

  return (
    <ThemeContainer>
      <p>Dark Mode</p>
      <ToggleContainer>
        <Icon
          icon={SunIcon}
          active={!isDarkMode}
          onClick={changeToLightTheme}
          width='20px'
        />
        <Icon icon={MoonIcon} active={isDarkMode} onClick={changeToDarkTheme} />
      </ToggleContainer>
    </ThemeContainer>
  )
}

export default ThemeSelect
