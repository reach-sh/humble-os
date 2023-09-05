import ClickAwayListener from '@mui/base/ClickAwayListener'
import React from 'react'
import styled from 'styled-components'
import RotateIconButton from 'components/Common/RotateIconButton'
import { COLORS } from 'theme'
import { useTheme } from 'contexts/theme'
import {
  LOCAL_STORAGE_OPTED_INTO_HIGH_SLIPPAGE,
  LOCAL_STORAGE_SLIPPAGE_KEY,
} from 'constants/local-storage'
import { GlobalUser } from 'state/reducers/user'
import useGlobalUser from 'hooks/useGlobalUser'
import { setSlippage } from '@reach-sh/humble-sdk'
import SettingsList from './SettingsList'
import settingsIcon from '../../../assets/Icons/fi-rr-settings 1.svg'
import SlippageChangeModal from '../../Modals/SlippageChangeModal'

const SettingsContainer = styled.div`
  margin-left: 0.5rem;
  position: relative;
`

/**
 * Component for changing settings of the application
 * Renders gear button initially that is interactive
 */
const Settings = () => {
  const { theme } = useTheme()
  const [isViewingSettings, setViewingSettings] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const { slippageTolerance, optedIntoHighSlippage } = useGlobalUser([
    'slippageTolerance',
    'optedIntoHighSlippage',
  ])

  const toggleSettingsDropdown = () => {
    setViewingSettings((prev) => !prev)
  }

  const closeSettings = () => {
    if (!isViewingSettings) return
    checkSlippageTolerance()
    setViewingSettings(false)
  }

  const onProceed = () => {
    localStorage.setItem(LOCAL_STORAGE_OPTED_INTO_HIGH_SLIPPAGE, 'true')
    GlobalUser.optedIntoHighSlippage(true)
    setShowModal(false)
  }

  const onUseDefault = () => {
    localStorage.setItem(LOCAL_STORAGE_SLIPPAGE_KEY, '0.5')
    GlobalUser.slippageTolerance(0.5)
    setSlippage(0.5)
    setShowModal(false)
  }

  const checkSlippageTolerance = () => {
    if (slippageTolerance > 1 && !optedIntoHighSlippage) {
      setShowModal(true)
    }
  }

  return (
    <ClickAwayListener onClickAway={closeSettings}>
      <SettingsContainer>
        <RotateIconButton
          customIcon={settingsIcon}
          onClick={toggleSettingsDropdown}
          styles={{
            background: theme === 'Dark' ? COLORS.DMMidGray : COLORS.darkCream,
            padding: '10px',
            borderRadius: '16px',
          }}
        />
        {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
        <SettingsList open={isViewingSettings} closeSettings={() => {}} />
        {showModal && (
          <SlippageChangeModal
            open={showModal}
            onProceed={onProceed}
            onUseDefault={onUseDefault}
          />
        )}
      </SettingsContainer>
    </ClickAwayListener>
  )
}

export default Settings
