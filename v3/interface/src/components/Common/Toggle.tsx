import { useTheme } from 'contexts/theme'
import styled from 'styled-components'

const ToggleContainer = styled.div`
  width: fit-content;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 3.2px 3.2px;
  border-radius: 40px;
`

const ToggleText = styled.div<{ isDarkMode: boolean; disabled?: boolean }>`
  border-radius: 15px;
  padding-left: 16px;
  padding-right: 16px;
  color: ${({ theme, isDarkMode }) =>
    isDarkMode ? theme.colors.altButtonActiveText : theme.colors.altButtonText};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  &.active {
    color: ${({ theme }) => theme.colors.altButtonText};
  }
  &.pulse {
    animation-duration: 300ms;
    animation-fill-mode: backwards;
    animation-iteration-count: 1;
  }
`

const ToggleOption = ({
  active,
  disabled,
  onClick,
  text,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  text: string
}) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const bgColor = isDarkMode ? 'black' : '#FFBE1D'
  const containerStyles = {
    background: active ? bgColor : '',
  }
  return (
    <ToggleText
      style={containerStyles}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      isDarkMode={isDarkMode}
      className={active ? 'active pulse' : ''}
    >
      {text}
    </ToggleText>
  )
}

const Toggle = styled(
  ({
    active,
    disabled,
    negText,
    onToggleClick,
    posText,
  }: {
    active: string
    disabled?: boolean
    negText: string
    onToggleClick: () => void
    posText: string
  }) => (
    <ToggleContainer data-testid='toggle'>
      <ToggleOption
        active={posText === active}
        disabled={disabled}
        onClick={onToggleClick}
        text={posText}
      />
      <ToggleOption
        active={negText === active}
        disabled={disabled}
        onClick={onToggleClick}
        text={negText}
      />
    </ToggleContainer>
  ),
)``

export default Toggle
