import { useState } from 'react'
import ClickAwayListener from '@mui/base/ClickAwayListener'
import useGlobalUser from 'hooks/useGlobalUser'
import SlippageTolerance from './SlippageTolerance'
import SlippageDropdown from './SlippageDropdown'

export default function AllowedSlippage() {
  const [popover, setPopover] = useState(false)
  const { slippageTolerance } = useGlobalUser()
  return (
    <ClickAwayListener onClickAway={() => setPopover(false)}>
      <div>
        <SlippageTolerance
          open={popover}
          slippageTolerance={slippageTolerance}
          onClick={() => setPopover(!popover)}
        />
        {popover && <SlippageDropdown />}
      </div>
    </ClickAwayListener>
  )
}
