import Popover from 'components/Common/Popover'
import styled from 'styled-components'
import ThemeSelect from './ThemeToggle'
import SlippageSettings from './Slippage'
import DisplayCurrency from './DisplayCurrency'

const SettingsContainer = styled.div`
  min-width: 300px;
`
const SettingsTitle = styled.h4`
  font-size: 24px;
`

const SettingsList = ({
  closeSettings,
  open,
}: {
  closeSettings: () => void
  open: boolean
}) => (
  <Popover open={open} handleClose={closeSettings}>
    <SettingsContainer>
      <SettingsTitle>Settings</SettingsTitle>
      <ThemeSelect />
      {/* <LanguageSettings /> */}
      <DisplayCurrency />
      <SlippageSettings />
    </SettingsContainer>
  </Popover>
)

export default SettingsList
