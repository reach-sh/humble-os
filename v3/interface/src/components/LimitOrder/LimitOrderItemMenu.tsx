import { useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { noOp } from '@reach-sh/humble-sdk'
import { FlexColumnContainer } from 'components/Common/FlexContainer'
import ListView from 'components/Common/ListView'
import { LABELS } from 'constants/messages'
import SIZE from 'constants/screenSizes'
import { COLORS } from 'theme'
import { LimitOrderAction, LimitOrderStatus } from 'types/shared'
import useBlur from 'hooks/useBlur'

// ACTIONS | Used instead of enum to allow Lingui translation
const { FILL_ORDER: FILL, REOPEN, CANCEL_ORDER, COPY } = LABELS
type StatusAction = { text: string; do: LimitOrderAction }
const STATUS_ACTIONS: Record<LimitOrderStatus, StatusAction[]> = {
  open: [
    { text: FILL, do: 'fill' },
    { text: COPY, do: 'copy' },
    { text: CANCEL_ORDER, do: 'close' },
  ],
  closed: [{ text: REOPEN, do: 're-open' }],
}

const Container = styled(FlexColumnContainer)`
  align-items: center;
  cursor: pointer;
  grid-area: menu;
  height: calc(1.4rem + 40px);
  padding: 20px 0;
  place-content: space-between;
  overflow: visible;
`
const DotsContainer = styled(FlexColumnContainer).attrs({
  tabIndex: -1,
  role: 'button',
})`
  align-self: stretch;
  place-content: space-between;
  height: 100%;
`
const Dot = styled.b`
  &:after {
    background-color: ${({ theme }) => theme.colors.text};
    border-radius: 100%;
    content: '';
    display: block;
    height: 0.2rem;
    margin: 0 auto;
    width: 0.2rem;
  }
`
const MenuContainer = styled(ListView).attrs({
  className: 'slide-in-right',
})`
  /* List */
  background-color: ${({ theme }) => theme.colors.lighterBackground};
  border-radius: ${({ theme }) => theme.sizes.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.lighterBackground};
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  left: 2rem;
  line-height: 18px;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 10rem;
  z-index: 1;

  /* responsive */
  @media screen and (max-width: ${SIZE.md}) {
    box-shadow: ${({ theme }) => theme.shadows.default};
    left: auto;
    right: 2rem;
  }
`
type MenuProps = { action: LimitOrderAction }
const MenuItem = styled.div<MenuProps>`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border2};
  color: ${({ theme, action }) =>
    action === 'close' ? theme.colors.error : COLORS.darkSage};
  line-height: 3rem;
  padding: 0 1rem;

  &:last-of-type {
    border: 0;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.border};
  }
`

type ViewProps = {
  status?: LimitOrderStatus
  disableFill?: boolean
  onActionSelect?: (action: LimitOrderAction) => void
}

const LimitOrderItemMenu = ({
  disableFill = false,
  status = 'open',
  onActionSelect = noOp,
}: ViewProps) => {
  const $menuRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const actions = useMemo(
    () =>
      disableFill
        ? STATUS_ACTIONS[status].filter((a) => a.text !== FILL)
        : STATUS_ACTIONS[status],
    [disableFill],
  )
  const hideMenu = () => setVisible(false)
  const toggleMenu = () => setVisible(!visible)
  const actionMenu = (action: LimitOrderAction) => {
    onActionSelect(action)
    hideMenu()
  }

  useBlur($menuRef, hideMenu)

  return (
    <Container ref={$menuRef} onClick={visible ? noOp : toggleMenu}>
      <DotsContainer onClick={toggleMenu}>
        {[0, 0, 0].map((o, i) => (
          <Dot key={i} />
        ))}
      </DotsContainer>

      {visible && (
        <MenuContainer
          unwrapChildren
          data={actions}
          itemText={(d: StatusAction) => (
            <MenuItem
              tabIndex={-1}
              role='button'
              onClick={() => actionMenu(d.do)}
              key={d.text}
              action={d.do}
            >
              {d.text}
            </MenuItem>
          )}
        />
      )}
    </Container>
  )
}

export default LimitOrderItemMenu
